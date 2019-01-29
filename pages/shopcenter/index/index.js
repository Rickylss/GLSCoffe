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
    popUp: false,
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
    goodsInfo: {},
    itemSpace: [],
    menuSpace: [],
    activeIndex: 0,
    activePopIndexList: [0, 0, 0, 0],
    itemList: [],
    toView: 'a0',
    leftScrollTop: 0,
    cartInfo: {
      goodsList: [],
      cost: 0.00,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    this.setHeight();
    this.getListData().then(()=>{
      if(options.categoryid){
        this.jumpToCategory(options.categoryid);
      }
    });
  },

  onShow: function() {
    this.setData({
      cartInfo: wx.getStorageSync("cartInfo"),
    });
  },

  onHide: function () {
    if (this.data.cartInfo.goodsList.length > 0) {
      wx.setStorageSync('cartInfo', this.data.cartInfo);
    }
  },

  onUnload: function () {
    if (this.data.cartInfo && this.data.cartInfo.goodsList.length > 0) {
      wx.setStorageSync('cartInfo', this.data.cartInfo);
    }
  },

  /**
   * 加入购物车
   */
  addToCart: function(e) {
    var merge = false;
    var goodDic = {};
    var goodsInfo = this.data.goodsInfo;
    var cost = parseFloat((this.data.cartInfo.cost * 100 + goodsInfo.specfoods[0].price * 100) / 100).toFixed(2);
    var goodsList = this.data.cartInfo.goodsList;
    var itemList = this.data.itemList;
    var tag = itemList.join("+");

    for(var count=0; goodsList.length > count; count++){
      if (goodsList[count].id == goodsInfo.item_id && goodsList[count].tag == tag){
        goodsList[count].num += 1;
        merge = true;
        break;
      }
    }

    if(!merge){
      goodDic["tag"] = tag;
      goodDic["id"] = goodsInfo.item_id;
      goodDic["name"] = goodsInfo.name;
      goodDic["price"] = goodsInfo.specfoods[0].price;
      goodDic["num"] = 1;
      goodsList.push(goodDic);
    }

    this.setData({
      'cartInfo.goodsList': goodsList,
      'cartInfo.cost': cost,
      popUp: false,
    });
  },

  /**
   * 购物车减少
   */
  minusNum: function(e) {
    var index = e.currentTarget.dataset.index;
    var goodsList = this.data.cartInfo.goodsList;
    var cost = parseFloat((this.data.cartInfo.cost * 100 - goodsList[index].price * 100) / 100).toFixed(2);
    goodsList[index].num -= 1;

    if (goodsList[index].num == 0) {
      goodsList.splice(index, 1);
    }

    if (goodsList.length == 0) {
      this.setData({
        showCart: false,
      });
    }

    this.setData({
      'cartInfo.goodsList': goodsList,
      'cartInfo.cost': cost,
    });
  },

  /**
   * 购物车增加
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
   * 选择弹窗内容
   */
  choseSE: function(e) {
    var activePopIndexList = this.data.activePopIndexList;
    var itemList = this.data.itemList;
    var activePopType = e.currentTarget.dataset.type;
    var activePopIndex = e.currentTarget.dataset.index;
    itemList[activePopType] = e.currentTarget.dataset.name;
    activePopIndexList[activePopType] = activePopIndex;
    this.setData({
      activePopIndexList: activePopIndexList,
      itemList: itemList,
    });
  },

  /**
   * 添加弹窗
   */
  selectInfo: function(e) {
    var that = this;
    var itemListDef = [];
    var currentType = e.currentTarget.dataset.type;
    var currentGoods = e.currentTarget.dataset.index;
    var goodsInfo = this.data.listData[currentType].foods[currentGoods];

    goodsInfo.attrs.forEach(function(e) {
      itemListDef.push(e.values[0]);
    });

    that.setData({
      popUp: true,
      goodsInfo: goodsInfo,
      itemList: itemListDef,
      activePopIndexList: [0, 0, 0, 0],
    });
  },

  /**
   * 隐藏info弹窗
   */
  tapMask: function() {
    if (this.data.popUp) {
      this.setData({
        popUp: false,
      });
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
  scrollRightMenu: function(e) {
    var that = this;
    var itemSpace = this.data.itemSpace;
    var scrollTop = e.detail.scrollTop;
    var count = 0
    for (count; itemSpace.length > count; count++) {
      if (scrollTop < itemSpace[count]) {
        this.setData({
          activeIndex: count,
        });
        break;
      }
    }

    /**保持左scroll-view焦点在当前类别 */
    that.switchBanner(scrollTop).then(() => {
      var menuTag = that.data.menuSpace[count];
      var leftScrollTop = that.data.leftScrollTop;
      var listHeight = that.data.listHeight;
      if (menuTag > leftScrollTop + listHeight) {
        that.setData({
          leftScrollTop: menuTag - listHeight,
        });
      } else if (menuTag <= leftScrollTop + that.data.menuSpace[0]) {
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
    if (index >= 0) {
      this.setData({
        activeIndex: index,
        toView: 'a' + index,
      });
    }
    //console.log(e.currentTarget.dataset.index)
  },

  /**
   * 点击购物车
   */
  showCartList: function() {
    if (this.data.cartInfo.goodsList.length != 0) {
      this.setData({
        'showCart': !this.data.showCart,
      });
    }
  },

  /**
   * 清空购物车
   */
  clearCartList: function() {
    console.log("clear cartlist success")
    this.setData({
      'cartInfo.goodsList': [],
      'cartInfo.cost': 0,
      showCart: false,
    });
    this.setHeight();
  },

  /**
   * 切换banner
   */
  switchBanner: function(scrollTop) {
    var that = this;
    return new Promise(function(resolve, reject) {
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
  jumpToCategory: function(categoryid) {
    var listData = this.data.listData;
    for (var i = 0; i < listData.length; i++) {
      if (listData[i].id == categoryid) {
        that.setData({
          activeIndex: categoryid,
          toView: 'a' + i,
        });
        break;
      }
    }
  },

  /**
   * 设置高度
   */
  setHeight: function() {
    this.caclHeight('.height').then((res) => {
      this.setData({
        listHeight: wx.getSystemInfoSync().windowHeight - res[0] - res[1],
      });
    });

  },

  /**
   * 计算高度
   */
  caclHeight: function(clzz) {
    return new Promise(function(resolve, reject) {
      var height = [];
      wx.createSelectorQuery().selectAll(clzz).boundingClientRect(function(rects) {
        rects.forEach(function(rect) {
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
      res.forEach(function(e) {
        item.push(total += e);
      });
      that.setData({
        itemSpace: item,
      });
    });

    that.caclHeight('.listMenuHeight').then((res) => {
      var total = 0;
      var item = [];
      res.forEach(function(e) {
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
    return new Promise(function(resovle, reject){
      util.request(api.GetList, {}, "GET").then((res) => {
        res.forEach(function (e) {
          e['num'] = 0;
        });
        that.setData({
          listData: res,
          'loading.loadingShow': false,
          'loading.loadingError': false,
        });
        that.getSpace();
        resovle();
      }).catch((err) => {
        reject('load failed');
        that.setData({
          'loading.loadingShow': false,
          'loading.loadingError': true,
        });
      });
    });
  },

  /**
   * 点击付款
   */
  pay: function() {
    if (this.data.cartInfo.goodsList.length != 0) {
      wx.setStorageSync("cartInfo", this.data.cartInfo)
      wx.navigateTo({
        url: '/pages/shopcenter/payment/payment',
      })
    }
  },

  /**
   * scroll-view 滚动层穿透问题
   */
  move: function() {},
})