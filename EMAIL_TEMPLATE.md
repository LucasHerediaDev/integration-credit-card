# 📧 Email Template para Pagsmile - Domain Whitelist Request

## 🇬🇧 English Version (Use this one)

```
To: support@pagsmile.com, integration@pagsmile.com
CC: [Seu gerente de conta Pagsmile, se tiver]
Subject: Domain Whitelist Request for JS SDK Integration - PCI DSS Compliance

Dear Pagsmile Team,

We are integrating the Pagsmile JS SDK for credit card payments and need to 
whitelist our domains for CORS access as per PCI DSS requirements.

As mentioned by your China integration team:
"应pcidss要求，如果用jssdk接入的话，需要商户提供所有引入js文件的前端域名列表。"

Please whitelist the following domains for JS SDK integration:

Development Environment:
- http://localhost:3000
- http://127.0.0.1:3000

Production Environment:
- https://[SUA-URL-VERCEL].vercel.app
(or your custom domain if you have one)

Merchant Information:
- APP_ID: [SEU APP_ID AQUI]
- Company Name: [SUA EMPRESA]
- Contact Name: Lucas Heredia
- Contact Email: lucas.heredia@xcloudgame.com
- Integration Date: December 2025
- Region: Brazil (BRA)
- Environment: Production

Current Issue:
We are experiencing CORS errors when the JS SDK attempts to submit card payments:
- Request URL: https://gateway.pagsmile.com/api/trade/submit-card-pay
- Error: 403 Forbidden - CORS policy blocked
- Status: Order creation works, but payment submission is blocked

Please confirm once the domains are whitelisted so we can proceed with testing.

Expected Timeline:
We would appreciate if this could be processed within 1-3 business days.

Thank you for your support!

Best regards,
Lucas Heredia
lucas.heredia@xcloudgame.com
```

---

## 🇨🇳 Chinese Version (Optional - if you want to send to China team directly)

```
收件人: support@pagsmile.com, integration@pagsmile.com
主题: JS SDK集成的域名白名单请求 - PCI DSS合规要求

尊敬的Pagsmile团队，

我们正在集成Pagsmile JS SDK进行信用卡支付，根据PCI DSS合规要求，需要将我们的域名加入白名单以启用CORS访问。

请将以下域名加入JS SDK集成白名单：

开发环境：
- http://localhost:3000
- http://127.0.0.1:3000

生产环境：
- https://[您的URL].vercel.app

商户信息：
- APP_ID: [您的APP_ID]
- 公司名称: [您的公司]
- 联系人: Lucas Heredia
- 联系邮箱: lucas.heredia@xcloudgame.com
- 集成日期: 2025年12月
- 地区: 巴西 (BRA)
- 环境: 生产环境

当前问题：
当JS SDK尝试提交卡支付时，我们遇到CORS错误：
- 请求URL: https://gateway.pagsmile.com/api/trade/submit-card-pay
- 错误: 403 Forbidden - CORS策略阻止
- 状态: 订单创建正常，但支付提交被阻止

请在域名白名单配置完成后确认，以便我们继续测试。

期望时间：
如果能在1-3个工作日内处理，我们将不胜感激。

谢谢您的支持！

此致
敬礼

Lucas Heredia
lucas.heredia@xcloudgame.com
```

---

## 🇧🇷 Portuguese Version (For your records)

```
Para: support@pagsmile.com, integration@pagsmile.com
Assunto: Solicitação de Whitelist de Domínios para Integração JS SDK - Conformidade PCI DSS

Prezada equipe Pagsmile,

Estamos integrando o Pagsmile JS SDK para pagamentos com cartão de crédito e 
precisamos adicionar nossos domínios à whitelist para acesso CORS conforme 
requisitos de conformidade PCI DSS.

Conforme mencionado pela equipe de integração da China:
"应pcidss要求，如果用jssdk接入的话，需要商户提供所有引入js文件的前端域名列表。"

Por favor, adicione os seguintes domínios à whitelist para integração JS SDK:

Ambiente de Desenvolvimento:
- http://localhost:3000
- http://127.0.0.1:3000

Ambiente de Produção:
- https://[SUA-URL].vercel.app

Informações do Comerciante:
- APP_ID: [SEU APP_ID]
- Nome da Empresa: [SUA EMPRESA]
- Nome do Contato: Lucas Heredia
- Email de Contato: lucas.heredia@xcloudgame.com
- Data de Integração: Dezembro 2025
- Região: Brasil (BRA)
- Ambiente: Produção

Problema Atual:
Estamos enfrentando erros de CORS quando o JS SDK tenta submeter pagamentos:
- URL da Requisição: https://gateway.pagsmile.com/api/trade/submit-card-pay
- Erro: 403 Forbidden - bloqueado por política CORS
- Status: Criação de pedido funciona, mas submissão de pagamento está bloqueada

Por favor, confirme quando os domínios estiverem na whitelist para que possamos 
prosseguir com os testes.

Prazo Esperado:
Agradeceríamos se isso pudesse ser processado em 1-3 dias úteis.

Obrigado pelo suporte!

Atenciosamente,
Lucas Heredia
lucas.heredia@xcloudgame.com
```

---

## 📋 Checklist Antes de Enviar

- [ ] Substituir `[SUA-URL-VERCEL].vercel.app` pela URL real do deploy
- [ ] Substituir `[SEU APP_ID AQUI]` pelo seu APP_ID real
- [ ] Substituir `[SUA EMPRESA]` pelo nome da sua empresa
- [ ] Verificar se o email está correto: lucas.heredia@xcloudgame.com
- [ ] Adicionar CC do seu gerente de conta Pagsmile (se tiver)
- [ ] Revisar todas as informações antes de enviar

---

## 🎯 Informações Importantes para Incluir

1. **APP_ID**: Seu identificador único na Pagsmile
2. **Domínios completos**: Com http:// ou https://
3. **Ambiente**: Development e Production
4. **Região**: BRA (Brasil)
5. **Contato**: Email válido para resposta

---

## ⏱️ Tempo de Resposta Esperado

- **Resposta inicial**: 1-2 dias úteis
- **Configuração completa**: 1-3 dias úteis
- **Urgente?** Mencione no email se houver deadline

---

## 📞 Contatos Pagsmile

- **Email Geral**: support@pagsmile.com
- **Email Técnico**: integration@pagsmile.com
- **Website**: https://www.pagsmile.com
- **Documentação**: https://docs.pagsmile.com

---

## ✅ Após Receber Confirmação

1. Teste a aplicação na URL de produção
2. Verifique se o erro de CORS foi resolvido
3. Faça um pagamento de teste
4. Confirme que todo o fluxo funciona
5. Responda o email agradecendo e confirmando que funciona

---

## 🆘 Se Não Receber Resposta em 3 Dias

Envie um follow-up:

```
Subject: Follow-up: Domain Whitelist Request - APP_ID: [SEU APP_ID]

Dear Pagsmile Team,

I am following up on my domain whitelist request sent on [DATA].

Could you please provide an update on the status?

We are ready to proceed with testing once the domains are whitelisted.

Thank you!

Best regards,
Lucas Heredia
```

---

**Boa sorte! 🚀**

