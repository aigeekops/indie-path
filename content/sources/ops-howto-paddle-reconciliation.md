---
id: "ops-howto-paddle-reconciliation"
kind: "source"
url: "https://developer.paddle.com/build/reports/payout-reconciliation/"
checked_at: "2026-10-25"
set: "company"
key: "ops-howto-paddle-reconciliation"
---

# Paddle Billing：按汇款参考号核结算

## 选读范围

remittance reference 筛选、付款通知、交易币种与余额币种字段、费用及调整、汇总不一致的处理。报表生成入口另见[Generate reports](https://developer.paddle.com/build/reports/)。

## 阅读终点

把同一汇款编号的余额币种净变动相加，与 remittance advice 比较；重新生成仍不一致时，保留汇款编号和差异向平台查询。

## 核验范围

已读取官方正文及报表字段，范围为 Paddle Billing。消费者税费、平台费用和供应商会计收入须分开判断；未读取真实账户或代读者决定总额／净额记账。
