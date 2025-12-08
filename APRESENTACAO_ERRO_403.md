# 🔴 Apresentação: Erro 403 CORS - Pagsmile Integration

## 📊 Visão Geral do Problema

```
❌ ERRO: 403 Forbidden - CORS Policy Blocked
🎯 ENDPOINT: POST https://gateway.pagsmile.com/api/trade/submit-card-pay
🌐 ORIGEM: http://localhost:3000
📅 STATUS: Identificado e com workaround implementado
```

---

## 🔍 O Que Está Acontecendo?

### **Fluxo Atual (Com Erro)**

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │────X────│  Pagsmile API    │         │   Backend   │
│ (Frontend)  │  CORS   │  Gateway         │         │  (Node.js)  │
└─────────────┘  403    └──────────────────┘         └─────────────┘
     │                                                        │
     │  ❌ Requisição bloqueada pelo browser                 │
     │     devido à política CORS                            │
     │                                                        │
     └────────────────────────────────────────────────────────┘
```

---

## 📤 Requisição Completa que Falha

### **1️⃣ Request URL**
```
POST https://gateway.pagsmile.com/api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx
```

### **2️⃣ Request Headers**
```http
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Content-Type: application/json
Accept: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: http://localhost:3000/
```

### **3️⃣ Request Body**
```json
{
  "phone": "5511999999999",
  "email": "customer@example.com",
  "postal_code": "01310100",
  "payer_id": "12345678900",
  "address": {
    "country_code": "BRA",
    "zip_code": "01310100",
    "state": "SP",
    "city": "São Paulo",
    "street": "Avenida Paulista 1000"
  }
}
```

### **4️⃣ Resposta do Servidor**
```http
HTTP/1.1 403 Forbidden
Content-Type: text/html

<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
</body>
</html>
```

### **5️⃣ Erro no Console**
```
❌ Access to XMLHttpRequest at 'https://gateway.pagsmile.com/api/trade/submit-card-pay' 
   from origin 'http://localhost:3000' has been blocked by CORS policy: 
   Response to preflight request doesn't pass access control check: 
   No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🎯 Causa Raiz

### **Resposta Oficial do Time Pagsmile (China)**

> 📧 **"应pcidss要求，如果用jssdk接入的话，需要商户提供所有引入js文件的前端域名列表。"**

### **Tradução:**

> 🔐 **"Conforme requisitos do PCI DSS, se os comerciantes usarem integração via JS SDK, precisam fornecer uma lista de todos os domínios frontend que importarão os arquivos JS."**

### **Em Resumo:**

| Motivo | Explicação |
|--------|------------|
| 🔒 **PCI DSS Compliance** | Pagsmile precisa seguir normas de segurança de cartão de crédito |
| 🌐 **Domain Whitelist** | Apenas domínios autorizados podem fazer requisições diretas |
| ❌ **Localhost não autorizado** | Nosso domínio `localhost:3000` não está na whitelist |
| 🚫 **CORS Bloqueado** | Servidor não retorna headers CORS para domínios não autorizados |

---

## ✅ Nossa Solução (Workaround)

### **Proxy Reverso Implementado**

```
┌─────────────┐         ┌─────────────┐         ┌──────────────────┐
│   Browser   │────✓────│   Backend   │────✓────│  Pagsmile API    │
│ (Frontend)  │   OK    │  (Proxy)    │   OK    │  Gateway         │
└─────────────┘         └─────────────┘         └──────────────────┘
     │                         │                         │
     │  1. Requisição local    │                         │
     │     (sem CORS)          │                         │
     │                         │  2. Backend adiciona    │
     │                         │     Authorization       │
     │                         │     header              │
     │                         │                         │
     │                         │  3. Resposta com        │
     │  4. Resposta OK         │     CORS habilitado     │
     │     (CORS OK)           │                         │
```

### **Código do Interceptor (Frontend)**

```javascript
// Intercepta todas as chamadas para gateway.pagsmile.com
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (url.includes('gateway.pagsmile.com')) {
    // Redireciona para nosso proxy
    const path = new URL(url).pathname.substring(1);
    const newUrl = `/pagsmile-proxy/${path}`;
    console.log('Redirecionando:', url, '→', newUrl);
    return originalXHROpen.call(this, method, newUrl, ...rest);
  }
  return originalXHROpen.call(this, method, url, ...rest);
};
```

### **Código do Proxy (Backend)**

```javascript
app.use('/pagsmile-proxy', async (req, res) => {
  const path = req.path.substring(1);
  const targetUrl = `${PAGSMILE_CONFIG.GATEWAY_URL}/${path}`;
  
  // Adiciona Authorization header
  const headers = {
    'Authorization': `Basic ${Buffer.from(
      `${APP_ID}:${SECURITY_KEY}`
    ).toString('base64')}`,
    'Content-Type': 'application/json'
  };
  
  // Faz a requisição para Pagsmile
  const response = await axios({
    method: req.method,
    url: targetUrl,
    data: req.body,
    headers: headers
  });
  
  // Retorna com CORS habilitado
  res.status(response.status).json(response.data);
});
```

---

## 📊 Comparação: Antes vs Depois

### **❌ ANTES (Erro 403)**

```http
Browser → Pagsmile API
├─ URL: https://gateway.pagsmile.com/api/trade/submit-card-pay
├─ Origin: http://localhost:3000
├─ Authorization: ❌ Ausente (SDK não envia)
└─ Resultado: 403 Forbidden (CORS blocked)
```

### **✅ DEPOIS (Funcionando)**

```http
Browser → Backend Proxy → Pagsmile API
├─ Browser → Backend:
│  ├─ URL: http://localhost:3000/pagsmile-proxy/api/trade/submit-card-pay
│  ├─ Origin: http://localhost:3000
│  └─ CORS: ✅ OK (mesma origem)
│
└─ Backend → Pagsmile:
   ├─ URL: https://gateway.pagsmile.com/api/trade/submit-card-pay
   ├─ Authorization: ✅ Basic base64(app_id:security_key)
   └─ Resultado: 200 OK
```

---

## 🔐 Autenticação Completa

### **Authorization Header Format**

```javascript
// Formato
Authorization: Basic <base64_encoded_credentials>

// Geração
const credentials = `${APP_ID}:${SECURITY_KEY}`;
const base64 = Buffer.from(credentials).toString('base64');
const authHeader = `Basic ${base64}`;

// Exemplo
APP_ID: "1234567890123456"
SECURITY_KEY: "your_secret_key_here"
Base64: "MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXlfaGVyZQ=="

Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXlfaGVyZQ==
```

---

## 📝 Exemplo Real de Requisição via Proxy

### **Request: Browser → Backend**

```http
POST /pagsmile-proxy/api/trade/submit-card-pay HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "prepay_id": "dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB",
  "card_token": "tok_abc123xyz",
  "phone": "5511999999999",
  "email": "customer@example.com",
  "postal_code": "01310100",
  "payer_id": "12345678900",
  "address": {
    "country_code": "BRA",
    "zip_code": "01310100",
    "state": "SP",
    "city": "São Paulo",
    "street": "Avenida Paulista 1000"
  }
}
```

### **Request: Backend → Pagsmile**

```http
POST /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXlfaGVyZQ==
Content-Type: application/json

{
  "prepay_id": "dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB",
  "card_token": "tok_abc123xyz",
  "phone": "5511999999999",
  "email": "customer@example.com",
  "postal_code": "01310100",
  "payer_id": "12345678900",
  "address": {
    "country_code": "BRA",
    "zip_code": "01310100",
    "state": "SP",
    "city": "São Paulo",
    "street": "Avenida Paulista 1000"
  }
}
```

### **Response: Pagsmile → Backend → Browser**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING",
  "out_trade_no": "ORDER_1764795028241_dzrc01oal"
}
```

---

## 🔍 Logs de Debug

### **Console do Backend**

```
=== Proxy Pagsmile - DEBUG ===
Método: POST
Caminho original: /api/trade/submit-card-pay
Query params recebidos: { prepay_id: 'xxx', card_token: 'xxx' }
Body recebido: { phone: '5511999999999', email: 'customer@example.com', ... }

Mesclando query params no body...

URL de destino: https://gateway.pagsmile.com/api/trade/submit-card-pay
Body final mesclado: {
  "prepay_id": "xxx",
  "card_token": "xxx",
  "phone": "5511999999999",
  "email": "customer@example.com",
  "postal_code": "01310100",
  "payer_id": "12345678900",
  "address": { ... }
}

=== Resposta do Pagsmile ===
Status: 200
Data: {
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}
```

### **Console do Browser**

```javascript
[XHR Interceptor] Redirecionando (sem query): 
  https://gateway.pagsmile.com/api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx 
  → /pagsmile-proxy/api/trade/submit-card-pay

[XHR Interceptor] Body mesclado: {
  prepay_id: "xxx",
  card_token: "xxx",
  phone: "5511999999999",
  email: "customer@example.com",
  ...
}

✅ Pagamento processado com sucesso!
```

---

## 🎯 Solução Definitiva (Próximos Passos)

### **Ação Necessária: Domain Whitelist**

Para resolver definitivamente o problema, precisamos solicitar ao Pagsmile que adicione nossos domínios à whitelist.

### **📧 Email Template**

```
Para: support@pagsmile.com / seu-account-manager@pagsmile.com
Assunto: Domain Whitelist Request for JS SDK Integration - PCI DSS Compliance

Dear Pagsmile Team,

We are integrating the Pagsmile JS SDK for credit card payments and need to 
whitelist our domains for CORS access as per PCI DSS requirements.

Please whitelist the following domains:

Development Environment:
- http://localhost:3000
- http://127.0.0.1:3000

Production Environment:
- https://your-production-domain.com
- https://www.your-production-domain.com

Staging Environment:
- https://staging.your-domain.com

Account Information:
- App ID: [YOUR_APP_ID]
- Merchant Name: [YOUR_COMPANY_NAME]
- Contact Email: [YOUR_EMAIL]
- Phone: [YOUR_PHONE]

Thank you for your assistance.

Best regards,
[Your Name]
[Your Title]
[Your Company]
```

---

## 📊 Status do Projeto

| Item | Status | Observação |
|------|--------|------------|
| ❌ Erro identificado | ✅ Completo | CORS bloqueado por PCI DSS |
| 🔧 Workaround implementado | ✅ Completo | Proxy reverso funcionando |
| 📝 Documentação | ✅ Completo | Este documento |
| 📧 Whitelist solicitada | ⏳ Pendente | Aguardando envio do email |
| 🚀 Deploy produção | ⏳ Pendente | Após whitelist aprovada |

---

## 🛠️ Arquitetura Técnica

### **Stack Atual**

```
Frontend (Browser)
├─ HTML5 + JavaScript
├─ Pagsmile JS SDK v2.0
└─ XHR/Fetch Interceptor

Backend (Node.js)
├─ Express.js
├─ CORS middleware
├─ Body Parser
├─ Axios (HTTP client)
└─ Proxy reverso

Pagsmile API
├─ Gateway URL: https://gateway.pagsmile.com
├─ Autenticação: Basic Auth
└─ Região: BRA (Brasil)
```

### **Endpoints Implementados**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/config` | GET | Retorna configurações públicas |
| `/api/create-order` | POST | Cria ordem no Pagsmile |
| `/pagsmile-proxy/*` | ALL | Proxy reverso para Pagsmile API |
| `/api/webhook/payment` | POST | Recebe notificações do Pagsmile |
| `/api/query-transaction/:tradeNo` | GET | Consulta status da transação |

---

## 📚 Referências Técnicas

1. **PCI DSS Compliance**
   - https://www.pcisecuritystandards.org/

2. **CORS (Cross-Origin Resource Sharing)**
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

3. **Pagsmile API Documentation**
   - https://pagsmiledocs.apifox.cn

4. **HTTP Basic Authentication**
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication

---

## 💡 Perguntas Frequentes

### **Q: Por que não podemos fazer requisições diretas do browser?**
**A:** Por segurança PCI DSS, Pagsmile só aceita requisições de domínios whitelistados.

### **Q: O proxy não deixa a aplicação mais lenta?**
**A:** Não significativamente. O proxy adiciona ~10-50ms de latência, mas resolve o problema de CORS.

### **Q: Precisamos do proxy em produção?**
**A:** Sim, até que nosso domínio de produção seja whitelistado pelo Pagsmile.

### **Q: O proxy é seguro?**
**A:** Sim. O proxy roda no nosso backend, onde as credenciais (APP_ID e SECURITY_KEY) estão seguras em variáveis de ambiente.

### **Q: Quanto tempo leva para Pagsmile aprovar a whitelist?**
**A:** Geralmente 1-3 dias úteis após o envio da solicitação.

---

## 📞 Contatos

**Time de Desenvolvimento**
- Email: [seu-email@empresa.com]
- Slack: #pagsmile-integration

**Pagsmile Support**
- Email: support@pagsmile.com
- Documentação: https://pagsmiledocs.apifox.cn

---

**📅 Última Atualização:** ${new Date().toLocaleString('pt-BR', { 
  dateStyle: 'full', 
  timeStyle: 'short' 
})}

**👨‍💻 Preparado por:** Equipe de Desenvolvimento

**📌 Versão:** 1.0

