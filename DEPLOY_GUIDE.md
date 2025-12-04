# 🚀 Quick Deploy Guide - Pagsmile Integration

## 🎯 Objetivo

Fazer deploy da aplicação em um ambiente de produção **GRATUITO** para obter um domínio HTTPS e solicitar whitelist à Pagsmile.

---

## ⚡ Opção 1: Vercel (RECOMENDADO - 5 minutos)

### Por que Vercel?
- ✅ Mais rápido e fácil
- ✅ HTTPS grátis
- ✅ Deploy automático
- ✅ Suporta Node.js + Frontend

### Passo a Passo

#### 1. Instale o Vercel CLI
```bash
npm install -g vercel
```

#### 2. Crie o arquivo de configuração

Crie `vercel.json` na raiz do projeto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "pagsmile-express-backend.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "pagsmile-express-backend.js"
    },
    {
      "src": "/pagsmile-proxy/(.*)",
      "dest": "pagsmile-express-backend.js"
    },
    {
      "src": "/success",
      "dest": "pagsmile-express-backend.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ]
}
```

#### 3. Faça o deploy
```bash
vercel
```

Siga os prompts:
- Set up and deploy? **Y**
- Which scope? **[Sua conta]**
- Link to existing project? **N**
- Project name? **pagsmile-integration** (ou outro nome)
- In which directory is your code located? **./**

#### 4. Configure as variáveis de ambiente
```bash
vercel env add PAGSMILE_APP_ID
# Cole seu APP_ID quando solicitado

vercel env add PAGSMILE_SECURITY_KEY
# Cole seu SECURITY_KEY quando solicitado

vercel env add PAGSMILE_PUBLIC_KEY
# Cole seu PUBLIC_KEY quando solicitado

vercel env add PAGSMILE_ENV
# Digite: prod

vercel env add PAGSMILE_REGION_CODE
# Digite: BRA
```

#### 5. Faça um novo deploy com as variáveis
```bash
vercel --prod
```

#### 6. Você receberá uma URL como:
```
✅ Production: https://pagsmile-integration.vercel.app
```

---

## 📧 Envie o Email para Pagsmile

Copie e adapte este template:

```
Para: support@pagsmile.com, integration@pagsmile.com
Assunto: Domain Whitelist Request for JS SDK Integration - PCI DSS Compliance

Dear Pagsmile Team,

We are integrating the Pagsmile JS SDK for credit card payments and need to 
whitelist our domains for CORS access as per PCI DSS requirements.

Please whitelist the following domains:

Development Environment:
- http://localhost:3000

Production Environment:
- https://pagsmile-integration.vercel.app (SUBSTITUA PELA SUA URL)

Merchant Information:
- APP_ID: [SEU APP_ID]
- Company Name: [SUA EMPRESA]
- Contact Email: lucas.heredia@xcloudgame.com
- Integration Date: December 2025

Please confirm once the domains are whitelisted so we can proceed with testing.

Thank you!

Best regards,
Lucas Heredia
```

---

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças no código:

```bash
# Commit suas mudanças
git add .
git commit -m "Update: description"
git push

# Deploy no Vercel
vercel --prod
```

Ou configure deploy automático conectando seu GitHub ao Vercel!

---

## 🌐 Outras Opções de Hospedagem Gratuita

### Render.com
1. Acesse: https://render.com
2. Conecte seu repositório GitHub
3. Crie um "Web Service"
4. Configure:
   - Build Command: `npm install`
   - Start Command: `node pagsmile-express-backend.js`
5. Adicione as variáveis de ambiente no dashboard
6. Deploy automático!

**URL gratuita:** `https://your-app.onrender.com`

---

### Railway.app
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**URL gratuita:** `https://your-app.up.railway.app`

---

### Heroku
```bash
# Instale Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create pagsmile-integration

# Crie Procfile
echo "web: node pagsmile-express-backend.js" > Procfile

# Deploy
git push heroku main

# Configure variáveis
heroku config:set PAGSMILE_APP_ID=your_app_id
heroku config:set PAGSMILE_SECURITY_KEY=your_key
heroku config:set PAGSMILE_PUBLIC_KEY=your_public_key
heroku config:set PAGSMILE_ENV=prod
heroku config:set PAGSMILE_REGION_CODE=BRA
```

**URL gratuita:** `https://pagsmile-integration.herokuapp.com`

---

## ✅ Checklist Final

- [ ] Deploy feito com sucesso
- [ ] URL de produção obtida (https://...)
- [ ] Aplicação acessível no navegador
- [ ] Email enviado para Pagsmile com lista de domínios
- [ ] Aguardando confirmação da Pagsmile (1-3 dias úteis)

---

## 🆘 Problemas Comuns

### Erro: "Module not found"
```bash
# Certifique-se que package.json está correto
npm install
vercel --prod
```

### Erro: "Environment variables not set"
```bash
# Configure todas as variáveis
vercel env add PAGSMILE_APP_ID
vercel env add PAGSMILE_SECURITY_KEY
vercel env add PAGSMILE_PUBLIC_KEY
vercel env add PAGSMILE_ENV
vercel env add PAGSMILE_REGION_CODE

# Redeploy
vercel --prod
```

### Erro 404 nas rotas
- Verifique se `vercel.json` está correto
- Certifique-se que os caminhos das rotas estão corretos

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Pagsmile Support**: support@pagsmile.com
- **Seu Email**: lucas.heredia@xcloudgame.com

---

## 🎉 Próximos Passos Após Whitelist

Quando a Pagsmile confirmar o whitelist:

1. Acesse sua URL de produção
2. Preencha o formulário de checkout
3. Teste um pagamento
4. Verifique se não há mais erro de CORS
5. Celebre! 🎊

---

**Tempo estimado total:** 10-15 minutos para deploy + 1-3 dias para whitelist da Pagsmile

