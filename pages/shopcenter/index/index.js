// pages/list/list.js
var util = require("../../../utils/util.js")
var api = require('../../../navigator/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: {
      showBanner: true,
      url: "../../../images/2-1.jpg",
    },
    listData: [],
    cartList: [
      { id: 1, name: "world", tag:"加热加糖", price: 7, num: 1, },
      { id: 2, name: "hello", tag: "加热",price: 16, num: 1,},
      { id: 3, name: "world", tag: "加糖",price: 7, num: 1,},
      { id: 4, name: "hello", tag: "加热加糖",price: 16, num: 1,},
      { id: 5, name: "world", tag: "加热",price: 7, num: 1,},
      { id: 6, name: "hello", tag: "加糖",price: 16, num: 1,},
      { id: 7, name: "heaadfasfllo", tag: "加热加糖",price: 32, num: 1, }
    ],
    hasLoading: false,
    showCart: false,
    count: 12,
    okToSend: 10,
    shortCut: "下单立减31元，再买12可减41元",
    listHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    this.caclHeight().then((res)=>{
      this.setData({
        listHeight: wx.getSystemInfoSync().windowHeight - res,
      });
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
   * 计算剩余可用高度
   */
  caclHeight: function() {
    return new Promise(function(resolve, reject){
      var height = 0;
      wx.createSelectorQuery().selectAll('.height').boundingClientRect(function (rects) {
        rects.forEach(function (rect) {
          height += rect.height;
        })
        resolve(height)
      }).exec();
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
    });
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