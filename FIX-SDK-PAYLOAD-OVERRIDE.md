# 🔧 Correção: SDK do Pagsmile Sobrescrevendo Payload

## ❌ Problema Identificado

O **SDK do Pagsmile estava enviando seu próprio payload** e ignorando os dados que passávamos via `clientInstance.createOrder(paymentData)`.

### Payload Enviado pelo SDK (INCOMPLETO):
```json
{
  "is_authorize": false,
  "payment_region": "BRA",
  "email": "...",
  "phone": "...",
  "address": {
    "zip_code": "..."  // ❌ Apenas zip_code, faltando outros campos
  },
  "prepay_id": "...",
  "card_token": "..."
}
```

### Campos Faltantes:
- ❌ `app_id` - ID da aplicação
- ❌ `postal_code` - CEP (campo separado)
- ❌ `payer_id` - CPF do cliente
- ❌ `address.country_code` - Código do país
- ❌ `address.state` - Estado (UF)
- ❌ `address.city` - Cidade
- ❌ `address.street` - Endereço completo

---

## ✅ Solução Implementada

### **Estratégia: Interceptar e Mesclar Dados**

Como o SDK do Pagsmile tem sua própria lógica interna, implementamos uma solução que:

1. **Armazena os dados completos** em `window._pagsmilePaymentData`
2. **Intercepta as requisições** do SDK (via fetch e XMLHttpRequest)
3. **Mescla os dados completos** com o payload que o SDK envia

---

## 📝 Alterações Realizadas

### 1. **Armazenar dados globalmente** (`public/checkout.html`)

```javascript
const paymentData = {
  app_id: config.app_id,
  phone: customerInfo.phone,
  email: customerInfo.email,
  postal_code: customerInfo.zipCode,
  payer_id: customerInfo.cpf,
  address: {
    country_code: 'BRA',
    zip_code: customerInfo.zipCode,
    state: customerInfo.state,
    city: customerInfo.city,
    street: customerInfo.address
  }
};

// ✅ Armazenar globalmente para os interceptors
window._pagsmilePaymentData = paymentData;

const paymentResult = await clientInstance.createOrder(paymentData);
```

### 2. **Interceptor XMLHttpRequest atualizado**

```javascript
XMLHttpRequest.prototype.send = function(body) {
  if (this._queryParamsToMerge) {
    const params = new URLSearchParams(this._queryParamsToMerge.substring(1));
    const bodyObj = body ? JSON.parse(body) : {};
    
    // Adicionar query params ao body
    params.forEach((value, key) => {
      bodyObj[key] = value;
    });
    
    // ✅ MESCLAR dados completos do paymentData armazenado
    if (window._pagsmilePaymentData) {
      Object.assign(bodyObj, window._pagsmilePaymentData);
    }
    
    body = JSON.stringify(bodyObj);
    delete this._queryParamsToMerge;
  }
  
  return originalXHRSend.call(this, body);
};
```

### 3. **Interceptor Fetch atualizado**

```javascript
if (path.includes('submit-card-pay') && urlObj.search) {
  const params = new URLSearchParams(urlObj.search.substring(1));
  const bodyObj = options.body ? JSON.parse(options.body) : {};
  
  // Adicionar query params ao body
  params.forEach((value, key) => {
    bodyObj[key] = value;
  });
  
  // ✅ MESCLAR dados completos do paymentData armazenado
  if (window._pagsmilePaymentData) {
    Object.assign(bodyObj, window._pagsmilePaymentData);
  }
  
  options.body = JSON.stringify(bodyObj);
  url = `/pagsmile-proxy/${path}`;
}
```

### 4. **Validação detalhada no backend** (`pagsmile-express-backend.js`)

Adicionada validação completa que mostra exatamente quais parâmetros estão presentes ou faltando:

```javascript
if (path.includes('submit-card-pay')) {
  proxyLogger.section('🔍 VALIDAÇÃO DE PARÂMETROS - submit-card-pay');
  
  proxyLogger.info('Valores dos parâmetros', {
    prepay_id: requestBody.prepay_id ? '✅' : '❌',
    card_token: requestBody.card_token ? '✅' : '❌',
    app_id: requestBody.app_id ? '✅' : '❌',
    phone: requestBody.phone ? '✅' : '❌',
    email: requestBody.email ? '✅' : '❌',
    postal_code: requestBody.postal_code ? '✅' : '❌',
    payer_id: requestBody.payer_id ? '✅' : '❌',
    address: requestBody.address ? '✅' : '❌'
  });
  
  // ... validação de campos do endereço ...
}
```

---

## 🎯 Resultado Esperado

Após as correções, o payload enviado para o Pagsmile deve conter **TODOS** os campos obrigatórios:

```json
{
  "prepay_id": "...",
  "card_token": "...",
  "app_id": "1712342429164979",
  "phone": "5511959025596",
  "email": "luscaheredia@gmail.com",
  "postal_code": "06407240",
  "payer_id": "12345678900",
  "address": {
    "country_code": "BRA",
    "zip_code": "06407240",
    "state": "SP",
    "city": "São Paulo",
    "street": "Rua Exemplo 123"
  },
  "is_authorize": false,
  "payment_region": "BRA"
}
```

---

## 🚀 Como Testar

### 1. Fazer commit e push

```bash
git add .
git commit -m "Fix: Intercepta e mescla payload completo para resolver erro 40001"
git push
```

### 2. Aguardar deploy no Vercel

### 3. Testar pagamento

1. Acesse: https://nextjs.arluck.com.br/
2. Preencha todos os campos
3. Clique em "Pagar Agora"

### 4. Verificar logs no Vercel

Procure por:
```
🔍 VALIDAÇÃO DE PARÂMETROS - submit-card-pay
✅ Todos os parâmetros obrigatórios presentes
✅ Todos os campos do endereço presentes
```

### 5. Verificar console do navegador

Abra o DevTools (F12) e procure por:
```
[Payment] Dados de pagamento armazenados: {...}
[Fetch Interceptor] Mesclando dados completos do paymentData
[Fetch Interceptor] Body mesclado completo: {...}
```

---

## 🔍 Debug

Se ainda houver erro 40001, verifique:

1. **Console do navegador**: Confirme que `window._pagsmilePaymentData` está sendo armazenado
2. **Logs do Vercel**: Verifique quais parâmetros estão com ❌
3. **Payload final**: Compare com o exemplo de "Resultado Esperado" acima

---

## 📋 Checklist de Validação

- ✅ `prepay_id` presente
- ✅ `card_token` presente
- ✅ `app_id` presente
- ✅ `phone` presente (com código do país)
- ✅ `email` presente
- ✅ `postal_code` presente
- ✅ `payer_id` presente (CPF)
- ✅ `address.country_code` = 'BRA'
- ✅ `address.zip_code` presente
- ✅ `address.state` presente (UF)
- ✅ `address.city` presente
- ✅ `address.street` presente

---

## 💡 Notas Importantes

1. **Object.assign**: Usamos `Object.assign` para mesclar os dados, o que sobrescreve campos duplicados com os valores corretos
2. **window._pagsmilePaymentData**: Variável global temporária, limpa após o pagamento
3. **Interceptors**: Funcionam tanto para `fetch` quanto para `XMLHttpRequest`, cobrindo todos os casos
4. **Validação no backend**: Ajuda a identificar rapidamente se algum campo ainda está faltando

---

## ✅ Conclusão

Esta solução garante que **todos os parâmetros obrigatórios** sejam enviados para o Pagsmile, independentemente do que o SDK envia internamente. Os interceptors capturam a requisição e mesclam os dados completos antes de enviar.

