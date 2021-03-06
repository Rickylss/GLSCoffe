// pages/ucenter/address/address.js
var api = require("../../../navigator/api.js");
var util = require("../../../utils/util.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList:[],
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    choseFlag: false,
  },

  onLoad: function(option) {
    if (option.mode =="choseAddress"){
      this.setData({
        choseFlag: true,
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if(app.globalData.hasLogin) {
      util.request(api.GetAddressList,{},
      "GET").then((res)=>{
        if(res.errno == 0 && res.data) {
          that.setData({
            addressList: res.data,
          });
        }
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
      }).catch((err)=> {
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
        console.log(err);
      });
    }else{
      util.toUserLogin().catch((err)=>{
        console.log(err);
        wx.navigateBack({
          dlta: 1,
        })
      });
    }
  },

  /**
   * 添加地址
   */
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/ucenter/address/setAddress/setAddress",
    })
  },

  /**
   * 更新地址信息
   */
  updateAddress: function(e) {
    var id = e.currentTarget.dataset.addressid;
    if(id) {
      wx.navigateTo({
        url: '/pages/ucenter/address/setAddress/setAddress?id='+id,
      })
    }
  },

  /**
   * 选择地址
   */
  choseAddress: function(e) {
    if(this.data.choseFlag) {
      var defaultAddress = this.data.addressList[e.currentTarget.dataset.index];
      wx.setStorageSync('defaultAddress', defaultAddress);
      wx.navigateBack({
        dlta: 1,
      })
    }
  },
})