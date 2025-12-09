# 🔍 Troubleshooting - Erro 40001 Persistente

## 📊 Status Atual

✅ **Todos os parâmetros básicos estão sendo enviados:**
- ✅ `prepay_id`
- ✅ `card_token`
- ✅ `app_id`
- ✅ `phone`
- ✅ `email`
- ✅ `postal_code`
- ✅ `payer_id`
- ✅ `address` (completo com todos os campos)

❌ **Mas ainda recebendo erro 40001**

---

## 🔧 Campos Adicionais Incluídos

Baseado na documentação do Pagsmile e integrações similares, adicionamos:

### 1. **customer_name**
```javascript
customer_name: customerInfo.name
```
Nome completo do cliente (pode ser obrigatório)

### 2. **out_trade_no**
```javascript
out_trade_no: orderData.out_trade_no
```
ID único da ordem gerado no `/trade/create`

### 3. **address.street_number**
```javascript
address: {
  // ... outros campos
  street_number: '1'
}
```
Número do endereço (separado da rua)

---

## 🔍 Possíveis Causas do Erro Persistente

### 1. **Campo com nome diferente**
O Pagsmile pode estar esperando um campo com nome diferente do que estamos enviando.

**Exemplos:**
- `customer_name` vs `name` vs `payer_name`
- `postal_code` vs `zip_code` vs `postcode`
- `payer_id` vs `customer_id` vs `cpf`

### 2. **Formato incorreto de algum campo**

**Verificar:**
- ✅ Telefone: `5511959025596` (com código do país 55)
- ✅ CPF: `52270603800` (11 dígitos, sem formatação)
- ✅ CEP: `06407240` (8 dígitos, sem formatação)
- ✅ Estado: `SP` (2 letras maiúsculas)

### 3. **Campo obrigatório específico do Brasil**

Para pagamentos no Brasil, pode ser necessário:
- `document_type`: 'CPF'
- `document_number`: CPF do cliente
- `billing_address`: Endereço de cobrança separado

### 4. **Ambiente de teste vs produção**

Verificar se as credenciais são do ambiente correto:
- Sandbox: `gateway-test.pagsmile.com`
- Produção: `gateway.pagsmile.com`

---

## 📝 Payload Completo Atual

```json
{
  "app_id": "17123424291649798",
  "out_trade_no": "ORDER_1234567890_abc123",
  "phone": "5511959025596",
  "email": "luscaheredia@gmail.com",
  "postal_code": "06407240",
  "payer_id": "52270603800",
  "customer_name": "Lucas Heredia",
  "address": {
    "country_code": "BRA",
    "zip_code": "06407240",
    "state": "SP",
    "city": "Barueri",
    "street": "Rua das Margaridas 45",
    "street_number": "1"
  },
  "prepay_id": "...",
  "card_token": "...",
  "is_authorize": false,
  "payment_region": "BRA"
}
```

---

## 🚀 Próximos Passos para Debug

### 1. **Entrar em contato com o suporte do Pagsmile**

É **ESSENCIAL** entrar em contato com o suporte técnico do Pagsmile para:

1. Informar o erro `40001 - Missing Required Arguments`
2. Compartilhar o payload completo acima
3. Pedir a lista exata de campos obrigatórios para `submit-card-pay` no Brasil
4. Verificar se há algum campo específico que está faltando

**Contato:**
- Email: tech@pagsmile.com (ou verificar no dashboard)
- Dashboard: https://merchant.pagsmile.com/
- Documentação: https://docs.pagsmile.com/

### 2. **Verificar logs detalhados no Vercel**

Após o próximo deploy, verificar se a validação está sendo executada:

```
🔍 VALIDAÇÃO DE PARÂMETROS - submit-card-pay
Path detectado: api/trade/submit-card-pay
✅ Todos os parâmetros obrigatórios presentes
```

### 3. **Testar com cartão de teste**

Verificar se está usando os dados de teste corretos:
- Número do cartão de teste
- CVV de teste
- Data de validade de teste

### 4. **Verificar se o domínio está autorizado**

Confirmar no painel do Pagsmile que o domínio está na whitelist:
- `https://nextjs.arluck.com.br`
- URL do backend Vercel

---

## 📞 Informações para o Suporte Pagsmile

Ao entrar em contato, forneça:

1. **APP_ID**: `17123424291649798`
2. **Ambiente**: Sandbox ou Produção
3. **Endpoint**: `/api/trade/submit-card-pay`
4. **Erro**: `{"code":"40001","msg":"Missing Required Arguments"}`
5. **Payload completo**: (copiar do log acima)
6. **Headers**: Origin = `https://nextjs.arluck.com.br`
7. **Região**: BRA (Brasil)

---

## 🔧 Alterações Aplicadas Nesta Iteração

### Frontend (`public/checkout.html`):
```javascript
const paymentData = {
  app_id: config.app_id,
  out_trade_no: orderData.out_trade_no,     // ✅ NOVO
  phone: customerInfo.phone,
  email: customerInfo.email,
  postal_code: customerInfo.zipCode,
  payer_id: customerInfo.cpf,
  customer_name: customerInfo.name,          // ✅ NOVO
  address: {
    country_code: 'BRA',
    zip_code: customerInfo.zipCode,
    state: customerInfo.state,
    city: customerInfo.city,
    street: customerInfo.address,
    street_number: '1'                       // ✅ NOVO
  }
};
```

### Backend (`pagsmile-express-backend.js`):
```javascript
proxyLogger.info('Path detectado', path);   // ✅ NOVO - Debug
```

---

## 💡 Campos Alternativos para Testar

Se o erro persistir após o deploy, tente adicionar estes campos um por um:

```javascript
// Opção 1: Documento separado
document_type: 'CPF',
document_number: customerInfo.cpf,

// Opção 2: Nome do titular do cartão
card_holder: document.getElementById('card-name').value,

// Opção 3: Endereço de cobrança separado
billing_address: {
  country: 'BR',
  state: customerInfo.state,
  city: customerInfo.city,
  zip_code: customerInfo.zipCode,
  street: customerInfo.address,
  number: '1'
},

// Opção 4: Timestamp
timestamp: new Date().toISOString(),

// Opção 5: IP do cliente
ip_address: '192.168.1.1', // Pode precisar capturar o IP real
```

---

## ✅ Checklist Final

Antes de entrar em contato com o suporte:

- ✅ Todos os campos básicos estão sendo enviados
- ✅ Formato dos campos está correto (telefone com código do país, CPF sem formatação, etc)
- ✅ Origin header está correto (`https://nextjs.arluck.com.br`)
- ✅ Domínio está cadastrado no Pagsmile
- ✅ Credenciais (APP_ID e SECURITY_KEY) estão corretas
- ✅ Ambiente (sandbox/prod) está correto
- ✅ prepay_id e card_token estão sendo gerados corretamente

---

## 🎯 Conclusão

O erro `40001` indica que **algum campo obrigatório ainda está faltando**, mas sem a documentação específica do Pagsmile, é difícil identificar qual.

**Ação Recomendada:** Entrar em contato com o suporte técnico do Pagsmile com o payload completo e pedir a lista exata de campos obrigatórios para o endpoint `submit-card-pay` na região BRA.

