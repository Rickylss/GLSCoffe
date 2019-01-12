// pages/orders/orders.js
var app = getApp();
var util = require("../../../utils/util.js");
var api = require("../../../navigator/api.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasOrder: true,
    orderList: [],
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    loadingMore: false,
    pageIndex: 5,
  },

  onShow: function (options) {
    var that = this;
    if (app.globalData.hasLogin) {
      that.getOrderList();
    } else {
      util.toUserLogin().catch((err) => {
        wx.navigateBack({
          delta: 1,
        });
        console.log(err);
      });
    }
  },

  onReachBottom: function() {
    var that = this;
    that.setData({
      loadingMore: true,
      pageIndex: that.data.pageIndex + 5,
    });
    this.getOrderListMore();
  },

  /**
   * 获取订单信息
   */
  getOrderList: function () {
    var that = this;
    util.request(api.GetOrderList,
      {
        pageIndex: that.data.pageIndex,
        userId: wx.getStorageSync("userInfo").userId,
        token: wx.getStorageSync("token"),
      }, "POST").then((res) => {
        that.setData({
          orderList: res,
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
        console.log("获取所有订单信息成功");
      }).catch((err) => {
        that.setData({
          hasOrder: false,
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
        console.log(err);
      });
  },

  /**
 * 获取更多订单信息
 */
  getOrderListMore: function () {
    var that = this;
    util.request(api.GetOrderList2,
      {
        pageIndex: that.data.pageIndex,
        userId: wx.getStorageSync("userInfo").userId,
        token: wx.getStorageSync("token"),
      }, "POST").then((res) => {
        if (res){
          that.setData({
            orderList: this.data.orderList.concat(res),
            loadingMore: false,
          });
        }
        console.log("获取所有订单信息成功");
      }).catch((err) => {
        that.setData({
          loadingMore: false,
        });
        console.log(err);
      });
  },

  /**
  * 开始点单
  */
  tapOrder: function () {
    if (!this.data.hasOrder) {
      wx.navigateTo({
        url: '../../shopcenter/index/index',
      });
    }
  },

  /**
   * 订单详情
   */
  gotoOrder: function (e) {
    if (e.currentTarget.dataset.orderid) {
      wx.navigateTo({
        url: '/pages/ordercenter/order/order?id=' + e.currentTarget.dataset.orderid,
      })
    } else {
      console.log("未能获取当前orderid");
    }
  }
})
