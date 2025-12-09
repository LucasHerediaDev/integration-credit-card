// server.js
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Sistema de logging otimizado para Vercel
const { 
  VercelLogger, 
  PagsmileProxyLogger, 
  flushLogs,
  logVercelEnvironment,
  isVercel
} = require('./vercel-logger');

const app = express();

// Loggers
const logger = new VercelLogger('APP');
const proxyLogger = new PagsmileProxyLogger();

// Log do ambiente Vercel na inicialização
logVercelEnvironment();
logger.info('🚀 Iniciando aplicação...', {
  isVercel,
  nodeVersion: process.version,
  platform: process.platform
});

// Middleware
app.use(cors()); // Habilita CORS para todas as rotas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Desabilita cache em desenvolvimento
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static('public'));

// Configurações do Pagsmile
const PAGSMILE_CONFIG = {
  APP_ID: process.env.PAGSMILE_APP_ID,
  SECURITY_KEY: process.env.PAGSMILE_SECURITY_KEY,
  PUBLIC_KEY: process.env.PAGSMILE_PUBLIC_KEY,
  ENV: process.env.PAGSMILE_ENV || 'sandbox',
  GATEWAY_URL: process.env.PAGSMILE_ENV === 'prod' 
    ? 'https://gateway.pagsmile.com' 
    : 'https://gateway-test.pagsmile.com',
  REGION_CODE: process.env.PAGSMILE_REGION_CODE || 'BRA',
  DOMAIN: process.env.DOMAIN || 'http://localhost:3000'
};

// Função para gerar Authorization header
function generateAuthHeader() {
  const credentials = `${PAGSMILE_CONFIG.APP_ID}:${PAGSMILE_CONFIG.SECURITY_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

// Função para gerar timestamp no formato esperado (yyyy-MM-dd HH:mm:ss)
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Rota principal - Página de checkout
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/checkout.html');
});

// Rota para obter as credenciais públicas (para o frontend)
app.get('/api/config', (req, res) => {
  res.json({
    app_id: PAGSMILE_CONFIG.APP_ID,
    public_key: PAGSMILE_CONFIG.PUBLIC_KEY,
    env: PAGSMILE_CONFIG.ENV,
    region_code: PAGSMILE_CONFIG.REGION_CODE,
    domain: PAGSMILE_CONFIG.DOMAIN
  });
});

// Rota para criar uma ordem e obter o prepay_id
app.post('/api/create-order', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.event('📝 CREATE ORDER - Iniciando criação de pedido');
    logger.info('Request body', req.body);
    
    const { amount, customerInfo } = req.body;

    // Gera um ID único para a transação
    const outTradeNo = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Order ID gerado', outTradeNo);

    // Determina a moeda baseada na região
    let currency = 'BRL'; // Brasil
    if (PAGSMILE_CONFIG.REGION_CODE === 'EUP') currency = 'EUR';
    if (PAGSMILE_CONFIG.REGION_CODE === 'USA') currency = 'USD';

    // Monta o payload para a API do Pagsmile
    const payload = {
      app_id: PAGSMILE_CONFIG.APP_ID,
      out_trade_no: outTradeNo,
      method: 'CreditCard',
      order_amount: parseFloat(amount).toFixed(2),
      order_currency: currency,
      subject: 'Pagamento de Produto',
      content: 'Descrição do produto ou serviço',
      notify_url: `${PAGSMILE_CONFIG.DOMAIN}/api/webhook/payment`,
      return_url: `${PAGSMILE_CONFIG.DOMAIN}/success`,
      timestamp: generateTimestamp(),
      timeout_express: '1d',
      version: '2.0',
      trade_type: 'API',
      buyer_id: customerInfo.email || `buyer_${Date.now()}`,
      customer: {
        identify: {
          type: 'CPF',
          number: customerInfo.cpf
        },
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      address: {
        zip_code: customerInfo.zipCode,
        state: customerInfo.state,
        city: customerInfo.city,
        street_name: customerInfo.address,
        street_number: '1'
      }
    };

    logger.section('📤 Enviando requisição para Pagsmile /trade/create');
    logger.info('URL', `${PAGSMILE_CONFIG.GATEWAY_URL}/trade/create`);
    logger.info('Payload', payload);
    logger.endSection();

    // Faz a requisição para a API do Pagsmile
    const response = await axios.post(
      `${PAGSMILE_CONFIG.GATEWAY_URL}/trade/create`,
      payload,
      {
        headers: {
          'Authorization': generateAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.section('📥 Resposta do Pagsmile /trade/create');
    logger.info('Status', response.status);
    logger.info('Data', response.data);
    logger.endSection();

    if (response.data.code === '10000') {
      const duration = Date.now() - startTime;
      logger.metric('Create Order Duration', duration, 'ms');
      logger.event('✅ Ordem criada com sucesso', {
        prepay_id: response.data.prepay_id,
        trade_no: response.data.trade_no,
        out_trade_no: outTradeNo
      });
      
      if (isVercel) await flushLogs();
      
      res.json({
        success: true,
        prepay_id: response.data.prepay_id,
        trade_no: response.data.trade_no,
        out_trade_no: outTradeNo
      });
    } else {
      logger.error('❌ Erro ao criar ordem', {
        error: response.data.msg,
        sub_error: response.data.sub_msg,
        code: response.data.code,
        sub_code: response.data.sub_code
      });
      
      if (isVercel) await flushLogs();
      
      res.status(400).json({
        success: false,
        error: response.data.msg || 'Erro ao criar ordem',
        sub_error: response.data.sub_msg,
        code: response.data.code,
        sub_code: response.data.sub_code
      });
    }

  } catch (error) {
    logger.error('❌ Exceção ao criar ordem', error);
    
    if (isVercel) await flushLogs();
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.response?.data || error.message
    });
  }
});

// Rota para consultar status de uma transação
app.get('/api/query-transaction/:tradeNo', async (req, res) => {
  try {
    const { tradeNo } = req.params;

    const payload = {
      app_id: PAGSMILE_CONFIG.APP_ID,
      trade_no: tradeNo,
      timestamp: generateTimestamp()
    };

    console.log('=== Consultando transação ===');
    console.log('Trade No:', tradeNo);

    const response = await axios.post(
      `${PAGSMILE_CONFIG.GATEWAY_URL}/trade/query`,
      payload,
      {
        headers: {
          'Authorization': generateAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Status da transação:', response.data.trade_status);
    console.log('Resposta completa:', response.data);

    res.json(response.data);

  } catch (error) {
    console.error('Erro ao consultar transação:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar transação',
      details: error.response?.data || error.message
    });
  }
});

// Nova rota para consultar status usando out_trade_no
app.get('/api/query-by-order/:outTradeNo', async (req, res) => {
  try {
    const { outTradeNo } = req.params;

    const payload = {
      app_id: PAGSMILE_CONFIG.APP_ID,
      out_trade_no: outTradeNo,
      timestamp: generateTimestamp()
    };

    const response = await axios.post(
      `${PAGSMILE_CONFIG.GATEWAY_URL}/trade/query`,
      payload,
      {
        headers: {
          'Authorization': generateAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Erro ao consultar ordem:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar ordem',
      details: error.response?.data || error.message
    });
  }
});

// Webhook para receber notificações do Pagsmile
app.post('/api/webhook/payment', async (req, res) => {
  try {
    console.log('=== Webhook recebido ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const signature = req.headers['pagsmile-signature'];
    const notification = req.body;
    
    // Aqui você processa a notificação conforme sua lógica de negócio
    switch(notification.trade_status) {
      case 'SUCCESS':
        console.log(`✅ Pagamento aprovado: ${notification.trade_no}`);
        // Atualizar banco de dados, enviar email, etc.
        break;
      case 'FAILED':
        console.log(`❌ Pagamento falhou: ${notification.trade_no}`);
        break;
      case 'PROCESSING':
        console.log(`⏳ Pagamento em processamento: ${notification.trade_no}`);
        break;
      default:
        console.log(`❓ Status desconhecido: ${notification.trade_status}`);
    }

    // Sempre retornar success para confirmar recebimento
    res.json({ result: 'success' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ result: 'failed' });
  }
});

// Proxy reverso para todas as requisições do Pagsmile SDK (resolve CORS)
app.use('/pagsmile-proxy', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extrai o caminho após /pagsmile-proxy (ex: api/trade/submit-card-pay)
    const path = req.path.substring(1);
    
    proxyLogger.section('🔄 PROXY PAGSMILE - INÍCIO');
    proxyLogger.info('Método', req.method);
    proxyLogger.info('Caminho original', req.path);
    proxyLogger.info('Headers recebidos', req.headers);
    proxyLogger.info('Query params recebidos', req.query);
    proxyLogger.info('Body recebido', req.body);
    proxyLogger.endSection();
    
    // Mescla query params no body para endpoints POST
    let requestBody = { ...(req.body || {}) };
    
    // Adiciona query params ao body
    if (req.query && Object.keys(req.query).length > 0) {
      proxyLogger.info('Mesclando query params no body...');
      requestBody = { ...requestBody, ...req.query };
    }
    
    // URL final (SEM query params - tudo vai no body)
    const targetUrl = `${PAGSMILE_CONFIG.GATEWAY_URL}/${path}`;
    
    proxyLogger.info('URL de destino', targetUrl);
    proxyLogger.info('Body final mesclado', requestBody);

    // Determina a origem dinamicamente (Vercel ou localhost)
    let origin;
    
    // 1. Prioridade MÁXIMA: Usar o domínio frontend fixo
    origin = 'https://nextjs.arluck.com.br';
    
    // 2. Fallback: usar DOMAIN configurado no .env (se não for localhost)
    if (!origin && PAGSMILE_CONFIG.DOMAIN && !PAGSMILE_CONFIG.DOMAIN.includes('localhost')) {
      origin = PAGSMILE_CONFIG.DOMAIN;
    }
    // 3. Tentar extrair do header Origin da requisição
    else if (!origin && req.headers.origin) {
      origin = req.headers.origin;
    }
    // 4. Tentar extrair do header Referer
    else if (!origin && req.headers.referer) {
      try {
        const refererUrl = new URL(req.headers.referer);
        origin = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        origin = req.headers.referer;
      }
    }
    // 5. Construir a partir dos headers do proxy (Vercel)
    else if (!origin && req.headers['x-forwarded-host']) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      origin = `${protocol}://${req.headers['x-forwarded-host']}`;
    }
    // 6. Fallback final: construir a partir do host da requisição
    else if (!origin) {
      const protocol = req.protocol || 'http';
      const host = req.get('host');
      origin = `${protocol}://${host}`;
    }
    
    proxyLogger.info('🌐 Origin determinado', origin);
    proxyLogger.info('📋 Origin sources', {
      configured_domain: PAGSMILE_CONFIG.DOMAIN,
      header_origin: req.headers.origin,
      header_referer: req.headers.referer,
      x_forwarded_proto: req.headers['x-forwarded-proto'],
      x_forwarded_host: req.headers['x-forwarded-host'],
      req_protocol: req.protocol,
      req_host: req.get('host'),
      final_origin: origin
    });
    
    // Headers com Authorization e Origin explícito
    const headers = {
      'Authorization': generateAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': origin, // ✅ Adiciona Origin explicitamente
      'Referer': origin,
      'User-Agent': req.headers['user-agent'] || 'Pagsmile-Proxy/1.0'
    };

    // LOG COMPLETO DA REQUISIÇÃO QUE VAI PARA O PAGSMILE
    proxyLogger.logPagsmileRequest(req.method, targetUrl, headers, requestBody);

    // Configuração do axios com interceptor para logar headers reais
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      data: req.method !== 'GET' && req.method !== 'HEAD' ? requestBody : undefined,
      headers: headers,
      validateStatus: () => true // Aceita qualquer status para debug
    };

    // Interceptor para logar os headers REAIS que o axios envia
    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use(request => {
      proxyLogger.logAxiosRealHeaders(request.headers);
      return request;
    });

    // Faz a requisição para o Pagsmile
    const response = await axiosInstance(axiosConfig);

    // LOG COMPLETO DA RESPOSTA DO PAGSMILE
    proxyLogger.logPagsmileResponse(
      response.status, 
      response.statusText, 
      response.headers, 
      response.data
    );

    // Métrica de performance
    const duration = Date.now() - startTime;
    proxyLogger.metric('Proxy Request Duration', duration, 'ms');

    // Garante que os logs sejam enviados no Vercel antes de retornar
    if (isVercel) {
      await flushLogs();
    }

    // Retorna a resposta do Pagsmile
    res.status(response.status).json(response.data);

  } catch (error) {
    // Log detalhado do erro
    proxyLogger.logProxyError(error, 'Erro ao fazer requisição para Pagsmile');
    
    // Métrica de performance mesmo em caso de erro
    const duration = Date.now() - startTime;
    proxyLogger.metric('Proxy Request Duration (Error)', duration, 'ms');
    
    // Garante que os logs de erro sejam enviados no Vercel
    if (isVercel) {
      await flushLogs();
    }
    
    res.status(error.response?.status || 500).json(
      error.response?.data || {
        success: false,
        status: 'failed',
        message: error.message
      }
    );
  }
});

// Rota para página de sucesso
app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Processado - Pagsmile</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --pagsmile-primary: #1E3A8A;
          --pagsmile-secondary: #3B82F6;
          --pagsmile-accent: #60A5FA;
          --pagsmile-dark: #1E293B;
          --pagsmile-success: #10B981;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%);
          padding: 20px;
        }
        
        .container {
          background: white;
          padding: 50px 40px;
          border-radius: 20px;
          box-shadow: 0 25px 70px rgba(30, 58, 138, 0.4);
          text-align: center;
          max-width: 500px;
          width: 100%;
          animation: fadeInUp 0.6s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .logo-text {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--pagsmile-primary), var(--pagsmile-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 30px;
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--pagsmile-success), #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          font-size: 40px;
          color: white;
          animation: scaleIn 0.5s ease 0.2s both;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        h1 {
          color: var(--pagsmile-dark);
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        p {
          color: #64748B;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        
        .btn {
          display: inline-block;
          margin-top: 10px;
          padding: 16px 40px;
          background: linear-gradient(135deg, var(--pagsmile-primary), var(--pagsmile-secondary));
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(30, 58, 138, 0.3);
        }
        
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(30, 58, 138, 0.4);
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #E2E8F0;
          color: #94A3B8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-text">Pagsmile</div>
        <div class="success-icon">✓</div>
        <h1>Pagamento em Processamento</h1>
        <p>Sua transação está sendo processada com segurança. Você receberá uma confirmação por email em breve.</p>
        <a href="/" class="btn">Voltar ao Checkout</a>
        <div class="footer">
          🔒 Transação segura processada por Pagsmile
        </div>
      </div>
    </body>
    </html>
  `);
});

// Endpoint de teste para verificar credenciais
app.get('/api/test-credentials', (req, res) => {
  res.json({
    app_id_exists: !!PAGSMILE_CONFIG.APP_ID,
    security_key_exists: !!PAGSMILE_CONFIG.SECURITY_KEY,
    public_key_exists: !!PAGSMILE_CONFIG.PUBLIC_KEY,
    env: PAGSMILE_CONFIG.ENV,
    region: PAGSMILE_CONFIG.REGION_CODE,
    gateway_url: PAGSMILE_CONFIG.GATEWAY_URL,
    auth_header_sample: generateAuthHeader().substring(0, 20) + '...'
  });
});

// Rota de health check com logging
app.get('/health', (req, res) => {
  logger.info('Health check requisitado');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: {
      isVercel,
      env: PAGSMILE_CONFIG.ENV,
      region: PAGSMILE_CONFIG.REGION_CODE,
      nodeVersion: process.version
    }
  });
});

const PORT = process.env.PORT || 3000;

// Vercel não usa app.listen(), mas mantemos para desenvolvimento local
if (!isVercel) {
  app.listen(PORT, () => {
    logger.section('🚀 SERVIDOR INICIADO');
    logger.info('Porta', PORT);
    logger.info('Ambiente', PAGSMILE_CONFIG.ENV);
    logger.info('Região', PAGSMILE_CONFIG.REGION_CODE);
    logger.info('Gateway', PAGSMILE_CONFIG.GATEWAY_URL);
    logger.info('Domínio', PAGSMILE_CONFIG.DOMAIN);
    logger.endSection();
  });
} else {
  logger.info('🌐 Rodando no Vercel - Serverless Mode');
}

// Exporta o app para o Vercel
module.exports = app;