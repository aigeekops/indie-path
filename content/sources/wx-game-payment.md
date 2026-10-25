---
id: wx-game-payment
kind: source
url: https://github.com/wechat-miniprogram/minigame-tuanjie-transform-sdk/blob/main/Runtime/WX.cs
checked_at: 2026-10-25
---

# 微信官方小游戏 SDK：虚拟支付终端能力检查

## 选读范围

查 CheckIsSupportMidasPayment 注释以及链接的[小游戏虚拟支付说明](https://developers.weixin.qq.com/minigame/dev/guide/open-ability/virtual-payment/virtual-payment2.html)。此任务只覆盖手机，核对 Android 与 iOS 实际条件。

## 阅读终点

理解终端支持检查不等于账号已获准开通；为自己的游戏记录平台能力、服务端发货和实际可用的测试方式。

## 访问说明

公开免费官方 SDK 代码及注释；不是要求采用团结引擎。真实交易、平台服务和游戏发行成本另计。

## 核验范围

已读取官方 SDK 的相关注释：iOS 有系统、微信与基础库条件，苹果支付不支持沙箱。微信主文档本次无法直接读取，具体版本与准入需发布前复核；不得写“所有 iOS 禁止虚拟支付”或“全部终端都有沙箱”。
