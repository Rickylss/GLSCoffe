/**常量类 */

//腾讯测试AK,请替换成自己申请的 AK
const tencentAk = 'J6LBZ-EDJKO-VHCWA-SOX3M-GDKP5-PVFP7';

//橄榄山咖啡馆地址
const shopLatitude1 = 28.67877739225488;
const shopLongitude1 = 116.03091787353516;
const shopLatitude = 28.677421959702606; 
const shopLongitude = 115.94422887817383; 
const shopLocation = shopLatitude +','+ shopLongitude;
const shopLocationStr = "杭州西湖橄榄山咖啡";
const shopDescription = "超级棒的咖啡店";
const defaultScale = 12;
const mapID = "coffeMap";

//起送费用
const okToSend = 20;

//促销消息
const promotionInfo = "第二杯半价";

module.exports = {
  shopLatitude,
  shopLongitude,
  tencentAk,
  shopLocation,
  defaultScale,
  shopLocationStr,
  mapID,
  okToSend,
  promotionInfo,
}