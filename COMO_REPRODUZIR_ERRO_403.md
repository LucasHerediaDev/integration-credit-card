# 🔬 Como Reproduzir e Visualizar o Erro 403 CORS

## 📋 Guia Prático para o Time Tech

Este documento mostra **passo a passo** como reproduzir, visualizar e debugar o erro 403 de CORS.

---

## 🎯 Pré-requisitos

- ✅ Browser com DevTools (Chrome, Firefox, Edge)
- ✅ Servidor rodando em `http://localhost:3000`
- ✅ Acesso ao código fonte do projeto

---

## 🧪 Método 1: Reproduzir o Erro Original (Sem Proxy)

### **Passo 1: Desabilitar o Interceptor**

No arquivo `public/checkout.html`, comente o código do interceptor:

```javascript
// COMENTAR ESTAS LINHAS (aproximadamente linha 1210-1290)
/*
originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  // ... código do interceptor
};
*/
```

### **Passo 2: Abrir o Browser DevTools**

1. Abra o Chrome/Firefox
2. Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
3. Vá para a aba **Network**
4. Marque a opção **Preserve log**

### **Passo 3: Tentar Fazer um Pagamento**

1. Acesse `http://localhost:3000`
2. Preencha o formulário de checkout
3. Clique em "Pay Now"
4. Observe o erro no DevTools

### **Passo 4: Visualizar o Erro**

#### **Na aba Network:**

```
Name: submit-card-pay?prepay_id=xxx&card_token=xxx
Status: (failed) net::ERR_FAILED
Type: xhr
Initiator: pagsmile-sdk.js
```

#### **Na aba Console:**

```
❌ Access to XMLHttpRequest at 'https://gateway.pagsmile.com/api/trade/submit-card-pay?...' 
   from origin 'http://localhost:3000' has been blocked by CORS policy: 
   Response to preflight request doesn't pass access control check: 
   No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔍 Método 2: Visualizar Detalhes da Requisição no DevTools

### **Passo 1: Abrir Network Tab**

1. Abra DevTools (`F12`)
2. Vá para **Network**
3. Filtre por **XHR** ou **Fetch**

### **Passo 2: Identificar a Requisição Problemática**

Procure por:
- Nome: `submit-card-pay`
- Status: `403` ou `(failed)`
- Domain: `gateway.pagsmile.com`

### **Passo 3: Inspecionar Headers**

Clique na requisição e vá para a aba **Headers**:

#### **General**

```
Request URL: https://gateway.pagsmile.com/api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx
Request Method: OPTIONS
Status Code: 403 Forbidden
Remote Address: [IP do servidor Pagsmile]
```

#### **Request Headers**

```
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
Access-Control-Request-Headers: content-type
Access-Control-Request-Method: POST
Connection: keep-alive
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Referer: http://localhost:3000/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: cross-site
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

#### **Response Headers** ⚠️

```
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
Date: [timestamp]
Server: nginx

❌ AUSENTES:
   - Access-Control-Allow-Origin
   - Access-Control-Allow-Methods
   - Access-Control-Allow-Headers
```

### **Passo 4: Ver o Response Body**

Vá para a aba **Response**:

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

## 🛠️ Método 3: Usar cURL para Testar

### **Teste 1: Requisição Direta (Simula o Browser)**

```bash
curl -X POST 'https://gateway.pagsmile.com/api/trade/submit-card-pay' \
  -H 'Origin: http://localhost:3000' \
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

**Resultado Esperado:**
```
< HTTP/2 403
< content-type: text/html
< content-length: 162
< server: nginx

<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
</body>
</html>
```

### **Teste 2: Preflight Request (OPTIONS)**

```bash
curl -X OPTIONS 'https://gateway.pagsmile.com/api/trade/submit-card-pay' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type' \
  -v
```

**Resultado Esperado:**
```
< HTTP/2 403
< content-type: text/html
< server: nginx

❌ Sem headers CORS na resposta
```

### **Teste 3: Via Proxy (Funcionando)**

```bash
curl -X POST 'http://localhost:3000/pagsmile-proxy/api/trade/submit-card-pay' \
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

**Resultado Esperado:**
```
< HTTP/1.1 200 OK
< Content-Type: application/json
< Access-Control-Allow-Origin: *

{
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}
```

---

## 📊 Método 4: Comparar Requisições (Com vs Sem Proxy)

### **Cenário A: SEM Proxy (Erro 403)**

#### Request
```http
POST /api/trade/submit-card-pay?prepay_id=xxx&card_token=xxx HTTP/1.1
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Content-Type: application/json

{
  "phone": "5511999999999",
  "email": "test@example.com",
  ...
}
```

#### Response
```http
HTTP/1.1 403 Forbidden
Content-Type: text/html
Server: nginx

<html>
<head><title>403 Forbidden</title></head>
...
</html>
```

#### Console Error
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

---

### **Cenário B: COM Proxy (Sucesso)**

#### Request (Browser → Backend)
```http
POST /pagsmile-proxy/api/trade/submit-card-pay HTTP/1.1
Host: localhost:3000
Origin: http://localhost:3000
Content-Type: application/json

{
  "prepay_id": "xxx",
  "card_token": "xxx",
  "phone": "5511999999999",
  "email": "test@example.com",
  ...
}
```

#### Request (Backend → Pagsmile)
```http
POST /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Authorization: Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXk=
Content-Type: application/json

{
  "prepay_id": "xxx",
  "card_token": "xxx",
  "phone": "5511999999999",
  "email": "test@example.com",
  ...
}
```

#### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}
```

#### Console
```
✅ Pagamento processado com sucesso!
```

---

## 🔬 Método 5: Usar Postman/Insomnia

### **Teste 1: Requisição Direta ao Pagsmile**

#### Configuração Postman

```
Method: POST
URL: https://gateway.pagsmile.com/api/trade/submit-card-pay

Headers:
- Content-Type: application/json
- Authorization: Basic <base64(app_id:security_key)>

Body (JSON):
{
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
}
```

**⚠️ Nota:** Postman não tem restrições CORS, então essa requisição pode funcionar mesmo sem whitelist!

### **Teste 2: Via Proxy Local**

```
Method: POST
URL: http://localhost:3000/pagsmile-proxy/api/trade/submit-card-pay

Headers:
- Content-Type: application/json

Body (JSON):
{
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
}
```

---

## 📝 Método 6: Logs do Backend

### **Habilitar Logs Detalhados**

No arquivo `pagsmile-express-backend.js`, os logs já estão habilitados:

```javascript
console.log('=== Proxy Pagsmile - DEBUG ===');
console.log('Método:', req.method);
console.log('Caminho original:', req.path);
console.log('Query params recebidos:', req.query);
console.log('Body recebido:', req.body);
console.log('URL de destino:', targetUrl);
console.log('Body final mesclado:', JSON.stringify(requestBody, null, 2));
console.log('=== Resposta do Pagsmile ===');
console.log('Status:', response.status);
console.log('Data:', JSON.stringify(response.data, null, 2));
```

### **Visualizar Logs no Terminal**

```bash
# Inicie o servidor
npm start

# Ou com nodemon para auto-reload
npm run dev
```

### **Exemplo de Log Completo**

```
=== Proxy Pagsmile - DEBUG ===
Método: POST
Caminho original: /api/trade/submit-card-pay
Query params recebidos: {
  prepay_id: 'dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB',
  card_token: 'tok_abc123xyz'
}
Body recebido: {
  phone: '5511999999999',
  email: 'customer@example.com',
  postal_code: '01310100',
  payer_id: '12345678900',
  address: {
    country_code: 'BRA',
    zip_code: '01310100',
    state: 'SP',
    city: 'São Paulo',
    street: 'Avenida Paulista 1000'
  }
}

Mesclando query params no body...

URL de destino: https://gateway.pagsmile.com/api/trade/submit-card-pay
Body final mesclado: {
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

=== Resposta do Pagsmile ===
Status: 200
Headers: {
  'content-type': 'application/json',
  'content-length': '156',
  'connection': 'keep-alive',
  'date': 'Fri, 05 Dec 2025 12:34:56 GMT',
  'server': 'nginx'
}
Data: {
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING",
  "out_trade_no": "ORDER_1764795028241_dzrc01oal"
}
```

---

## 🎬 Método 7: Capturar Tráfego de Rede (Wireshark/Charles)

### **Usando Charles Proxy**

1. Instale Charles Proxy: https://www.charlesproxy.com/
2. Configure o browser para usar Charles como proxy
3. Inicie a captura
4. Faça um pagamento
5. Filtre por `gateway.pagsmile.com`

### **O que você verá:**

#### **Requisição OPTIONS (Preflight)**
```
Request:
OPTIONS /api/trade/submit-card-pay HTTP/1.1
Host: gateway.pagsmile.com
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

Response:
HTTP/1.1 403 Forbidden
Content-Type: text/html
Server: nginx

<html>
<head><title>403 Forbidden</title></head>
...
</html>
```

#### **Requisição POST (Bloqueada pelo Browser)**
```
❌ Não chega a ser enviada porque o preflight falhou
```

---

## 📸 Screenshots Importantes

### **1. Network Tab - Erro CORS**

```
┌─────────────────────────────────────────────────────────┐
│ Name                  Status    Type    Size    Time    │
├─────────────────────────────────────────────────────────┤
│ submit-card-pay       (failed)  xhr     0 B     0 ms    │
│ ↳ CORS error                                            │
└─────────────────────────────────────────────────────────┘
```

### **2. Console - Erro Detalhado**

```
┌─────────────────────────────────────────────────────────┐
│ ❌ Access to XMLHttpRequest at                          │
│    'https://gateway.pagsmile.com/api/trade/submit-...  │
│    from origin 'http://localhost:3000' has been        │
│    blocked by CORS policy: Response to preflight       │
│    request doesn't pass access control check: No       │
│    'Access-Control-Allow-Origin' header is present     │
│    on the requested resource.                          │
└─────────────────────────────────────────────────────────┘
```

### **3. Headers Tab - Ausência de CORS Headers**

```
Response Headers:
┌─────────────────────────────────────────────────────────┐
│ Content-Type: text/html                                 │
│ Content-Length: 162                                     │
│ Server: nginx                                           │
│                                                          │
│ ❌ Access-Control-Allow-Origin: [AUSENTE]               │
│ ❌ Access-Control-Allow-Methods: [AUSENTE]              │
│ ❌ Access-Control-Allow-Headers: [AUSENTE]              │
└─────────────────────────────────────────────────────────┘
```

---

## 🧰 Ferramentas Úteis

### **1. Browser DevTools**
- Chrome DevTools: `F12`
- Firefox Developer Tools: `F12`
- Edge DevTools: `F12`

### **2. Extensões do Browser**
- **CORS Unblock** (para testes locais apenas)
- **ModHeader** (modificar headers)
- **Requestly** (interceptar requisições)

### **3. Ferramentas de Linha de Comando**
- **curl**: Testar requisições HTTP
- **httpie**: Alternativa mais amigável ao curl
- **jq**: Formatar JSON no terminal

### **4. Clientes HTTP**
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client** (VS Code extension)

### **5. Proxy/Debugging Tools**
- **Charles Proxy**: https://www.charlesproxy.com/
- **Fiddler**: https://www.telerik.com/fiddler
- **mitmproxy**: https://mitmproxy.org/

---

## ✅ Checklist de Verificação

### **Para confirmar que é um erro CORS:**

- [ ] Status code é 403 ou requisição falha completamente
- [ ] Erro menciona "CORS policy" no console
- [ ] Erro menciona "Access-Control-Allow-Origin"
- [ ] Requisição é cross-origin (domínio diferente)
- [ ] Preflight request (OPTIONS) falha
- [ ] Response não contém headers CORS

### **Para confirmar que o proxy funciona:**

- [ ] Requisição vai para `/pagsmile-proxy/*`
- [ ] Backend recebe a requisição
- [ ] Backend adiciona Authorization header
- [ ] Backend faz requisição ao Pagsmile
- [ ] Pagsmile responde com sucesso
- [ ] Backend retorna resposta ao frontend
- [ ] Frontend recebe resposta sem erro CORS

---

## 🎯 Comandos Rápidos para Demonstração

### **1. Ver logs do servidor em tempo real**
```bash
npm start | grep -E "(Proxy|Resposta|Erro)"
```

### **2. Testar endpoint do proxy**
```bash
curl -X POST http://localhost:3000/pagsmile-proxy/api/trade/submit-card-pay \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v
```

### **3. Verificar se servidor está rodando**
```bash
curl http://localhost:3000/api/config
```

### **4. Ver todas as rotas disponíveis**
```bash
curl http://localhost:3000/api/test-credentials
```

---

## 📞 Para Mais Informações

- **Documentação Completa:** Ver `CORS_ERROR_DETAILS.md`
- **Apresentação Visual:** Ver `APRESENTACAO_ERRO_403.md`
- **Código Fonte:** Ver `pagsmile-express-backend.js` e `public/checkout.html`

---

**📅 Última Atualização:** ${new Date().toLocaleString('pt-BR')}
**👨‍💻 Preparado por:** Equipe de Desenvolvimento




