# 🔴 Detalhes Completos do Erro 403 - CORS

## 📋 Resumo Executivo

Estamos enfrentando um erro **403 Forbidden** devido à política de CORS ao tentar submeter pagamentos com cartão de crédito através do SDK JavaScript do Pagsmile.

---

## 🎯 Requisição que Falha (CORS Blocked)

### **Endpoint Problemático**
```
POST https://gateway.pagsmile.com/api/trade/submit-card-pay
```

### **Origem da Requisição**
```
Origin: http://localhost:3000
```

---

## 📤 Detalhes Completos da Requisição

### **1. Request Headers**

```http
POST /api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx HTTP/1.1
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Content-Type: application/json
Accept: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: http://localhost:3000/
Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
```

### **2. Query Parameters**

```
prepay_id: dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB
card_token: [token gerado pelo SDK]
```

### **3. Request Body (JSON)**

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

---

## ❌ Resposta do Servidor (Erro)

### **Preflight Request (OPTIONS)**

```http
OPTIONS /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

### **Resposta do Preflight**

```http
HTTP/1.1 403 Forbidden
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
Date: [timestamp]
Server: nginx

<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

### **Headers Ausentes na Resposta** ⚠️

```
❌ Access-Control-Allow-Origin: [AUSENTE]
❌ Access-Control-Allow-Methods: [AUSENTE]
❌ Access-Control-Allow-Headers: [AUSENTE]
```

---

## 🔍 Erro no Console do Browser

```javascript
Access to XMLHttpRequest at 'https://gateway.pagsmile.com/api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🛠️ Nossa Solução Atual (Proxy Reverso)

Para contornar o problema de CORS, implementamos um **proxy reverso** no backend que intercepta as requisições do SDK.

### **Fluxo da Solução**

```mermaid
sequenceDiagram
    participant Browser
    participant Backend (Node.js)
    participant Pagsmile API
    
    Browser->>Browser: SDK tenta chamar gateway.pagsmile.com
    Browser->>Browser: XHR/Fetch Interceptor redireciona
    Browser->>Backend: POST /pagsmile-proxy/api/trade/submit-card-pay
    Note over Browser,Backend: Query params + Body mesclados
    Backend->>Backend: Adiciona Authorization header
    Backend->>Pagsmile API: POST /api/trade/submit-card-pay
    Note over Backend,Pagsmile API: Com credenciais corretas
    Pagsmile API-->>Backend: Resposta (200/400/500)
    Backend-->>Browser: Resposta (com CORS habilitado)
```

### **Código do Interceptor (Frontend)**

```javascript
// Intercepta XMLHttpRequest
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && url.includes('gateway.pagsmile.com')) {
    const urlObj = new URL(url);
    const path = urlObj.pathname.substring(1);
    
    // Redireciona para nosso proxy
    if (path.includes('submit-card-pay') && urlObj.search) {
      this._queryParamsToMerge = urlObj.search;
      const newUrl = `/pagsmile-proxy/${path}`;
      console.log('[XHR Interceptor] Redirecionando:', url, '→', newUrl);
      return originalXHROpen.call(this, method, newUrl, ...rest);
    }
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// Mescla query params no body
XMLHttpRequest.prototype.send = function(body) {
  if (this._queryParamsToMerge) {
    const params = new URLSearchParams(this._queryParamsToMerge.substring(1));
    const bodyObj = body ? JSON.parse(body) : {};
    
    params.forEach((value, key) => {
      bodyObj[key] = value;
    });
    
    body = JSON.stringify(bodyObj);
    delete this._queryParamsToMerge;
  }
  
  return originalXHRSend.call(this, body);
};
```

### **Código do Proxy (Backend)**

```javascript
// Proxy reverso no Express
app.use('/pagsmile-proxy', async (req, res) => {
  try {
    const path = req.path.substring(1);
    
    console.log('=== Proxy Pagsmile - DEBUG ===');
    console.log('Método:', req.method);
    console.log('Caminho:', req.path);
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    
    // Mescla query params no body
    let requestBody = { ...(req.body || {}) };
    if (req.query && Object.keys(req.query).length > 0) {
      requestBody = { ...requestBody, ...req.query };
    }
    
    const targetUrl = `${PAGSMILE_CONFIG.GATEWAY_URL}/${path}`;
    
    console.log('URL de destino:', targetUrl);
    console.log('Body final:', JSON.stringify(requestBody, null, 2));

    // Headers com Authorization
    const headers = {
      'Authorization': generateAuthHeader(), // Basic base64(app_id:security_key)
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Faz a requisição para o Pagsmile
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.method !== 'GET' && req.method !== 'HEAD' ? requestBody : undefined,
      headers: headers,
      validateStatus: () => true
    });

    console.log('=== Resposta do Pagsmile ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('=== Erro no Proxy ===');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    res.status(error.response?.status || 500).json(
      error.response?.data || {
        success: false,
        message: error.message
      }
    );
  }
});
```

### **Configuração de CORS no Backend**

```javascript
const cors = require('cors');
app.use(cors()); // Habilita CORS para todas as rotas
```

---

## 📊 Exemplo de Requisição Completa via Proxy

### **Request do Browser → Backend**

```http
POST /pagsmile-proxy/api/trade/submit-card-pay HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

{
  "prepay_id": "dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB",
  "card_token": "tok_xxx123xxx",
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

### **Request do Backend → Pagsmile**

```http
POST /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3VyaXR5X2tleV9oZXJl
Content-Type: application/json
Accept: application/json

{
  "prepay_id": "dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB",
  "card_token": "tok_xxx123xxx",
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

---

## 🔐 Headers de Autenticação

### **Authorization Header**

```
Authorization: Basic <base64_encoded_credentials>
```

**Formato:**
```javascript
const credentials = `${APP_ID}:${SECURITY_KEY}`;
const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
```

**Exemplo:**
```
APP_ID: 1234567890123456
SECURITY_KEY: your_security_key_here
Base64: MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3VyaXR5X2tleV9oZXJl

Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3VyaXR5X2tleV9oZXJl
```

---

## 🎯 Causa Raiz Confirmada

### **Resposta do Time de Integração da Pagsmile (China)**

> **"应pcidss要求，如果用jssdk接入的话，需要商户提供所有引入js文件的前端域名列表。"**
>
> **Tradução:** "Conforme requisitos do PCI DSS, se os comerciantes usarem integração via JS SDK, precisam fornecer uma lista de todos os domínios frontend que importarão os arquivos JS."

### **Conclusão**

O erro 403 ocorre porque:

1. ✅ **PCI DSS Compliance**: Pagsmile requer whitelist de domínios por segurança
2. ✅ **Domínio não autorizado**: `localhost:3000` não está na whitelist do Pagsmile
3. ✅ **Headers CORS ausentes**: Servidor Pagsmile não retorna headers CORS para domínios não whitelistados

---

## ✅ Solução Definitiva

### **Ação Necessária: Solicitar Whitelist de Domínios**

Enviar email para o time Pagsmile com:

**Assunto:** Domain Whitelist Request for JS SDK Integration - PCI DSS Compliance

**Conteúdo:**

```
Dear Pagsmile Team,

We are integrating the Pagsmile JS SDK for credit card payments and need to whitelist 
our domains for CORS access as per PCI DSS requirements.

Please whitelist the following domains:

Development Environment:
- http://localhost:3000
- http://127.0.0.1:3000

Production Environment:
- https://your-production-domain.com
- https://www.your-production-domain.com

Staging Environment (if applicable):
- https://staging.your-domain.com

Account Information:
- App ID: [YOUR_APP_ID]
- Merchant Name: [YOUR_COMPANY_NAME]
- Contact Email: [YOUR_EMAIL]

Thank you for your assistance.

Best regards,
[Your Name]
```

---

## 📝 Logs de Debug

### **Console do Backend (Node.js)**

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
Headers: { ... }
Data: {
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}
```

### **Console do Browser (JavaScript)**

```
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
```

---

## 🔧 Configuração Atual do Ambiente

### **Backend (Node.js + Express)**

```javascript
// Arquivo: pagsmile-express-backend.js
const PAGSMILE_CONFIG = {
  APP_ID: process.env.PAGSMILE_APP_ID,
  SECURITY_KEY: process.env.PAGSMILE_SECURITY_KEY,
  PUBLIC_KEY: process.env.PAGSMILE_PUBLIC_KEY,
  ENV: process.env.PAGSMILE_ENV || 'sandbox',
  GATEWAY_URL: process.env.PAGSMILE_ENV === 'prod' 
    ? 'https://gateway.pagsmile.com' 
    : 'https://gateway-test.pagsmile.com',
  REGION_CODE: process.env.PAGSMILE_REGION_CODE || 'BRA'
};
```

### **Frontend (JavaScript SDK)**

```javascript
// Inicialização do SDK
const clientInstance = await Pagsmile.setPublishableKey({
  app_id: config.app_id,
  public_key: config.public_key,
  env: config.env,
  region_code: config.region_code,
  prepay_id: orderData.prepay_id,
  fields: { ... }
});

// Chamada que gera o erro CORS (sem proxy)
const paymentResult = await clientInstance.createOrder(paymentData);
```

---

## 📞 Contatos Pagsmile

- **Suporte Técnico:** [email do suporte]
- **Account Manager:** [email do gerente de conta]
- **Documentação:** https://pagsmiledocs.apifox.cn

---

## 🔄 Status Atual

- ✅ **Problema identificado**: CORS bloqueado por PCI DSS
- ✅ **Workaround implementado**: Proxy reverso funcionando
- ⏳ **Aguardando**: Whitelist de domínios pelo Pagsmile
- 🎯 **Próximo passo**: Enviar lista de domínios para whitelist

---

## 📚 Referências

1. [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
2. [CORS Policy - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
3. [Pagsmile API Documentation](https://pagsmiledocs.apifox.cn)
4. [XMLHttpRequest - MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

---

**Documento gerado em:** ${new Date().toLocaleString('pt-BR')}
**Versão:** 1.0
**Autor:** Equipe de Desenvolvimento

