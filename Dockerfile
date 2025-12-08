# Dockerfile para Pagsmile Credit Card Integration
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o resto dos arquivos
COPY . .

# Expor a porta 3000
EXPOSE 3000

# Variáveis de ambiente (serão sobrescritas pelo Dockploy)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["node", "pagsmile-express-backend.js"]

