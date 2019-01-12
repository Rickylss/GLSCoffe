var constant = require("./constant.js");
var util = require("./util.js");
var QQMapWX = require('../lib/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({ key: constant.tencentAk });
var defaultScale = constant.defaultScale;
var shopLocation = constant.shopLocation;

/**
 * 设置用户权限
 */
function scopeSetting() {
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
}

/** 
* 初始化地图
*/
function initMap() {
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
}

/**
 * 计算距离
 */
function calculateDistance(localAddress) {
  var that = this;
  return new Promise(function (resolve, reject) {
    qqmapsdk.calculateDistance({
      from: {
        latitude: localAddress.latitude,
        longitude: localAddress.longitude,
      },
      to: shopLocation,
      success: function (res) {
        var distance = res.result.elements[0].distance;
        resolve(distance);
      },
      fail: function (error) {
        reject(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  });
}

/**
  * 逆地址解析
  */
function regeocodingAddress(localAddress) {
  return new Promise(function (resolve, reject) {
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: localAddress.latitude,
        longitude: localAddress.longitude
      },
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  });
}

module.exports = {
  scopeSetting,
  initMap,
  calculateDistance,
  regeocodingAddress,
};