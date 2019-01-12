// pages/ucenter/address/setAddress/setAddress.js
var api = require("../../../../navigator/api.js");
var util = require("../../../../utils/util.js");
var map = require("../../../../utils/map.js");
var app = getApp();
var localAddress;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdd: true,
    addressId: '',
    addressInfo: {
      gender: 1,
    },
    loading: {
      loadingShow: true,
      loadingError: false,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //type 1 更新
    if(1 == options.type){
      if(options.id){
        that.setData({
          isAdd: false,
          addressId: options.id,
        });
      }else{
        console.log("获取addressid失败");
        wx.navigateBack({
          dlta: 1,
        })
      }
    }else if(0 == options.type) { //type 0 添加
      that.setData({
        isAdd: true,
        addressId: '',
      });
    }else{
      console.log("设置地址类型出错");
      wx.navigateBack({
        dlta: 1,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.addressId){
      this.getAddressInfo();
    }

    if(this.data.isAdd){
      this.getUserLocation().then(()=>{
        this.setData({
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
      }).catch((err)=>{
        this.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
      });
    }
  },

  /**
   * 获取用户当前定位
   */
  getUserLocation: function() {
    var that = this;
    return new Promise(function(resovle, reject){
      map.scopeSetting().then((res) => {
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            localAddress = res;
            map.regeocodingAddress(res).then((ret) => {
              var component = ret.result.address_component;
              var addressRegion = [component.province, component.city, component.district];
              var address = component.street + component.street_number;
              that.setData({
                'addressInfo.region': addressRegion,
                'addressInfo.address': address,
              });
              resovle();
            }).catch((err) => {
              console.log(err);
              reject(err);
            });
          },
        })
      }).catch((err) => {
        wx.showToast({
          title: '获取地址失败',
          duration: 1500,
          mask: false,
          image: "../../../../images/gantan.png",
        })
        console.log("获取用户地址失败");
        reject(err);
      });
    });
  },

  
  /**
   * 获取地址信息
   */
  getAddressInfo: function() {
    var that = this;
    return new Promise(function(resovle, reject){
      util.request(api.GetAddressById,{
        addressId: that.data.addressId,
      },"POST").then((res)=>{
        if(res){
          that.setData({
            addressInfo: res,
            'loading.loadingShow': false,
            'loading.loadingError': false,
          });
          console.log(res);
        }
      }).catch((err)=>{
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
        console.log(err);
      });
    });
  },

  /**
   * bind 地址信息
   */
  bindAddressInput: function(e){
    this.setData({
      'addressInfo.address': e.detail.value,
    })
  },

  /**
  * bind 联系人信息
  */
  bindCostomerNameInput: function (e) {
    this.setData({
      'addressInfo.costomerName': e.detail.value,
    })
  },

  /**
   * radio信息改变
   */
  radioChange: function(e) {
    if (e.detail.value){
      this.setData({
        'addressInfo.gender': parseInt(e.detail.value),
      });
      console.log(this.data.addressInfo.gender);
    }
  },

  /**
  * bind 手机号信息
  */
  bindPhoneNumberInput: function (e) {
    this.setData({
      'addressInfo.phoneNumber': e.detail.value,
    })
  },

  /**
   * 设为默认地址
   */
  defaultChange: function(e) {
    var flag = !this.data.addressInfo.default;
    if (e.detail.value){
      this.setData({
        'addressInfo.default': flag,
      });
    }
  },

  /**
   * 删除该地址信息
   */
  deleteAddress: function(){
    wx.showModal({
      title: '',
      content: '删除地址信息后无法恢复，是否删除地址？',
      confirmText: "删除",
      confirmColor: "#B76C25",
      success: function(res){
        if (res.confirm){
          util.request(api.DeleteAddressById,{
            addressId: 1,
          },"DELETE").then((res)=>{
            wx:wx.navigateBack({
              delta: 1,
            })
          }).catch((err)=>{
            console.log(err);
          });
        }
      }
    })
  },

  /**
   * 判断地址信息
   */
  checkAddress: function() {
    var that = this;
    return new Promise(function(resolve, reject){
      var address = that.data.addressInfo;
      var message = '';
      map.calculateDistance(localAddress).then((res) => {
        if (res > 10000) {
          message = '超出配送距离';
          reject(message);
        } else if (!address.address) {
          message = "地址不能为空";
          reject(message);
        } else if (!address.costomerName) {
          message = "请填写联系人";
          reject(message);
        } else if (!address.phoneNumber) {
          message = "请填写手机号";
          reject(message);
        } else if (address.phoneNumber.length < 11) {
          message = "手机号应为11位";
          reject(message);
        } else{
          resolve();
        }
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  },

  /**
   * 更新该地址信息
   */
  updateAddress: function() {

    this.checkAddress().then((res)=>{
      util.request(api.UpdateAddressById, {
        addressId: 1,
      }, "PUT").then((res) => {
        wx: wx.navigateBack({
          delta: 1,
        })
      }).catch((err) => {
        console.log(err);
      });
    }).catch((message)=>{
      if (message) {
        wx.showToast({
          title: message,
          duration: 1500,
          mask: false,
          image: "../../../../images/gantan.png",
        })
      }
    });
  },

  /**
   * 地址选择器
   */
  bindRegionChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      'addressInfo.region': e.detail.value,
      'addressInfo.address': '',
    })
  },
})