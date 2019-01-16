// pages/my/my.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: "../../../images/avatar.png",
      nickName: "点击登陆",
    },
    hasLogin: false,
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取用户的登录信息
    if (app.globalData.hasLogin) {
      var userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasLogin: true
      });
    }
  },

  /**
   * 点击登陆
   */
  goLogin: function () {
    if (!this.data.hasLogin) {
      wx.navigateTo({
        url: '/pages/auth/login/login',
      })
    }
  },

  /**
   * 点击地址
   */
  tapAddress: function () {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },

  /**
 * 点击会员
 */
  tapVIP: function () {
    wx.navigateTo({
      url: '/pages/ucenter/vip/vip',
    })
  },

  /**
 * 点击优惠券
 */
  tapCoupon: function () {
    wx.navigateTo({
      url: '/pages/ucenter/coupon/coupon',
    })
  },

  /**
   * 点击关于
   */
  tapAbout: function () {
    wx.navigateTo({
      url: '/pages/ucenter/about/about',
    })
  },
})