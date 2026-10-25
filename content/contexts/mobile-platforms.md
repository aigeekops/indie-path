---
id: mobile-platforms
kind: context
---

# 手机应用按平台实践

## unknown

先确定本轮使用者的手机系统和安装渠道，再选择首发平台。可以先做本地样机和真实用户试用；平台未定时不默认 Google Play、海外市场或同时申请三个账号。技术路线只选一条，Flutter、SwiftUI 与 Compose 不需要全部学完。

## apple

先按[开发者计划](https://developer.apple.com/cn/help/account/membership/program-enrollment/)核主体与账号预算；标准年费为 99 美元，本币以注册页面为准。用 TestFlight 留下测试反馈，再准备商店素材、隐私披露和审核账号。发布后核对实际上架状态与下载版本。

变现先区分收费下载、数字权益、订阅或广告；按目标店面和[审核指南 3.1](https://developer.apple.com/cn/app-store/review/guidelines/)判断付款方式，再核付费协议和结算资料。App Store 同样可以面向国内用户，选择它不等于选择出海。

## domestic

先选一个具体商店，分别核对主体、类目资质、签名包、隐私和发布材料。可从[华为 Android APK 发布](https://developer.huawei.com/consumer/cn/doc/app/agc-help-releaseapkrpk-0000001106463276)或[小米安卓应用创建](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1072)开始；华为这条 APK 路径与原生鸿蒙应用分开。

按[APP 备案通知](https://www.gov.cn/zhengce/zhengceku/202308/content_6897341.htm)核本业务的适用范围，并确认目标商店的材料要求。收费下载、内购与广告分别核商户或联盟资格，不能照搬网页收款，也不能把一家商店的通过结果视为全渠道可用。选择广告时可参考[米盟合作流程](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1712)，并按当前协议核结算。

## google

先按[注册指南](https://support.google.com/googleplay/android-developer/answer/6112435?hl=zh-Hans)核主体与支持地区；账号注册费为一次性 25 美元。2023-11-13 之后创建的个人账号，需至少 12 名测试员连续参加封闭测试至少 14 天，再申请正式版发布权限；满足人数和天数不代表自动获批。

使用 App Bundle、签名与数据安全表准备发布；数字商品和订阅按[付款政策](https://support.google.com/googleplay/android-developer/answer/9858738?hl=zh-Hans)核规则及地区例外。分别记录安装、关键动作、付费与最终到账；目标市场、开发者主体和收款资格是三个独立条件。

## game

手机游戏可复用相应平台的测试、素材和版本管理动作，但须另核游戏类目、发行资质、内容分级及终端政策；普通工具应用的审核清单不能证明游戏可发行。

## costs

选读教程和文档免费。开发者账号、设备、云服务、交易服务费及广告分成分别记账；测试订单和测试广告不能记为真实收入。
