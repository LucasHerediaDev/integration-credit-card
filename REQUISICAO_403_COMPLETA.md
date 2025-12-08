# 🔴 Requisição Completa - Erro 403 CORS

## 📍 Endpoint que está falhando

```
POST https://gateway.pagsmile.com/api/trade/submit-card-pay
```

---

## 📤 REQUISIÇÃO COMPLETA

### **Request Line**
```http
POST /api/trade/submit-card-pay?prepay_id=dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB&card_token=tok_abc123xyz HTTP/1.1
```

### **Request Headers**
```http
Host: gateway.pagsmile.com
Origin: https://your-project.vercel.app
Content-Type: application/json
Accept: application/json
Accept-Encoding: gzip, deflate, br
Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
Connection: keep-alive
Referer: https://your-project.vercel.app/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: cross-site
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

### **Query Parameters**
```
prepay_id: dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB
card_token: tok_abc123xyz
```

### **Request Body (JSON)**
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

## ❌ RESPOSTA DO SERVIDOR (403)

### **Response Status**
```http
HTTP/1.1 403 Forbidden
```

### **Response Headers**
```http
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
Date: Fri, 05 Dec 2025 12:34:56 GMT
Server: nginx

❌ Access-Control-Allow-Origin: [AUSENTE]
❌ Access-Control-Allow-Methods: [AUSENTE]
❌ Access-Control-Allow-Headers: [AUSENTE]
❌ Access-Control-Allow-Credentials: [AUSENTE]
```

### **Response Body**
```html
<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

---

## 🌐 URLs DO PROJETO

### **Vercel (Produção)**
```
https://your-project.vercel.app
```

### **Localhost (Desenvolvimento)**
```
http://localhost:3000
```

---

## 🔍 PREFLIGHT REQUEST (OPTIONS)

Antes da requisição POST, o browser faz uma requisição OPTIONS (preflight):

### **Request**
```http
OPTIONS /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Origin: https://your-project.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
Connection: keep-alive
```

### **Response**
```http
HTTP/1.1 403 Forbidden
Content-Type: text/html
Server: nginx

<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
</body>
</html>
```

**❌ O preflight falha porque o servidor não retorna os headers CORS necessários.**

---

## 🔐 CAUSA DO ERRO

### **PCI DSS Compliance**

O Pagsmile exige que todos os domínios que usam o JS SDK sejam **whitelistados** previamente por questões de segurança PCI DSS.

**Domínios não autorizados:**
- ❌ `https://your-project.vercel.app`
- ❌ `http://localhost:3000`

**Resultado:** Servidor retorna 403 e não inclui headers CORS na resposta.

---

## ✅ SOLUÇÃO TEMPORÁRIA (PROXY)

Atualmente estamos usando um proxy reverso no backend para contornar o CORS:

### **Fluxo:**
```
Browser → Backend Proxy → Pagsmile API
  ✓          ✓                ✓
```

### **URL do Proxy:**
```
POST https://your-project.vercel.app/pagsmile-proxy/api/trade/submit-card-pay
```

### **Requisição via Proxy (Backend → Pagsmile):**
```http
POST /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXk=
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

---

## 📧 DOMÍNIOS PARA WHITELIST

Enviar para o Pagsmile para autorização:

```
Development:
- http://localhost:3000
- http://127.0.0.1:3000

Production (Vercel):
- https://your-project.vercel.app
- https://your-custom-domain.com (se houver)

Staging (se houver):
- https://staging-your-project.vercel.app
```

---

## 🧪 TESTE COM cURL

### **Reproduzir o erro 403:**
```bash
curl -X POST 'https://gateway.pagsmile.com/api/trade/submit-card-pay' \
  -H 'Origin: https://your-project.vercel.app' \
  -H 'Content-Type: application/json' \
  -d '{
    "prepay_id": "xxx",
    "card_token": "xxx",
    "phone": "5511999999999",
    "email": "test@example.com",
    "postal_code": "01310100",
    "payer_id": "12345678900",
    "address": {
      "country_code": "BRA",
      "zip_code": "01310100",
      "state": "SP",
      "city": "São Paulo",
      "street": "Avenida Paulista 1000"
    }
  }' \
  -v
```

**Resultado esperado:** `HTTP/1.1 403 Forbidden`

### **Testar via proxy (funcionando):**
```bash
curl -X POST 'https://your-project.vercel.app/pagsmile-proxy/api/trade/submit-card-pay' \
  -H 'Content-Type: application/json' \
  -d '{
    "prepay_id": "xxx",
    "card_token": "xxx",
    "phone": "5511999999999",
    "email": "test@example.com",
    "postal_code": "01310100",
    "payer_id": "12345678900",
    "address": {
      "country_code": "BRA",
      "zip_code": "01310100",
      "state": "SP",
      "city": "São Paulo",
      "street": "Avenida Paulista 1000"
    }
  }' \
  -v
```

**Resultado esperado:** `HTTP/1.1 200 OK`

---

## 📊 RESUMO

| Item | Valor |
|------|-------|
| **Endpoint** | `POST https://gateway.pagsmile.com/api/trade/submit-card-pay` |
| **Origem** | `https://your-project.vercel.app` |
| **Status** | `403 Forbidden` |
| **Causa** | CORS bloqueado - domínio não whitelistado |
| **Solução Atual** | Proxy reverso em `/pagsmile-proxy/*` |
| **Solução Definitiva** | Solicitar whitelist ao Pagsmile |

---

**📅 Gerado em:** ${new Date().toLocaleString('pt-BR')}

