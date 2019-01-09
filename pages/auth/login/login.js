// pages/auth/login/login.js
var user = require('../../../utils/user.js');

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 跳转至账号登陆 url: /pages/auth/accountLogin/accountLogin
   */
  accountLogin: function () {
    wx.navigateTo({
      url: "/pages/auth/accountLogin/accountLogin"
    });
  },

  /**
   * 获取用户信息后，保存信息登陆后台
   */
  wxLogin: function (e) {
    if (e.detail.userInfo == undefined){
      app.globalData.hasLogin = false;
      console.log("微信登陆失败");
    }
    user.checkLogin().then(() => {
      console.log("用户已登陆");
    }).catch(() => {
      
      user.loginByWeixin(e.detail.userInfo).then(res => {
        app.globalData.hasLogin = true;
        wx.navigateBack({
          delta: 1
        });
      }).catch((err) => {
        app.globalData.hasLogin = false;
        console.log("微信登陆失败");
      });

    }).catch((err) => {
      app.globalData.hasLogin = false;
      console.log("微信登陆失败");
    });
  },

})