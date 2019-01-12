// pages/order/order.js
var api = require("../../../navigator/api.js");
var map = require("../../../utils/map.js");
var constant = require("../../../utils/constant.js");
var util = require("../../../utils/util.js")

var mapID = "coffeMap";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    finished: false,
    finished_text: '订单已完成',

    takeselfTime: "12:00",
    takeselfPhone: "121313432325",

    showOrderType: false,
    orderType: "外卖配送",
    sendTime: "立即送出",
    arriveTime: "已送达",
    remark: "多放点盐你好我好大家好大家好大家好大家好大家好你好我好大家我号",
    invoiceInfo: {
      type: '0',
      title: '航天鄱湖云科技有限公司',
      taxNumber: '21352352364236f',
      companyAddress: '',
      telephone: '',
      bankName: '',
      bankAccount: '',
    },
    address: {
      location: '南昌大学',
      name: '黄(女士)',
      phone: '123456789',
    },
    orderInfo: [
      { name: "coffee", cost: "9.00", amount: "1", remark: "少糖+加冰" },
      { name: "boo", cost: "15.00", amount: "1", remark: "少糖" },
      { name: "jiuce", cost: "15.00", amount: "1", remark: "少糖" },
      { name: "jiuce", cost: "34.00", amount: "34", remark: "少糖+加冰" },
      { name: "jiuce", cost: "20.00", amount: "4", remark: "少糖" },
      { name: "kill", cost: "3.00", amount: "1", remark: "少糖" },
      { name: "jiuce", cost: "76.00", amount: "4", remark: "少糖" },
      { name: "laaa", cost: "34.00", amount: "4", remark: "少糖" }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options.id);
    util.request(api.GetOrderById,
      {
        user: wx.getStorageSync("userInfo").userId,
        orderId: options.id,
      }, "POST").then((res) => {
        if (res) {
          that.setData({
            finished: res.isFinished,
            showOrderType: res.orderType,
            orderinfo: res.orderInfo,
          });
        }
      }).catch();

    if (!this.data.finished) {
      this.setData({
        finished_text: "订单进行中",
      });
    }

    if (!this.data.showOrderType) {
      this.setData({
        orderType: "到店自取",
      });
    }
  },
})