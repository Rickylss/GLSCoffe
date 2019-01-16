// pages/ucenter/coupon/coupon.js
var api = require("../../../navigator/api.js");
var util = require("../../../utils/util.js");
var app = getApp();
var toDay = new Date().setHours(0, 0, 0, 0);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList:[],
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    ruleTaped: [],
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if (app.globalData.hasLogin) {
      util.request(api.GetCouponListById, {
        userId: 1,
      }, "POST").then((res) => {
        res.rest.forEach(function(e){
          var date = new Date(e["timeBefore"]).setHours(0, 0, 0, 0);
          if(date < toDay){
            e["timeBefore"] = "已失效";
            e["timeTag"] = 0;
          }else if(date == toDay){
            e["timeBefore"] = "今日到期";
            e["timeTag"] = 1;
          }else{
            e["timeBefore"] = "有效期至：" + e["timeBefore"];
            e["timeTag"] = 2;
          }
        });
        if (res.rest) {
          that.setData({
            couponList: res.rest,
            'loading.loadingShow': false,
            'loading.loadingError': false,
          });
        }
      }).catch((err) => {
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
        console.log(err);
      });
    } else {
      util.toUserLogin().catch((err) => {
        console.log(err);
        wx.navigateBack({
          dlta: 1,
        })
      });
    }
  },

  /**
   * 使用规则
   */
  showRules: function(e) {
    var index = e.currentTarget.dataset.index;
    var ruleTapedArray = this.data.ruleTaped;
    if(index>=0) {
      ruleTapedArray[index] = !ruleTapedArray[index]
      this.setData({
        ruleTaped: ruleTapedArray,
      });
      console.log(this.data.ruleTaped[index]);
    }
  },

  /**
   * 立即使用
   */
  tapUse: function(e) {
    var categoryid = e.currentTarget.dataset.categoryid;
    if (categoryid){
      wx.navigateTo({
        url: '/pages/shopcenter/index/index?categoryid=' + categoryid,
      })
    }
  },
})