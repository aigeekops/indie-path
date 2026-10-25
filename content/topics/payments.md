---
id: "payments"
kind: "topic"
order: 4
summary: "核对真实主体与结算资格，准备申请材料，跑通支付、通知、交付和退款。"
jurisdiction: "国内／香港／目标客户市场"
reviewed_at: "2026-10-25"
related_tasks: ["price", "charge"]
related_topics: ["entity-choice", "reconciliation"]
readings: ["market-wechatPrepare", "market-stripeGlobal", "paddle-mor", "ops-howto-payment-qualification", "ops-howto-payment-testing"]
---

# 选择收款方式：主体、银行与平台如何衔接

## 适用情形与判断边界

适用于准备第一次收费，或更换支付渠道的人。先确认谁销售、谁收款、钱最终进哪个主体的账户，再接接口。开户申请、商户审核、技术联调、银行到账是四个结果，不能互相代替。

截至2026-10-25，[Stripe 商户支持地区](https://stripe.com/global)包含香港，不包含中国内地。海外客户能刷卡，不代表内地主体能直接开 Stripe；也不能用虚构地址、借用主体填申请。已有真实香港主体时才进一步检查香港开户条件，不能把注册公司当作开户保证。

## 行动步骤

### 1. 用自己的条件选一条申请路线

先写产品、客户地区、真实主体类型与所在地、希望结算的币种，再逐行筛选。没有经营主体时，先完成[主体选择](#/topic/entity-choice)，不要随意套用公司账户流程。

| 场景 | 打开哪里、检查什么 | 这一步留下 |
|---|---|---|
| 内地主体向国内用户收款 | [微信 Native 接入准备](https://pay.wechatpay.cn/doc/v3/merchant/4015614538)：电脑网页扫码可检查 Native；其他场景另查对应产品。核对主体类型、产品权限、已认证 AppID 与商户号绑定 | 产品名称、符合的主体条目、缺少的权限 |
| 已有香港主体向海外收费 | [Stripe 账户开通](https://docs.stripe.com/get-started/account/set-up)：如实提交公司、产品及代表人信息；同时向拟选银行确认开户和平台结算条件 | 平台与银行分别给出的材料清单、审核状态 |
| 内地软件经营者拟用 MoR | [Paddle 供应商地区规则](https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle)：当前排除名单未列中国内地；继续检查产品和身份审核、结算方式 | 可申请依据及尚待审核事项，不能写“保证可用” |

MoR 是面向消费者的交易销售方。签约前画出“客户 → MoR → 自己”的资金和票据关系，确认间接税、退款、争议各由谁处理；自己的经营所得、账务和申报仍需另行处理。[Paddle 的 MoR 说明](https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf)

### 2. 准备材料，再提交一份完整申请

在自己的受控文件夹建立申请包，本站只记录文件代号。按所选平台申请页准备主体登记文件、经办人与受益所有人资料、结算账户证明及业务证明；具体文件类型由审核页决定。向银行说明实际销售的软件、付款方、客户地区和收款币种，索取开户及入账要求。银行另做客户尽职审查，平台审核通过不等于银行已通过。[香港金管局开户流程](https://www.hkma.gov.hk/eng/smart-consumers/account-opening/account-opening-process/)

Paddle 可先完善上线网站：产品介绍、价格、交付内容、联系入口、服务条款、隐私与退款政策，然后在 `My Account → Settings → Website approval` 提交实际使用的域名。业务登记、持股结构及身份材料按审核请求补交。[域名审核](https://www.paddle.com/help/start/account-verification/what-is-domain-verification)、[企业核验](https://www.paddle.com/help/start/account-verification/what-is-business-verification)

提交后记录申请编号代号、待补材料、下次检查日期。审核通过后再核对收款权限和结算配置，并保存实际合同中的费率、退款扣费、结算周期、币种转换和准备金条款；不要用文章里的参考费率替代合同。

### 3. 按顺序做五次联调

Stripe 使用 Dashboard 的 [Sandbox 和官方测试值](https://docs.stripe.com/testing)；Paddle 使用[独立沙箱账户](https://developer.paddle.com/sdks/sandbox/)。测试与正式环境的密钥、商品、通知地址分别配置。微信官方说明 [API v3 没有独立沙箱](https://pay.wechatpay.cn/doc/v3/merchant/4012073699)：本地模拟只能证明业务逻辑；正式商户联调涉及真实资金，应按产品规则安排真实交付、事先约定可退款的订单。

| 顺序 | 操作 | 应看到的结果 |
|---|---|---|
| 1 | 建一笔订单并完成支付 | 本地订单号对应一笔平台交易，金额和币种一致 |
| 2 | 付款后关闭浏览器 | 服务端验证通知签名或主动查单后仍能确认付款并交付 |
| 3 | 在测试环境重复投递同一通知 | 同一订单只交付一次，日志能查到去重结果 |
| 4 | 模拟取消或失败 | 未确认成功的订单不交付，状态可查询 |
| 5 | 发起退款并查询最终结果 | 退款单关联原订单；按退款政策调整权益，保留最终状态 |

[Stripe 通知文档](https://docs.stripe.com/webhooks)说明签名验证和重复事件处理；[微信退款流程](https://pay.wechatpay.cn/doc/v3/merchant/4013071031)明确“申请受理”不等于退款成功。任何处理中状态都保留待查，不能因为按钮已点就结单。

### 4. 接第一笔正式业务，检查首次结算

正式审核通过后，用真实客户订单验证付款与交付，等待实际结算；不要把 Stripe 真卡测试当正式业务。下载交易记录、费用明细、结算通知与银行凭证，进入[对账专题](#/topic/reconciliation)。首次尚未到账时，只能记“收款交付通过，结算待验”。

## 成果模板

```text
只填脱敏代号；证件、银行账号、密钥、真实合同和金额留在受控档案。
产品场景／客户地区：
主体类型与地区／主体代号：
所选平台／直接收单或MoR／资格依据链接：
材料包索引／申请编号代号／待补项：
平台审核结果／银行确认结果／结算条款索引：
五项联调：支付、关页、重复通知、失败、退款（通过/待办）：
联调环境／脱敏日志索引／未通过原因：
首笔业务与首次结算凭证索引／下一次检查日期：
```

## 完成标准

- 路线符合真实主体和产品资格，平台与结算账户的审核结果可查。
- 五项联调有订单关联与状态证据；未完成的明确留待办。
- 正式订单能交付，首次结算能追到银行；仅有沙箱成功时不标“正式收款完成”。

## 示例与避坑

教学模拟：一位内地开发者销售在线排版工具，只有内地主体。他不能在 Stripe 表单中选择香港来绕过资格检查；可以先核验 Paddle 的软件准入、申请审核与可用结算方式，并在沙箱完成五项练习。沙箱成功后若主体审核仍待补件，下一步是补件，不能开放正式收费。已有合适国内商户资格、客户主要在国内时，可直接验证微信支付路径，无须先注册海外公司。
