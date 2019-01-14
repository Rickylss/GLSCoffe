// pages/list/list.js
var util = require("../../../utils/util.js")
var api = require('../../../navigator/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    num: 0,
    banner: {
      showBanner: true,
      url: "../../../images/2-1.jpg",
    },
    listData: [],
    cartList: [
      { id: 1, name: "world", tag:"加热加糖", price: 7, num: 1, },
      { id: 2, name: "hello", tag: "加热",price: 16, num: 1,},
      { id: 3, name: "world", tag: "加糖",price: 7, num: 1,},
      { id: 4, name: "hello", tag: "加热加糖",price: 16, num: 1,},
      { id: 5, name: "world", tag: "加热",price: 7, num: 1,},
      { id: 6, name: "hello", tag: "加糖",price: 16, num: 1,},
      { id: 7, name: "heaadfasfllo", tag: "加热加糖",price: 32, num: 1, }
    ],
    showCart: false,
    count: 12,
    okToSend: 10,
    shortCut: "下单立减31元，再买12可减41元",
    listHeight: 0,
    itemSpace: [],
    scrollTop: 100,
    activeIndex: 1,
    toView: 'a0',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    this.caclHeight('.height').then((res)=>{
      this.setData({
        listHeight: wx.getSystemInfoSync().windowHeight - res[0] -res[1],
      });
    });

    util.request(api.GetList,
      {}, "GET").then((res) => {
        console.log(res)
        wx.hideLoading();
        this.setData({
          listData: res,
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
        that.caclHeight('.listCellHeight').then((res)=>{
          var total = 0;
          var item = [];
          res.forEach(function(e){
            item.push(total += e);
          });
          that.setData({
            itemSpace: item,
          });
        });
      }).catch((err) => {
        console.log('load failed');
        this.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
      });
  },

  /**
   * 计算高度
   */
  caclHeight: function(clzz) {
    return new Promise(function(resolve, reject){
      var height = [];
      wx.createSelectorQuery().selectAll(clzz).boundingClientRect(function (rects) {
        rects.forEach(function (rect) {
          height.push(rect.height);
        })
        resolve(height)
      }).exec();
    });
  },

  /**
   * 滑动右侧list
   */
  scrollRightMenu: function (e) {
    var itemSpace = this.data.itemSpace;
    var scrollTop = e.detail.scrollTop;
    var count = 0
    for(count; itemSpace.length > count; count++){
      if (scrollTop < itemSpace[count]){
        this.setData({
          activeIndex: count,
        });
        break;
      }
    }

    if (e.detail.scrollTop > 300) {
      this.setData({
        'scrollHidBanner.showBanner': false
      })
    } else {
      this.setData({
        'scrollHidBanner.showBanner': true
      })
    }
  },

  /**
   * 选择左边菜单栏
   */
  selectMenu: function(e) {
    var index = e.currentTarget.dataset.index;
    if(index>-1){
      this.setData({
        activeIndex: index,
        toView: 'a'+index,
      });
    }
    console.log(e.currentTarget.dataset.index)
  },

  /**
   * 点击购物车
   */
  showCartList: function () {
    if (this.data.cartList.length != 0) {
      this.setData({
        showCart: !this.data.showCart
      });
    }
  },

  /**
   * 清空购物车
   */
  clearCartList: function () {
    console.log("clear cartlist success")
    this.setData({
      cartList: [],
      count: 0,
      showCart: false,
    });
  },

  /**
   * 点击付款
   */
  pay: function () {
    if (this.data.cartList.length != 0) {
      wx.navigateTo({
        url: '/pages/shopcenter/payment/payment',
      })
    }
  },
})