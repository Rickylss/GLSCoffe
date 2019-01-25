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
      app.globalData.hasLogin = true;
      wx.navigateBack({
        delta: 1
      });
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