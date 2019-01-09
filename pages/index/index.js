//index.js
var util = require("../../utils/util.js")
var api = require('../../navigator/api.js')

Page({
  data: {
    banners:[],
    loading:{
      loadingShow: true,
      loadingError: false,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.request(api.GetIndexBanner,
    {},"GET").then((res) => {
      if(res) {
        this.setData({
          banners: res,
          'loading.loadingShow': false,
          'loading.loadingError': false
        });
      }
    }).catch((err) => {
      this.setData({
        banners: [],
        'loading.loadingShow': false,
        'loading.loadingError': true
      });
      console.log(err);
    });
  },

  /**
   * 点击banner查看活动
   */
  tapBanner: function(e) {
    if (e.currentTarget.dataset.navigate){
      wx.navigateTo({
        url: e.currentTarget.dataset.navigate,
      })
    }
  },

  /**
   * 自助点单
   */
  tapBuy: function(e) {
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },

  /**
   * 点击查看订单
   */
  tapOrder: function(e) {
    wx.navigateTo({
      url: '/pages/order/order',
    })
  },

  /**
   * 点击查看我的
   */
  tapMy: function(e) {
    wx.navigateTo({
      url: '/pages/my/my',
    })
  },
})
