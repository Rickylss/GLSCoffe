// pages/ucenter/address/setAddress/setAddress.js
var api = require("../../../../navigator/api.js");
var util = require("../../../../utils/util.js");
var constant = require("../../../../utils/constant.js");
var map = require("../../../../utils/map.js");
var app = getApp();
var areaRadius = constant.areaRadius;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {
      gender: 1,
      isDefault: false,
    },
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    gotLocation: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.id) {
      that.setData({
        'address.id': options.id,
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.address.id>0) {
      this.getAddressInfo();
    } else if (!this.data.gotLocation) {
      this.getUserLocation();
    }
  },

  onHide: function() {
    if(!this.data.gotLocation){
      this.setData({
        gotLocation: true,
      })
    }
  },

  /**
   * 获取用户当前定位
   */
  getUserLocation: function() {
    var that = this;
    map.scopeSetting().then((res) => {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          map.regeocodingAddress(res).then((ret) => {
            var component = ret.result.address_component;
            var addressRegion = [component.province, component.city, component.district];
            var address = component.street + component.street_number;
            that.setData({
              'address.region': addressRegion,
              'address.address': address,
              'loading.loadingShow': false,
              'loading.loadingError': false,
            });
          }).catch((err) => {
            that.setData({
              'loading.loadingShow': false,
              'loading.loadingError': true,
            });
            console.log("getUserLocation: 逆地址解析出错。");
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
    });
  },
  
  /**
   * 获取地址信息
   */
  getAddressInfo: function() {
    var that = this;
    util.request(api.GetAddressById, {
      id: that.data.address.id,
    }, "GET").then((res) => {
      if (res.errno == 0) {
        that.setData({
          address: res.data,
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
      }
    }).catch((err)=>{
      that.setData({
        'loading.loadingShow': false,
        'loading.loadingError': true,
      });
      console.log("getAddressInfo: 获取地址信息出错。");
    });
  },

  /**
   * 删除该地址信息
   */
  deleteAddress: function(){
    var that = this;
    var address = that.data.address;
    wx.showModal({
      title: '',
      content: '删除地址信息后无法恢复，是否删除地址？',
      confirmText: "删除",
      confirmColor: "#B76C25",
      success: function(res){
        if (res.confirm){
          util.request(api.DeleteAddressById,{
            id: address.id,
          },"DELETE").then((res)=>{
            wx.navigateBack({
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
   * 更新该地址信息
   */
  updateAddress: function() {
    var that = this;
    var address = that.data.address;
    this.checkAddress().then((res)=>{
      util.request(api.SaveAddress, {
        id: address.id,
        name: address.name,
        gender: address.gender,
        province: address.region[0],
        city: address.region[1],
        district: address.region[2],
        mobile: address.mobile,
        address: address.address,
        isDefault: address.isDefault
      }, "POST").then((res) => {
        wx.navigateBack({
          delta: 1,
        })
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err)=>{
      if (err) {
        wx.showToast({
          title: err,
          duration: 1500,
          mask: false,
          image: "../../../../images/gantan.png",
        })
      }
    });
  },

  /**
   * 从微信地址中添加地址
   */
  addAddressFromWX: function(){
    util.getSetting().then((res)=>{
      if (!res.authSetting['scope.address']){
        util.authorize("scope.address").then((res)=>{
          this.addAddressByWX();
        }).catch(()=>{
          wx.showModal({
            title: '提示',
            content: '获取微信地址失败，您未开启地址权限，点击开启',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting['scope.address']) {
                      this.addAddressByWX();
                    } else {
                      console.log("用户未同意微信地址权限");
                    }
                  }
                });
              }
            }
          })
        });
      }else{
        this.addAddressByWX();
      }
    });
  },

  /**
   * 设置微信地址至本地
   */
  addAddressByWX: function(){
    var that = this;
    wx.chooseAddress({
      success: function (res) {
        that.setData({
          "address.name": res.userName,
          "address.mobile": res.telNumber,
          "address.region": [res.provinceName,res.cityName,res.countyName],
          "address.address": res.detailInfo,
        });
      },
      fail: function (err) {
        console.log(err);
      },
    })
  },

  /**
 * 判断地址信息
 */
  checkAddress: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      var message = '';
      var address = that.data.address;
      var addressStr = address.region.join("+") + address.address;
      map.geocoder(addressStr).then((localAddress) => {
        map.calculateDistance(localAddress).then((res) => {
          if (res > areaRadius) {
            message = '超出配送距离';
            reject(message);
          } else if (!address.address) {
            message = "地址不能为空";
            reject(message);
          } else if (!address.name) {
            message = "请填写联系人";
            reject(message);
          } else if (!address.mobile) {
            message = "请填写手机号";
            reject(message);
          } else if (address.mobile.length < 11) {
            message = "手机号应为11位";
            reject(message);
          } else {
            resolve();
          }
        }).catch((err) => {
          console.log(err);
          reject();
        });
      });
    });
  },

  /**
 * bind 地址信息
 */
  bindAddressInput: function (e) {
    this.setData({
      'address.address': e.detail.value,
    })
  },

  /**
  * bind 联系人信息
  */
  bindCostomerNameInput: function (e) {
    this.setData({
      'address.name': e.detail.value,
    })
  },

  /**
   * radio信息改变
   */
  radioChange: function (e) {
    var gender = parseInt(e.detail.value)
    this.setData({
      'address.gender': gender,
    });
  },

  /**
  * bind 手机号信息
  */
  bindPhoneNumberInput: function (e) {
    this.setData({
      'address.mobile': e.detail.value,
    })
  },

  /**
   * 设为默认地址
   */
  defaultChange: function (e) {
    var flag = !this.data.address.isDefault;
    if (e.detail.value) {
      this.setData({
        'address.isDefault': flag,
      });
    }
  },

  /**
 * 地址选择器
 */
  bindRegionChange(e) {
    this.setData({
      'address.region': e.detail.value,
      'address.address': '',
    })
  },
})