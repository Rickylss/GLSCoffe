// pages/pay/pay.js
var api = require('../../../navigator/api.js')
var constant = require("../../../utils/constant.js");
var util = require("../../../utils/util.js")
var map = require("../../../utils/map.js")
var app = getApp();
var gotAddress = false;

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
          fontSize: 14,
          borderRadius: 10,
          borderColor: "#000000",
          bgColor: "#ffffff",
          padding: 5,
          textAlign: 'center',
          content: "",
        },
      }],
      include: [{
        latitude: '',
        longitude: '',
      }, {
        latitude: constant.shopLatitude,
        longitude: constant.shopLongitude,
      }],
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.hasLogin) {
      this.getAddress();
      gotAddress = true;
    } else {
      gotAddress = false;
      util.toUserLogin().catch((err) => {
        console.log(err);
        wx.navigateBack({
          dlta: 1,
        })
      });
    }
  },

  onShow: function() {
    if (!gotAddress && app.globalData.hasLogin){
      this.getAddress();
      gotAddress = true;
    }else{
      this.setData({
        chosedAddress: wx.getStorageSync("defaultAddress"),
      })
    }
    this.setData({
      cartInfo: wx.getStorageSync("cartInfo"),
    });
  },

  onHide: function() {
    if (this.data.cartInfo.goodsList.length>0){
      wx.setStorageSync('cartInfo', this.data.cartInfo);
    }
  },

  onUnload: function() {
    if (this.data.cartInfo) {
      wx.setStorageSync('cartInfo', this.data.cartInfo);
    }
  },

  getAddress: function() {
    var that = this;
    util.request(api.GetDefaultAddressByUId, {},
      "GET").then((res) => {
        that.setData({
          chosedAddress: res.data,
        });
      });
  },

  /**
   * 订单减少
   */
  minusNum: function(e) {
    var index = e.currentTarget.dataset.index;
    var goodsList = this.data.cartInfo.goodsList;
    var cost = parseFloat((this.data.cartInfo.cost * 100 - goodsList[index].price * 100) / 100).toFixed(2);
    if(--goodsList[index].num <= 0){
      goodsList.splice(index, 1);
    }

    this.setData({
      'cartInfo.goodsList': goodsList,
      'cartInfo.cost': cost,
    });
  },

  /**
   * 订单增加
   */
  addNum: function(e) {
    var index = e.currentTarget.dataset.index;
    var goodsList = this.data.cartInfo.goodsList;
    var cost = parseFloat((this.data.cartInfo.cost * 100 + goodsList[index].price * 100) / 100).toFixed(2);
    goodsList[index].num += 1;

    this.setData({
      'cartInfo.goodsList': goodsList,
      'cartInfo.cost': cost,
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
            'mapInfo.include[0].latitude': res.latitude,
            'mapInfo.include[0].longitude': res.longitude,
          });
          // console.log(that.data.mapInfo);
          var mapCtx = wx.createMapContext(that.data.mapInfo.mapID);
          mapCtx.includePoints({
            points: that.data.mapInfo.include,
            padding: [20, 20, 20, 20],
          });
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
    wx.openLocation({
      latitude: constant.shopLatitude,
      longitude: constant.shopLongitude,
      scale: constant.defaultScale,
      name: constant.shopLocationStr,
      address: constant.shopDescription,
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
    var that = this;
    if (this.data.switchShowUp) {
      this.setData({
        switchShowUp: false,
        mapInitReady: true,
      });
      if (!this.data.mapInitReady) {
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
              console.log(distanceStr);
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
    //检查起送
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