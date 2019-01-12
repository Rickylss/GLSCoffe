// pages/list/list.js
var util = require("../../../utils/util.js")
var api = require('../../../navigator/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    cartList: [
      { name: "world", price: 7 },
      { name: "hello", price: 16 },

      { name: "heaadfasfllo", price: 32 }
    ],
    hasLoading: false,
    showCart: false,
    scrollHidBanner: {
      showBanner: true,
    },
    count: 12,
    okToSend: 10,
    shortCut: "下单立减31元，再买12可减41元",
    winHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight,
    });
    wx.showLoading({
      title: '努力加载中',
    });
    util.request(api.GetList,
      {}, "GET").then((res) => {
        console.log(res)
        wx.hideLoading();
        this.setData({
          listData: res,
          hasLoading: true
        });
      }).catch((err) => {
        console.log('load failed');
        this.setData({
          hasLoading: false
        });
      });
  },

  /**
   * 滑动右侧list
   */
  scrollRightMenu: function (e) {
    if (e.detail.scrollTop > 300) {
      this.setData({
        'scrollHidBanner.showBanner': false
      })
    } else {
      this.setData({
        'scrollHidBanner.showBanner': true
      })
    }
  },

  /**
   * 点击购物车
   */
  showCartList: function () {
    if (this.data.cartList.length != 0) {
      this.setData({
        showCart: !this.data.showCart
      });
    }
  },

  /**
   * 清空购物车
   */
  clearCartList: function () {
    console.log("clear cartlist success")
    this.setData({
      cartList: [],
      count: 0,
      showCart: false,
    })
  },

  /**
   * 点击付款
   */
  pay: function () {
    if (this.data.cartList.length != 0) {
      wx.navigateTo({
        url: '/pages/shopcenter/payment/payment',
      })
    }
  },
})