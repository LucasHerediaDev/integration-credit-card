# 🔧 Correção do Erro 40001 - Missing Required Arguments

## ❌ Problema Identificado

O erro `{"code":"40001","msg":"Missing Required Arguments"}` estava ocorrendo porque o parâmetro **`app_id`** não estava sendo enviado no payload do pagamento.

## ✅ Correções Aplicadas

### 1. **Adicionado `app_id` no payload de pagamento** (`public/checkout.html`)

**Antes:**
```javascript
const paymentData = {
  phone: customerInfo.phone,
  email: customerInfo.email,
  postal_code: customerInfo.zipCode,
  payer_id: customerInfo.cpf,
  address: { ... }
};
```

**Depois:**
```javascript
const paymentData = {
  app_id: config.app_id, // ✅ OBRIGATÓRIO
  phone: customerInfo.phone,
  email: customerInfo.email,
  postal_code: customerInfo.zipCode,
  payer_id: customerInfo.cpf,
  address: { ... }
};
```

### 2. **Adicionada validação de parâmetros no proxy** (`pagsmile-express-backend.js`)

Agora o proxy verifica se todos os parâmetros obrigatórios estão presentes antes de enviar para o Pagsmile:

- ✅ `prepay_id` (vem do query param)
- ✅ `card_token` (vem do query param)
- ✅ `app_id` (agora enviado no body)
- ✅ `phone`
- ✅ `email`
- ✅ `postal_code`
- ✅ `payer_id`
- ✅ `address` (com todos os subcampos)

## 📋 Parâmetros Obrigatórios para `/api/trade/submit-card-pay`

| Parâmetro | Tipo | Fonte | Descrição |
|-----------|------|-------|-----------|
| `prepay_id` | string | Query param | ID de pré-pagamento do /trade/create |
| `card_token` | string | Query param | Token do cartão criptografado |
| `app_id` | string | Body | ID da aplicação Pagsmile |
| `phone` | string | Body | Telefone com código do país (ex: 5511999999999) |
| `email` | string | Body | Email do cliente |
| `postal_code` | string | Body | CEP sem formatação (ex: 01310100) |
| `payer_id` | string | Body | CPF sem formatação (ex: 12345678900) |
| `address` | object | Body | Objeto com endereço completo |
| `address.country_code` | string | Body | Código do país (ex: BRA) |
| `address.zip_code` | string | Body | CEP sem formatação |
| `address.state` | string | Body | UF (ex: SP) |
| `address.city` | string | Body | Cidade |
| `address.street` | string | Body | Endereço completo |

## 🚀 Como Testar

### 1. Fazer commit e push das alterações

```bash
git add .
git commit -m "Fix: Adiciona app_id no payload de pagamento para resolver erro 40001"
git push
```

### 2. Aguardar deploy no Vercel

O Vercel fará o deploy automaticamente após o push.

### 3. Testar o pagamento

1. Acesse: https://nextjs.arluck.com.br/
2. Preencha todos os campos do formulário
3. Clique em "Pagar Agora"
4. Observe os logs no Vercel Dashboard

### 4. Verificar logs no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá em seu projeto → **Logs**
3. Procure por:
   - `✅ Todos os parâmetros obrigatórios presentes`
   - `📤 REQUISIÇÃO COMPLETA PARA PAGSMILE`
4. Verifique se o `app_id` está presente no body

## 🔍 Debug

Se o erro persistir, verifique os logs para identificar qual parâmetro ainda está faltando:

```bash
# Executar script de diagnóstico
node diagnose-missing-params.js
```

## 📝 Exemplo de Payload Correto

```json
{
  "prepay_id": "dGVzdFByZXBheUlkRm9yRXhhbXBsZQ==",
  "card_token": "tok_abc123xyz456",
  "app_id": "1234567890123456",
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

## ⚠️ Observações Importantes

1. **Query params são mesclados no body**: O proxy automaticamente mescla `prepay_id` e `card_token` dos query params no body
2. **Telefone deve ter código do país**: Ex: `5511999999999` (não `11999999999`)
3. **CPF e CEP sem formatação**: Sem pontos, traços ou espaços
4. **country_code deve ser 'BRA'**: Não 'BR' ou 'Brasil'

## 🎯 Próximos Passos

1. ✅ Fazer commit e push
2. ✅ Aguardar deploy no Vercel
3. ✅ Testar pagamento
4. ✅ Verificar logs
5. ✅ Confirmar que o erro 40001 foi resolvido

## 📞 Suporte

Se o problema persistir após essas correções:
- Compartilhe os logs completos do Vercel
- Verifique se o domínio está cadastrado no Pagsmile
- Entre em contato com o suporte do Pagsmile

