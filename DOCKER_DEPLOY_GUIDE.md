# 🐳 Guia de Deploy com Docker no Dockploy

Este guia mostra como fazer deploy da integração Pagsmile usando Docker no Dockploy.

---

## 📋 Pré-requisitos

- Acesso ao servidor Dockploy do seu amigo
- Credenciais do Pagsmile (APP_ID e SECRET_KEY)
- Docker e Docker Compose instalados no servidor

---

## 🚀 Método 1: Deploy via Dockploy (RECOMENDADO)

### Passo 1: Fazer Push do Código

```bash
# Adicionar os novos arquivos Docker
git add Dockerfile docker-compose.yml .dockerignore .env.example DOCKER_DEPLOY_GUIDE.md

# Commit
git commit -m "feat: adicionar configuração Docker para Dockploy"

# Push (quando tiver internet)
git push
```

### Passo 2: Configurar no Dockploy

1. **Acesse o painel do Dockploy**
   - URL: `http://ip-do-servidor:3000` (ou o domínio configurado)

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Nome: `pagsmile-integration`
   - Tipo: **Docker Compose** ou **Dockerfile**

3. **Conectar ao repositório:**
   - GitHub/GitLab: Cole a URL do seu repositório
   - Branch: `main`

4. **Configurar variáveis de ambiente:**
   ```env
   PAGSMILE_ENV=prod
   PAGSMILE_APP_ID=seu_app_id_aqui
   PAGSMILE_SECRET_KEY=sua_secret_key_aqui
   PORT=3000
   NODE_ENV=production
   ```

5. **Configurar porta:**
   - Container Port: `3000`
   - Host Port: `3000` (ou outra porta disponível)

6. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build e deploy

---

## 🔧 Método 2: Deploy Manual via SSH

Se preferir fazer manualmente no servidor:

### Passo 1: Conectar ao Servidor

```bash
ssh usuario@ip-do-servidor
```

### Passo 2: Clonar o Repositório

```bash
# Criar diretório
mkdir -p ~/apps
cd ~/apps

# Clonar
git clone https://github.com/seu-usuario/credit-card-integration.git
cd credit-card-integration
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

Preencha:
```env
PAGSMILE_ENV=prod
PAGSMILE_APP_ID=1712342429164979
PAGSMILE_SECRET_KEY=Pagsmile_sk_550e81f379da6f30c670ebaf6fa4f6fc15e87dd960001413f6ffea7b63e24aa
PORT=3000
NODE_ENV=production
```

### Passo 4: Build e Run

```bash
# Build da imagem
docker build -t pagsmile-integration .

# Rodar container
docker run -d \
  --name pagsmile-integration \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  pagsmile-integration
```

**OU usando Docker Compose:**

```bash
# Editar docker-compose.yml com suas credenciais
nano docker-compose.yml

# Subir o container
docker-compose up -d
```

---

## ✅ Verificar se está Funcionando

### 1. Verificar logs:

```bash
# Ver logs em tempo real
docker logs -f pagsmile-integration

# OU com docker-compose
docker-compose logs -f
```

### 2. Testar endpoints:

```bash
# Testar health check
curl http://localhost:3000/api/config

# Deve retornar algo como:
# {"env":"prod","gateway_url":"https://gateway.pagsmile.com"}
```

### 3. Acessar pelo browser:

```
http://ip-do-servidor:3000
```

---

## 🌐 Configurar Domínio (Opcional)

Se quiser usar um domínio customizado:

### Opção 1: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name pagsmile.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Opção 2: Usar Traefik (se Dockploy usar)

Adicione labels no `docker-compose.yml`:

```yaml
services:
  pagsmile-integration:
    # ... resto da config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pagsmile.rule=Host(`pagsmile.seudominio.com`)"
      - "traefik.http.services.pagsmile.loadbalancer.server.port=3000"
```

---

## 🔄 Atualizar a Aplicação

### Via Dockploy:
1. Faça push das alterações no GitHub
2. No Dockploy, clique em "Redeploy"

### Via SSH:
```bash
cd ~/apps/credit-card-integration

# Pull das alterações
git pull

# Rebuild e restart
docker-compose down
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Container não inicia:

```bash
# Ver logs
docker logs pagsmile-integration

# Verificar status
docker ps -a
```

### Porta já em uso:

```bash
# Verificar o que está usando a porta 3000
sudo lsof -i :3000

# Mudar a porta no docker-compose.yml
ports:
  - "8080:3000"  # Usar porta 8080 no host
```

### Variáveis de ambiente não carregam:

```bash
# Verificar variáveis dentro do container
docker exec pagsmile-integration env | grep PAGSMILE
```

### Erro 403 persiste:

Lembre-se: você precisa solicitar ao Pagsmile que adicione seu domínio na whitelist!

```
Domínio para whitelist: http://ip-do-servidor:3000
ou: https://seudominio.com
```

---

## 📊 Monitoramento

### Ver uso de recursos:

```bash
# Stats do container
docker stats pagsmile-integration
```

### Ver logs com filtro:

```bash
# Apenas erros
docker logs pagsmile-integration 2>&1 | grep -i error

# Últimas 100 linhas
docker logs --tail 100 pagsmile-integration
```

---

## 🔒 Segurança

### Recomendações:

1. **Nunca commite o arquivo .env** (já está no .gitignore)
2. **Use HTTPS** em produção (configure SSL/TLS)
3. **Firewall:** Libere apenas as portas necessárias
4. **Atualize regularmente:** `docker pull node:18-alpine`

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `docker logs -f pagsmile-integration`
2. Teste os endpoints: `curl http://localhost:3000/api/config`
3. Verifique as variáveis de ambiente
4. Confirme que o domínio está na whitelist do Pagsmile

---

## 🎯 Checklist Final

- [ ] Dockerfile criado
- [ ] docker-compose.yml configurado
- [ ] Variáveis de ambiente definidas
- [ ] Push do código feito
- [ ] Deploy no Dockploy configurado
- [ ] Container rodando
- [ ] Endpoints testados
- [ ] Domínio solicitado na whitelist do Pagsmile
- [ ] SSL/HTTPS configurado (se aplicável)

---

**Pronto! Sua aplicação está rodando no Docker! 🚀**

