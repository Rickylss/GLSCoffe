// pages/pay/pay.js
var api = require('../../../navigator/api.js')
var constant = require("../../../utils/constant.js");
var util = require("../../../utils/util.js")
var app = getApp();
var QQMapWX = require('../../../lib/qqmap-wx-jssdk.js');
var qqmapsdk;
var mapID = "coffeMap";
var defaultScale = 14;
var shopLatitude = '28.688697871245807';
var shopLongitude = '115.97130918514567';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chosedAddress: {
      "default": false,
      "addressId": 1,
      "costomerName": "肖海飚",
      "gender": 1,
      "phoneNumber": "2325678",
      "address": "鄱湖云科技有限公司",
    },
    loading: {
      loadingShow: false,
      loadingError: false,
    },
    switchShowUp: true,
    sendTime: "立即送出",
    arriveTime: "已送达",
    orderInfo: [
      { id: 1, name: "world", tag: "加热+加糖", price: 7, num: 1, },
      { id: 2, name: "hello", tag: "加热", price: 16, num: 1, },
      { id: 3, name: "world", tag: "加糖", price: 7, num: 1, },
      { id: 4, name: "hello", tag: "加热+加糖", price: 16, num: 1, },
      { id: 5, name: "world", tag: "加热", price: 7, num: 1, },
      { id: 6, name: "hello", tag: "加糖", price: 16, num: 1, },
      { id: 7, name: "heaadfasfllo", tag: "加热加糖", price: 32, num: 1, }
    ],
    cost: 12,
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
    qqmapsdk = new QQMapWX({ key: constant.tencentAk });
    if (app.globalData.hasLogin) {
      
    } else {
      util.toUserLogin().catch((err) => {
        console.log(err);
        wx.navigateBack({
          dlta: 1,
        })
      });
    }
  },

  onShow: function() {
    this.setData({
      chosedAddress: wx.getStorageSync('defaultAddress'),
    });
    console.log(this.data.choseAddress);
  },

  /**
   * 设置用户权限，初始化地图
   */
  scopeSetting: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      util.getSetting().then((res) => {
        if (!res.authSetting['scope.userLocation']) {
          util.authorize("scope.userLocation").then((res) => {
            resolve(res);
          }).catch((err) => {
            wx.showModal({
              title: '提示',
              content: '定位失败，您未开启定位权限，点击开启定位权限',
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: function (res) {
                      if (res.authSetting['scope.userLocation']) {
                        resolve(res);
                      } else {
                        reject();
                        console.log("用户未同意地理位置权限");
                      }
                    }
                  });
                }
              }
            })
          });
        } else {
          resolve(res);
        }
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
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
          var mapCtx = wx.createMapContext(mapID);
          mapCtx.moveToLocation();
          that.calculateDistance();
          that.regeocodingAddress();
          resolve();
        },
        fail: function (err) {
          reject(err);
        }
      })
    });
  },

  /**
   * 计算距离
   */
  calculateDistance: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      qqmapsdk.calculateDistance({
        from: {
          latitude: that.data.mapInfo.latitude,
          longitude: that.data.mapInfo.longitude,
        },
        to: [
          {
            latitude: that.data.mapInfo.shopInfo[0].latitude,
            longitude: that.data.mapInfo.shopInfo[0].longitude,
          }
        ],
        success: function (res) {
          var distance = res.result.elements[0].distance;
          if (distance < 1000) {
            var distanceStr = "距您" + distance + "m";
          } else {
            var distanceStr = "距您" + ((distance * 1.000) / 1000) + "km";
          }
          that.setData({
            'mapInfo.shopInfo[0].callout.content': distanceStr,
          });
          resolve();
        },
        fail: function (error) {
          reject(error);
        },
        complete: function (res) {
          console.log(that.data.mapInfo.shopInfo[0].callout.content);
        }
      });
    });
  },

  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: that.data.mapInfo.shopInfo[0].latitude,
          longitude: that.data.mapInfo.shopInfo[0].longitude
        },
        success: function (res) {
          that.setData({
            'mapInfo.shopLocation': res.result.address,
          });
          resolve();
        },
        fail: function (err) {
          reject(err);
        },
        complete: function (res) {
          console.log(res);
        }
      });
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
        this.scopeSetting().then(() => {
          this.initMap();
        });
      }
      this.setData({
        switchShowUp: false,
      });
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