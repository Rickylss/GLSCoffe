// pages/pay/pay.js
var api = require('../../../navigator/api.js')
var constant = require("../../../utils/constant.js");
var util = require("../../../utils/util.js")
var map = require("../../../utils/map.js")
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chosedAddress: {},
    loading: {
      loadingShow: false,
      loadingError: false,
    },
    switchShowUp: true,
    sendTime: "立即送出",
    arriveTime: "已送达",
    cartInfo: {
      goodsList: [],
      cost: 0.0,
    },
    remarks: '',
    remarkPlaceholder: "饮品中规格可参阅订单中的显示，若有其他要求，请说明。",
    takeselfTime: '12:00',
    takeselfPhone: '123456789',
    mapInitReady: false,
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
  },

  onShow: function() {
    var that = this;
    if (app.globalData.hasLogin) {
      util.request(api.GetDefaultAddressByUId, {

      }, "POST").then((res) => {
        that.setData({
          cartInfo: wx.getStorageSync("cartInfo"),
          chosedAddress: res,
        });
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
  * 初始化地图
  */
  initMap: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          that.setData({
            'mapInfo.latitude': res.latitude,
            'mapInfo.longitude': res.longitude,
          });
          // console.log(that.data.mapInfo);
          var mapCtx = wx.createMapContext(that.data.mapID);
          mapCtx.moveToLocation();
          resolve();
        },
        fail: function (err) {
          reject(err);
        }
      })
    });
  },

  /**
   * 显示大地图
   */
  bindShowFullMap: function () {
    wx.navigateTo({
      url: '/pages/shopcenter/map/map',
    })
  },

  /**
   * 点击外卖配送
   */
  bindTakeaway: function () {
    if (!this.data.switchShowUp) {
      this.setData({
        switchShowUp: true,
      });
    }
  },

  /**
   * 点击自取
   */
  bindTakeself: function () {
    if (this.data.switchShowUp) {
      if (!this.data.mapInitReady) {
        this.setData({
          switchShowUp: false,
          mapInitReady: true,
        });
        map.scopeSetting().then(() => {
          this.initMap().then(()=>{
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
                switchShowUp: false,
                mapInitReady: true,
              });
            });
          });
        });
      }
    }
  },

  /**
   * 调用微信支付
   */
  pay: function (res) {
    console.log("pay");
  },

  /**
   * 选择收货地址
   */
  choseAddress: function () {
    wx.navigateTo({
      url: '../../ucenter/address/address?mode=choseAddress',
    })
  },
  /**
   * 绑定备注输入
   */
  bindRemarksInput: function (e) {
    this.setData({
      remarks: e.detail.value
    })
  },

  /**
   * 选择取货时间
   */
  choseTime: function () {

  },

  /**
   * 选择预留电话
   */
  chosePhone: function () {

  },
})