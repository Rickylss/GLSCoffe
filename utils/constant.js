/**常量类 */

//腾讯测试AK,请替换成自己申请的 AK
const tencentAk = 'J6LBZ-EDJKO-VHCWA-SOX3M-GDKP5-PVFP7';

//橄榄山咖啡馆地址
const shopLatitude = '28.688697871245807';
const shopLongitude = '115.97130918514567';
const shopLocation = shopLatitude +','+ shopLongitude;
const shopLocationStr = "杭州西湖橄榄山咖啡";
const defaultScale = 14;
const mapID = "coffeMap";

//起送费用
const okToSend = 20;

//促销消息
const promotionInfo = "第二杯半价";

module.exports = {
  tencentAk,
  shopLocation,
  defaultScale,
  shopLocationStr,
  mapID,
  okToSend,
  promotionInfo,
}