# 🔍 Logging de Headers Origin - Solução Implementada

## 📋 Problema Identificado

O time tech levantou a suspeita de que o **backend Node.js no Vercel não está enviando o cabeçalho `Origin`** para `https://gateway.pagsmile.com`.

Por padrão, o **axios não envia automaticamente headers como `Origin`, `Referer` ou `User-Agent`** em requisições server-side, pois esses são headers típicos de navegadores.

---

## ✅ Solução Implementada

### **1. Adição Explícita do Header `Origin`**

Agora o proxy adiciona explicitamente os seguintes headers:

```javascript
const origin = req.headers.origin || req.headers.referer || 
               `${req.protocol}://${req.get('host')}`;

const headers = {
  'Authorization': generateAuthHeader(),
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': origin,              // ✅ NOVO: Origin explícito
  'Referer': origin,              // ✅ NOVO: Referer
  'User-Agent': req.headers['user-agent'] || 'Pagsmile-Proxy/1.0' // ✅ NOVO
};
```

### **2. Logging Detalhado com Interceptor Axios**

Implementamos um **interceptor do axios** que loga os headers **REAIS** que são enviados na requisição HTTP:

```javascript
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(request => {
  console.log('\n========================================');
  console.log('🔍 HEADERS REAIS ENVIADOS PELO AXIOS');
  console.log('========================================');
  console.log(JSON.stringify(request.headers, null, 2));
  console.log('========================================\n');
  return request;
});

const response = await axiosInstance(axiosConfig);
```

---

## 📊 Como Verificar os Logs

### **No Vercel**

1. Acesse o dashboard do Vercel
2. Vá em **Deployments** → selecione o deployment ativo
3. Clique em **Functions** → selecione a function
4. Veja os logs em tempo real

### **Localmente**

Execute o servidor e faça uma requisição. Você verá:

```bash
========================================
📤 REQUISIÇÃO COMPLETA PARA PAGSMILE
========================================
POST https://gateway.pagsmile.com/api/trade/submit-card-pay

--- REQUEST HEADERS (que serão enviados) ---
{
  "Authorization": "Basic ...",
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Origin": "https://your-project.vercel.app",
  "Referer": "https://your-project.vercel.app",
  "User-Agent": "Mozilla/5.0..."
}

--- REQUEST BODY ---
{...}
========================================

========================================
🔍 HEADERS REAIS ENVIADOS PELO AXIOS
========================================
{
  "Authorization": "Basic ...",
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Origin": "https://your-project.vercel.app",  ← CONFIRMA QUE ESTÁ SENDO ENVIADO
  "Referer": "https://your-project.vercel.app",
  "User-Agent": "Mozilla/5.0...",
  "Accept-Encoding": "gzip, compress, deflate, br",
  "Content-Length": "..."
}
========================================
```

---

## 🎯 O Que Mudou

### **❌ ANTES**

```javascript
const headers = {
  'Authorization': generateAuthHeader(),
  'Content-Type': 'application/json',
  'Accept': 'application/json'
  // ❌ Sem Origin
  // ❌ Sem Referer
  // ❌ Sem User-Agent
};

// Sem logging dos headers reais do axios
const response = await axios({...});
```

### **✅ DEPOIS**

```javascript
const origin = req.headers.origin || req.headers.referer || 
               `${req.protocol}://${req.get('host')}`;

const headers = {
  'Authorization': generateAuthHeader(),
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': origin,              // ✅ Origin explícito
  'Referer': origin,              // ✅ Referer
  'User-Agent': req.headers['user-agent'] || 'Pagsmile-Proxy/1.0'
};

// ✅ Interceptor loga headers REAIS
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(request => {
  console.log('🔍 HEADERS REAIS ENVIADOS PELO AXIOS');
  console.log(JSON.stringify(request.headers, null, 2));
  return request;
});

const response = await axiosInstance(axiosConfig);
```

---

## 🔬 Por Que Isso é Importante?

### **1. Identificação de Origem**

Alguns servidores (como o Pagsmile) podem usar o header `Origin` para:
- Validação de domínio permitido
- Logging e analytics
- Segurança e prevenção de fraudes

### **2. Debugging Completo**

O interceptor do axios mostra **exatamente** quais headers são enviados, incluindo:
- Headers adicionados automaticamente pelo axios (como `Accept-Encoding`, `Content-Length`)
- Headers customizados que definimos
- Confirma que o `Origin` está sendo enviado

### **3. Compatibilidade com Vercel**

No Vercel, o `req.headers.origin` pode vir do navegador através do proxy. Se não vier, usamos fallbacks:

```javascript
const origin = req.headers.origin ||           // Preferência: Origin do browser
               req.headers.referer ||          // Fallback 1: Referer
               `${req.protocol}://${req.get('host')}`; // Fallback 2: Host do servidor
```

---

## 🧪 Como Testar

### **1. Deploy no Vercel**

```bash
vercel --prod
```

### **2. Faça um Pagamento de Teste**

Acesse a aplicação e tente processar um pagamento.

### **3. Verifique os Logs**

No Vercel Dashboard:
- **Functions** → **Logs**
- Procure por `🔍 HEADERS REAIS ENVIADOS PELO AXIOS`
- Confirme que o `Origin` está presente

### **4. Exemplo de Log Esperado**

```json
{
  "Authorization": "Basic MTIzNDU2Nzg5MDEyMzQ1Njp5b3VyX3NlY3JldF9rZXk=",
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Origin": "https://your-project.vercel.app",  ← ✅ PRESENTE
  "Referer": "https://your-project.vercel.app",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "Accept-Encoding": "gzip, compress, deflate, br",
  "Content-Length": "234"
}
```

---

## 📝 Próximos Passos

1. ✅ **Deploy da atualização** no Vercel
2. ✅ **Teste com pagamento real** no ambiente de produção
3. ✅ **Verifique os logs** no Vercel Dashboard
4. ✅ **Confirme** que o header `Origin` está sendo enviado
5. ✅ **Compartilhe os logs** com o time tech se necessário

---

## 🎓 Lições Aprendidas

### **Axios vs Fetch vs Browser**

| Header | Browser (XHR/Fetch) | Axios (Node.js) | Solução |
|--------|---------------------|-----------------|---------|
| `Origin` | ✅ Automático | ❌ Não envia | ✅ Adicionar explicitamente |
| `Referer` | ✅ Automático | ❌ Não envia | ✅ Adicionar explicitamente |
| `User-Agent` | ✅ Automático | ❌ Genérico | ✅ Copiar do request |
| `Authorization` | ⚠️ Manual | ⚠️ Manual | ✅ Já implementado |

### **Importância do Logging**

Sempre use interceptors ou logging detalhado para confirmar que os headers estão sendo enviados como esperado, especialmente em ambientes serverless como Vercel.

---

## 📞 Suporte

Se ainda houver problemas com o header `Origin`:

1. Verifique os logs do Vercel
2. Confirme que o `Origin` está presente nos logs `🔍 HEADERS REAIS`
3. Se o `Origin` estiver presente mas ainda houver erro 403, o problema pode ser:
   - Domínio não permitido no Pagsmile
   - Problema de autenticação
   - Outra validação do servidor Pagsmile

---

**Última atualização:** 2025-12-09
**Versão:** 1.0

