// pages/order/order.js
var api = require("../../../navigator/api.js");
var map = require("../../../utils/map.js");
var constant = require("../../../utils/constant.js");
var util = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapInfo: {
      latitude: '',
      longitude: '',
      subKey: constant.tencentAk,
      mapID: constant.mapID,
      scale: constant.defaultScale,
      shopLocation: constant.shopLocationStr,
      shopInfo: [{
        iconPath: '../../../images/dog-select.png',
        id: 0,
        latitude: constant.shopLatitude,
        longitude: constant.shopLongitude,
        width: 50,
        height: 50,
        callout: {
          display: 'ALWAYS',
          fontSize: 16,
          borderRadius: 10,
          borderColor: "#000000",
          bgColor: "#ffffff",
          padding: 10,
          textAlign: 'center',
          content: "",
        },
      }],
    },
    orderInfo: {},
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    couponInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(options.id){
      util.request(api.GetOrderById,
        {
          user: wx.getStorageSync("userInfo").userId,
          orderId: options.id,
        }, "POST").then((res) => {
          if(res.couponId){
            that.getCoupon(res.couponId);
          }
          if (res) {
            that.setData({
              orderInfo: res,
              'loading.loadingShow': false,
              'loading.loadingError': false,
            });
          }
          if (!res.finished && 0 == res.orderType) {
            that.getUserLocation();
          }

        }).catch((err)=>{
          console.log(err);
          that.setData({
            'loading.loadingShow': false,
            'loading.loadingError': true,
          });
        });
    }

  },

  /**
   * 获取优惠券信息
   */
  getCoupon: function(couponId) {
    var that = this;
    util.request(api.GetUsedCouponByID,{
      id: couponId
    },"POST").then((res)=>{
      if(res){
        that.setData({
          couponInfo: res,
        });
      }
    }).catch();
  },

  /**
   * 获取当前地址
   */
  getUserLocation: function() {
    var that = this;
    map.scopeSetting().then(()=>{
      that.initMap().then(()=>{
        var localAddress = {
          latitude: that.data.mapInfo.latitude, 
          longitude: that.data.mapInfo.longitude
          };
        map.calculateDistance(localAddress).then((res)=>{
          if (res < 1000) {
            var distanceStr = "距您" + res + "m";
          } else {
            var distanceStr = "距您" + ((res * 1.000) / 1000) + "km";
          }
          that.setData({
            'mapInfo.shopInfo[0].callout.content': distanceStr,
          });
        });
      });
    }).catch((err)=>{
      console.log(err);
    });
  },

  /**
   * 初始化地图
   */
  initMap: function() {
    var that = this;
    return new Promise(function(resolve, reject){
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          that.setData({
            'mapInfo.latitude': res.latitude,
            'mapInfo.longitude': res.longitude,
          });
          console.log(that.data.mapInfo);
          var mapCtx = wx.createMapContext(that.data.mapInfo.mapID);
          mapCtx.moveToLocation();
          resolve();
        },
        fail: function (err) {
          reject(err);
          console.log(err);
        }
      })
    });
  },

  /**
   * 显示大地图
   */
  bindShowFullMap: function() {
    wx.navigateTo({
      url: '/pages/shopcenter/map/map',
    })
  },
})