// pages/map/map.js
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
    transport: 0,
    showPanel: false,
    mapInitReady: false,
    distance: 0,
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
          borderColor: "B76C25",
          bgColor: "#ffffff",
          padding: 10,
          textAlign: 'center',
          content: "",
        },
      }],
      include: [{
        latitude: '',
        longitude: '',
      },{
        latitude: constant.shopLatitude,
        longitude: constant.shopLongitude,
      }],
      polyline: [],
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(!this.data.mapInitReady){
      map.scopeSetting().then(() => {
        that.initMap().then(() => {
          var localAddress = {
            latitude: that.data.mapInfo.latitude,
            longitude: that.data.mapInfo.longitude,
          };
          map.calculateDistance(localAddress).then((res) => {
            if (res < 1000) {
              var distanceStr = "距您" + res + "m";
            } else {
              var distanceStr = "距您" + ((res * 1.000) / 1000) + "km";
            }
            that.setData({
              'mapInfo.shopInfo[0].callout.content': distanceStr,
              mapInitReady: true,
            });
            console.log(distanceStr);
          });
        });
      }).catch();
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
            'mapInfo.include[0].latitude': res.latitude,
            'mapInfo.include[0].longitude': res.longitude,
          });
          // console.log(that.data.mapInfo);
          var mapCtx = wx.createMapContext(that.data.mapInfo.mapID);
          // mapCtx.moveToLocation();
          mapCtx.includePoints({
            points: that.data.mapInfo.include,
            padding: [80, 80, 80, 80],
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
  * 回到定位点
  */
  selfLocationClick: function () {
    var that = this;
    //还原默认缩放级别
    that.setData({
      'mapInfo.scale': constant.defaultScale,
    })
    var mapCtx = wx.createMapContext(that.data.mapInfo.mapID);
    mapCtx.moveToLocation();
    wx.openLocation({
      latitude: that.data.mapInfo.latitude,
      longitude: that.data.mapInfo.longitude,
      scale: 18,
    })
  },

  /**
   * 开始导航
   */
  startNav: function () {
    this.setData({
      showPanel: true,
    });
    this.choseTransport();
    this.selfLocationClick();
  },

  /**
   * 显示panel
   */
  hidPanel: function(){
    this.setData({
      showPanel: false,
    });
  },

  /**
   * 选择交通方式
   */
  choseTransport: function(e) {
    var that = this;
    var index = '';
    if(e){
      index = e.currentTarget.dataset.index;
      that.setData({
        transport: index,
      });
    }else{
      index = this.data.transport;
    }

    this.getPoly(index).then((res)=>{
      if (!res.result.routes[0].polyline){
        that.setData({
          distance: 0,
          'mapInfo.polyline': []
        });
        return;
      }
      var pl = [];
      var coors = res.result.routes[0].polyline;
      var kr = 1000000;
      for (var i=2; i<coors.length; i++) {
        coors[i] = Number(coors[i-2]) + Number(coors[i])/kr;
      }
      for (var i=0; i<coors.length; i+=2){
        pl.push({latitude: coors[i], longitude:coors[i+1]})
      }
      that.setData({
        distance: res.result.routes[0].distance,
        'mapInfo.polyline': [{
          points: pl,
          color: "#0328ff8f",
          width: 4
        }]
      });
      console.log(res);
    });
  },

  /**
   * 封装路线请求
   */
  getPoly: function(transport) {
    var that = this;
    return new Promise(function(resolve, reject){
      var apiStr = '';
      var local = that.data.mapInfo.latitude+ ','+ that.data.mapInfo.longitude;
      if (transport == 0){
        apiStr = api.GetDrivePoly;
      }else if(transport == 1){
        apiStr = api.GetWalkPoly;
      }else if(transport == 2){
        apiStr = api.GetBusPoly;
      }else{
        console.log("未知交通方式");
        reject();
      }
      apiStr = apiStr + '?from=' + local + '&to=' + constant.shopLocation + '&key=' + constant.tencentAk;
      util.request(apiStr,{},"GET").then((res)=>{
        resolve(res)
      }).catch((err)=>{
        console.log(err);
        reject(err);
      });
    });
  },
})