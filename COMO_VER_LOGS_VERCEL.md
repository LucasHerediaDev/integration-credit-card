# 📊 Como Ver Requisição Completa nos Logs da Vercel

## 🎯 Objetivo

Capturar a requisição completa com todos os headers que está gerando erro 403 de CORS.

---

## 🚀 Método 1: Dashboard da Vercel (Mais Fácil)

### **Passo 1: Acessar o Dashboard**

1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta
3. Selecione seu projeto

### **Passo 2: Ir para Logs**

1. No menu lateral, clique em **Logs** ou **Functions**
2. Ou acesse diretamente: `https://vercel.com/[seu-usuario]/[seu-projeto]/logs`

### **Passo 3: Filtrar os Logs**

- **Filtro por função:** `pagsmile-express-backend`
- **Filtro por tempo:** Últimos 15 minutos
- **Buscar por:** `Proxy Pagsmile` ou `DEBUG`

### **Passo 4: Fazer uma Requisição de Teste**

1. Acesse sua aplicação na Vercel
2. Tente fazer um pagamento
3. Volte para os logs
4. Você verá algo assim:

```
=== Proxy Pagsmile - DEBUG ===
Método: POST
Caminho original: /api/trade/submit-card-pay
Headers recebidos: {
  "host": "your-project.vercel.app",
  "connection": "keep-alive",
  "content-length": "234",
  "accept": "application/json",
  "content-type": "application/json",
  "origin": "https://your-project.vercel.app",
  "referer": "https://your-project.vercel.app/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "accept-encoding": "gzip, deflate, br",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}
Query params recebidos: { prepay_id: 'xxx', card_token: 'xxx' }
Body recebido: {
  phone: '5511999999999',
  email: 'customer@example.com',
  postal_code: '01310100',
  payer_id: '12345678900',
  address: { ... }
}

Mesclando query params no body...

URL de destino: https://gateway.pagsmile.com/api/trade/submit-card-pay
Body final mesclado: {
  "prepay_id": "xxx",
  "card_token": "xxx",
  "phone": "5511999999999",
  "email": "customer@example.com",
  ...
}

=== Resposta do Pagsmile ===
Status: 200
Response Headers: {
  "content-type": "application/json",
  "content-length": "156",
  "connection": "keep-alive",
  "date": "Fri, 05 Dec 2025 12:34:56 GMT",
  "server": "nginx"
}
Data: {
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}

=== Headers Enviados ao Pagsmile ===
{
  "Authorization": "Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXk=",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

---

## 💻 Método 2: Vercel CLI (Tempo Real)

### **Passo 1: Instalar Vercel CLI**

```bash
npm install -g vercel
```

### **Passo 2: Fazer Login**

```bash
vercel login
```

### **Passo 3: Ver Logs em Tempo Real**

```bash
# Ver todos os logs do projeto
vercel logs --follow

# Ou especificar o projeto
vercel logs your-project --follow

# Filtrar por função específica
vercel logs --follow | grep "Proxy Pagsmile"
```

### **Passo 4: Fazer uma Requisição**

Em outra janela do terminal ou no browser:
1. Acesse sua aplicação
2. Faça um pagamento
3. Veja os logs aparecerem em tempo real no terminal

---

## 📋 Método 3: Baixar Logs Completos

### **Via CLI:**

```bash
# Baixar logs das últimas 24 horas
vercel logs --since 24h > logs.txt

# Baixar logs de um período específico
vercel logs --since 2024-12-05T10:00:00 --until 2024-12-05T12:00:00 > logs.txt

# Ver logs de produção
vercel logs --prod > logs-prod.txt
```

### **Via Dashboard:**

1. Acesse os logs no dashboard
2. Clique em **Export** ou **Download**
3. Escolha o período
4. Baixe o arquivo

---

## 🔍 O Que Procurar nos Logs

### **1. Headers da Requisição do Browser**

```json
{
  "host": "your-project.vercel.app",
  "origin": "https://your-project.vercel.app",
  "referer": "https://your-project.vercel.app/",
  "user-agent": "Mozilla/5.0 ...",
  "content-type": "application/json",
  "accept": "application/json",
  "accept-encoding": "gzip, deflate, br",
  "accept-language": "pt-BR,pt;q=0.9"
}
```

### **2. Headers Enviados ao Pagsmile**

```json
{
  "Authorization": "Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXk=",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### **3. Body da Requisição**

```json
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

### **4. Resposta do Pagsmile**

```json
{
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING"
}
```

---

## 🛠️ Logs Adicionados ao Código

Acabei de adicionar logs extras no código para capturar TODOS os headers:

### **Logs de Request:**
```javascript
console.log('Headers recebidos:', JSON.stringify(req.headers, null, 2));
```

### **Logs de Response:**
```javascript
console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
console.log('=== Headers Enviados ao Pagsmile ===');
console.log(JSON.stringify(headers, null, 2));
```

---

## 📤 Como Compartilhar com o Time

### **Opção 1: Copiar do Dashboard**

1. Acesse os logs no dashboard da Vercel
2. Selecione o log completo
3. Copie (Ctrl+C)
4. Cole em um arquivo `.txt` ou `.md`

### **Opção 2: Exportar via CLI**

```bash
# Exportar logs
vercel logs --since 1h > logs-para-time.txt

# Filtrar apenas logs do proxy
vercel logs --since 1h | grep -A 50 "Proxy Pagsmile" > logs-proxy.txt
```

### **Opção 3: Screenshot**

1. Acesse os logs no dashboard
2. Tire um screenshot (Print Screen)
3. Compartilhe a imagem

---

## 🎯 Exemplo de Log Completo para Mostrar ao Time

```
=== Proxy Pagsmile - DEBUG ===
Timestamp: 2025-12-05T12:34:56.789Z
Método: POST
Caminho original: /api/trade/submit-card-pay

Headers recebidos: {
  "host": "pagsmile-integration.vercel.app",
  "connection": "keep-alive",
  "content-length": "234",
  "sec-ch-ua": "\"Google Chrome\";v=\"120\", \"Chromium\";v=\"120\"",
  "accept": "application/json",
  "content-type": "application/json",
  "sec-ch-ua-mobile": "?0",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "sec-ch-ua-platform": "\"Windows\"",
  "origin": "https://pagsmile-integration.vercel.app",
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "referer": "https://pagsmile-integration.vercel.app/",
  "accept-encoding": "gzip, deflate, br",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "x-forwarded-for": "123.456.789.012",
  "x-forwarded-proto": "https",
  "x-vercel-id": "gru1::abcde-1234567890"
}

Query params recebidos: {
  "prepay_id": "dWlQbm5sYmMvTkxTcUFDZm5VL1lFQzhPOUtrY0ZBTEVkbTZxaGlGclpXOD0=-9cF61FeB",
  "card_token": "tok_abc123xyz"
}

Body recebido: {
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

Response Headers: {
  "content-type": "application/json; charset=utf-8",
  "content-length": "156",
  "connection": "keep-alive",
  "date": "Fri, 05 Dec 2025 12:34:56 GMT",
  "server": "nginx",
  "x-powered-by": "Express",
  "vary": "Accept-Encoding"
}

Data: {
  "code": "10000",
  "msg": "Success",
  "trade_no": "2025120320503108483",
  "trade_status": "PROCESSING",
  "out_trade_no": "ORDER_1764795028241_dzrc01oal"
}

=== Headers Enviados ao Pagsmile ===
{
  "Authorization": "Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXlfaGVyZQ==",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

---

## 🔒 Segurança

### **⚠️ IMPORTANTE: Não compartilhe publicamente:**

- ❌ Authorization header completo
- ❌ Tokens de cartão
- ❌ CPF completo
- ❌ Dados pessoais reais

### **✅ OK para compartilhar:**

- ✓ Estrutura da requisição
- ✓ Headers públicos (User-Agent, Content-Type, etc)
- ✓ Status codes
- ✓ Dados de exemplo/mock

### **🛡️ Para o Time Interno:**

Você pode compartilhar tudo, mas certifique-se de que é em canal privado/seguro.

---

## 📱 Atalhos Úteis

### **Vercel Dashboard:**
```
https://vercel.com/[seu-usuario]/[seu-projeto]/logs
```

### **Comandos CLI Rápidos:**
```bash
# Ver logs ao vivo
vercel logs --follow

# Últimas 100 linhas
vercel logs --tail 100

# Filtrar por erro
vercel logs | grep -i error

# Filtrar por proxy
vercel logs | grep "Proxy Pagsmile"

# Exportar tudo
vercel logs --since 24h > logs-completos.txt
```

---

## 🎬 Próximos Passos

1. **Fazer deploy** das alterações com os logs extras:
   ```bash
   git add .
   git commit -m "feat: adicionar logs detalhados de headers"
   git push
   vercel --prod
   ```

2. **Fazer uma requisição de teste** na aplicação

3. **Capturar os logs** usando um dos métodos acima

4. **Compartilhar com o time** o log completo

---

**📅 Atualizado em:** ${new Date().toLocaleString('pt-BR')}
**👨‍💻 Preparado por:** Equipe de Desenvolvimento



