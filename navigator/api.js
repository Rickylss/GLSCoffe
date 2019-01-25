// 以下是业务服务器API地址
//腾讯地图
var TencentRoot = "https://apis.map.qq.com/ws/direction/v1/";
//easy mock
var MockRoot = 'https://www.easy-mock.com/mock/5c259b3ec2518a5416c67c75/candyfloss-wx/';
// 本机开发时使用
var WxApiRoot = 'http://localhost:8080/wx/';
// 局域网测试使用
// var WxApiRoot = 'http://192.168.0.101:8080/wx/';
// 云平台部署时使用
// var WxApiRoot = 'http://122.152.206.172:8080/wx/';
// 云平台上线时使用
// var WxApiRoot = 'https://www.menethil.com.cn/wx/';

module.exports = {
  GetDrivePoly: TencentRoot + 'driving', //驾车
  GetWalkPoly: TencentRoot + 'walking', //步行
  GetBusPoly: TencentRoot + 'transit', //公交
  GetIndexBanner: MockRoot + 'index/banner', //首页banner信息
  GetOrderList: MockRoot + 'order/orderList', //获取所有order信息————orders
  GetOrderList2: MockRoot + 'order/orderList2', //获取所有order信息————orders
  GetOrderById: MockRoot + 'order/getOrderById', //根据用户id获取Order信息
  GetAddressListById: MockRoot + 'address/getAddressListById', //根据用户id获取AddressList信息--ucenter/address
  GetAddressById: MockRoot + 'address/getAddressById', //根据addressId获取Address信息--ucenter/address/setaddress
  DeleteAddressById: MockRoot + 'address/deleteAddressById', //根据addressId删除Address信息--ucenter/address/setaddress
  UpdateAddressById: MockRoot + 'address/updateAddressById', //根据addressId更新Address信息--ucenter/address/setaddress
  GetCouponListById: MockRoot + 'coupon/getcouponListById', //根据userId获取couponList--ucenter/coupon
  GetUsedCouponByID: MockRoot + 'coupon/getUsedcouponById', //根据couponId获取coupon--ordercenter/order
  GetDefaultAddressByUId: MockRoot + 'address/getDefaultAddressByUId', //根据userId获取默认地址--shopcenter/payment
  AuthLoginByWeixin: WxApiRoot + 'auth/login_by_wx', //微信登陆
  GetList: 'https://www.easy-mock.com/mock/59abab95e0dc66334199cc5f/coco/aa', //获取商品信息
};