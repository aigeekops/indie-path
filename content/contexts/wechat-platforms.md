---
id: wechat-platforms
kind: context
---

# 微信产品的平台边界

## miniprogram

先在微信公众平台核对主体、AppID、实际类目、备案及所用接口条件，再做页面与核心任务。以[官方示例](https://github.com/wechat-miniprogram/miniprogram-demo)按需补学；只需本地数据时不默认自建业务账号和云端。

[小程序支付](https://pay.wechatpay.cn/doc/v3/merchant/4012791911)与[小程序虚拟支付参考](https://github.com/TencentCloudBase/skills/blob/main/skills/cloudbase-wechat-integration/references/virtual-payment.md)按商品类型分别核对。主体、类目、终端及开通状态共同决定可用性，不能把接口存在当作已取得资格。广告开通与结算在实际后台核对，不固定套用旧培训数字。

## minigame

先验证玩家、一局核心循环与真实游玩，再通过支持该平台的引擎生成微信小游戏工程。可参考[Cocos 发布说明](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html)；手机 APK、iOS 包与微信小游戏工程是不同交付物。

按实际游戏类目、主体和发行地区核对版权、出版发行、受众与防沉迷等适用条件。政府审批、备案与平台审核分别记录，不能因采用广告就推断全部豁免。虚拟道具使用[小游戏专用能力](https://developers.weixin.qq.com/minigame/dev/guide/open-ability/virtual-payment/virtual-payment2.html)，Android 与 iOS 的准入和可测试条件单独核对，不默认所有终端均有沙盒。

微信部分主文档本次未能直接读取；已核验的 SDK 和培训材料仅支持其记载范围。正式接入前须在当前文档与自己的 AppID 后台确认实际条件。
