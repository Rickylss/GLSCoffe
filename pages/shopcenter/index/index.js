// pages/list/list.js
var util = require("../../../utils/util.js")
var constant = require("../../../utils/constant.js")
var api = require('../../../navigator/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    okToSend: constant.okToSend,
    promotionInfo: constant.promotionInfo,
    showCart: false,
    listHeight: 0,
    loading: {
      loadingShow: true,
      loadingError: false,
    },
    banner: {
      showBanner: true,
      url: "../../../images/2-1.jpg",
    },
    listData: [],
    itemSpace: [],
    menuSpace: [],
    activeIndex: 0,
    toView: 'a0',
    leftScrollTop: 0,
    cartInfo: {
      goodsList: [
        { id: 1, name: "world", tag: "加热加糖", price: 7, num: 1, },
        { id: 2, name: "hello", tag: "加热", price: 16, num: 1, },
        { id: 3, name: "world", tag: "加糖", price: 7, num: 1, },
        { id: 4, name: "hello", tag: "加热加糖", price: 16, num: 1, },
        { id: 5, name: "world", tag: "加热", price: 7, num: 1, },
        { id: 6, name: "hello", tag: "加糖", price: 16, num: 1, },
        { id: 7, name: "heaadfasfllo", tag: "加热加糖", price: 32, num: 1, }
      ],
      cost: 28.0,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setHeight();
    this.getListData();
    if (options.categoryid>=0){
      this.jumpToCategory(options.categoryid);
    }
  },

  /**
   * 滑动左侧list
   */
  scrollLeftMenu: function(e) {
    this.setData({
      leftScrollTop: e.detail.scrollTop,
    })
  },

  /**
   * 滑动右侧list
   */
  scrollRightMenu: function (e) {
    var that = this;
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

    /**保持左scroll-view焦点在当前类别 */
    that.switchBanner(scrollTop).then(()=> {
      var menuTag = that.data.menuSpace[count];
      var leftScrollTop = that.data.leftScrollTop;
      var listHeight = that.data.listHeight;
      if (menuTag > leftScrollTop + listHeight) {
        that.setData({
          leftScrollTop: menuTag - listHeight,
        });
      } else if (menuTag <= leftScrollTop + that.data.menuSpace[0]){
        that.setData({
          leftScrollTop: menuTag - that.data.menuSpace[0],
        });
      }
    });

  },

  /**
   * 选择左边菜单栏
   */
  selectMenu: function(e) {
    var index = e.currentTarget.dataset.index;
    if(index>=0){
      this.setData({
        activeIndex: index,
        toView: 'a'+index,
      });
    }
    //console.log(e.currentTarget.dataset.index)
  },

  /**
   * 点击购物车
   */
  showCartList: function () {
    if (this.data.cartInfo.goodsList.length != 0) {
      this.setData({
        'showCart': !this.data.showCart,
      });
    }
  },

  /**
   * 清空购物车
   */
  clearCartList: function () {
    console.log("clear cartlist success")
    this.setData({
      'cartInfo.goodsList': '',
      'cartInfo.cost': 0,
      showCart: false,
    });
    this.setHeight();
  },

  /**
   * 点击付款
   */
  pay: function () {
    if (this.data.cartInfo.goodsList.length != 0) {
      wx.setStorageSync("cartInfo", this.data.cartInfo)
      wx.navigateTo({
        url: '/pages/shopcenter/payment/payment',
      })
    }
  },

  /**
   * 切换banner
   */
  switchBanner: function (scrollTop) {
    var that = this;
    return new Promise(function(resolve, reject){
      if (scrollTop > 300) {
        that.setData({
          'banner.showBanner': false
        })
      } else {
        that.setData({
          'banner.showBanner': true
        })
      }
      that.setHeight();
      resolve();
    });
  },

  /**
   * 跳转至对应类别
   */
  jumpToCategory: function (categoryid) {
    this.setData({
      activeIndex: categoryid,
    });
  },

  /**
 * 设置高度
 */
  setHeight: function () {
    this.caclHeight('.height').then((res) => {
      this.setData({
        listHeight: wx.getSystemInfoSync().windowHeight - res[0] - res[1],
      });
    });

  },

  /**
   * 计算高度
   */
  caclHeight: function (clzz) {
    return new Promise(function (resolve, reject) {
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
   * 获取每个类别的高度
   */
  getSpace: function() {
    var that = this;
    that.caclHeight('.listCellHeight').then((res) => {
      var total = 0;
      var item = [];
      res.forEach(function (e) {
        item.push(total += e);
      });
      that.setData({
        itemSpace: item,
      });
    });

    that.caclHeight('.listMenuHeight').then((res)=>{
      var total = 0;
      var item = [];
      res.forEach(function (e) {
        item.push(total += e);
      });
      that.setData({
        menuSpace: item,
      });
    });
  },

  /**
   * 获取菜单数据
   */
  getListData: function() {
    var that = this;
    util.request(api.GetList,
      {}, "GET").then((res) => {
        res.forEach(function (e) {
          e['num'] = 0;
        });
        that.setData({
          listData: res,
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
        that.getSpace();
      }).catch((err) => {
        console.log('load failed');
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
      });
  },

  /**
   * scroll-view 滚动层穿透问题
   */
  move: function(){},
})