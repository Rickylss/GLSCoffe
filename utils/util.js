var app = getApp();

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封装微信登陆request
 */
function request(url, data={}, method="GET") {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-candyfloss-Token': wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data.errno == 501) {
            //TODO
            reject(res.errno);
          } else {
            resolve(res.data);
          }

        } else {
          reject(res.errMsg);
        }
      },
      fail: function(err) {
        reject(err);
      }
    })
  });
}

/**
 * 跳转至用户登陆
 */
function toUserLogin() {
  return new Promise(function(resolve, reject){
    wx.showModal({
      title: '未登录',
      content: '是否先登陆小程序',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/auth/login/login',
          })
          resolve();
        } else {
          console.log("用户拒绝登录");
          reject();
        }
      },
      fail: function (err) {
        console.log(err);
        reject(err);
      }
    })
  });
}

/**
 * 封装获取权限
 */
function getSetting() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: function(res){
        resolve(res);
      },
      fail: function(err){
        reject(err);
      }
    })
  });
}

/**
 * 封装设置权限
 */
function authorize(theScope) {
  return new Promise(function (resolve, reject) {
    wx.authorize({
      scope: theScope,
      success: function(){
        resolve();
      }, 
      fail: function(){
        reject();
      }
    })
  });
}

module.exports = {
  formatTime: formatTime,
  request: request,
  getSetting: getSetting,
  authorize: authorize,
  toUserLogin: toUserLogin,
}
