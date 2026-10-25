---
id: "ops-howto-payment-testing"
kind: "source"
url: "https://docs.stripe.com/testing"
checked_at: "2026-10-25"
set: "company"
key: "ops-howto-payment-testing"
---

# 支付联调：沙箱、通知与最终退款状态

## 选读范围

Stripe 的沙箱、测试支付及不得在正式模式用真卡测试的说明；[通知签名与重复事件](https://docs.stripe.com/webhooks)。Paddle 参照[独立沙箱说明](https://developer.paddle.com/sdks/sandbox/)。

微信另读[API安全最佳实践](https://pay.wechatpay.cn/doc/v3/merchant/4012073699)中无独立 API v3 沙箱的说明，以及[订单退款流程](https://pay.wechatpay.cn/doc/v3/merchant/4013071031)中的受理、处理中和最终结果。

## 阅读终点

按所选平台完成支付、关页、重复通知、失败、退款五项验证，并区分模拟记录、平台测试交易与正式资金。

## 核验范围

已读取官方测试边界和退款状态说明。教学步骤用于制定联调清单；本轮没有运行读者的支付接口，沙箱成功不能证明正式审核或结算成功。
