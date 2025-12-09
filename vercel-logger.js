/**
 * Vercel Logger - Sistema de Logging Otimizado para Vercel
 * 
 * Este módulo garante que todos os logs sejam capturados corretamente
 * no ambiente serverless do Vercel, com formatação adequada e timestamps.
 */

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

/**
 * Formata timestamp para logs
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Formata objeto para JSON legível
 */
function formatObject(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

/**
 * Logger principal
 */
class VercelLogger {
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Log informativo
   */
  info(message, data = null) {
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] [INFO] ${this.context ? `[${this.context}] ` : ''}${message}`);
    if (data) {
      console.log(formatObject(data));
    }
  }

  /**
   * Log de erro
   */
  error(message, error = null) {
    const timestamp = getTimestamp();
    console.error(`[${timestamp}] [ERROR] ${this.context ? `[${this.context}] ` : ''}${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
      } else {
        console.error(formatObject(error));
      }
    }
  }

  /**
   * Log de warning
   */
  warn(message, data = null) {
    const timestamp = getTimestamp();
    console.warn(`[${timestamp}] [WARN] ${this.context ? `[${this.context}] ` : ''}${message}`);
    if (data) {
      console.warn(formatObject(data));
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento ou quando DEBUG=true)
   */
  debug(message, data = null) {
    if (process.env.DEBUG === 'true' || !isVercel) {
      const timestamp = getTimestamp();
      console.log(`[${timestamp}] [DEBUG] ${this.context ? `[${this.context}] ` : ''}${message}`);
      if (data) {
        console.log(formatObject(data));
      }
    }
  }

  /**
   * Log de requisição HTTP
   */
  logRequest(req) {
    const timestamp = getTimestamp();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${timestamp}] [REQUEST] ${req.method} ${req.url}`);
    console.log(`${'='.repeat(80)}`);
    console.log('Headers:', formatObject(req.headers));
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', formatObject(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('Query:', formatObject(req.query));
    }
    console.log(`${'='.repeat(80)}\n`);
  }

  /**
   * Log de resposta HTTP
   */
  logResponse(statusCode, data = null) {
    const timestamp = getTimestamp();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${timestamp}] [RESPONSE] Status: ${statusCode}`);
    console.log(`${'='.repeat(80)}`);
    if (data) {
      console.log('Data:', formatObject(data));
    }
    console.log(`${'='.repeat(80)}\n`);
  }

  /**
   * Log específico para headers do Axios
   */
  logAxiosHeaders(headers, label = 'AXIOS HEADERS') {
    const timestamp = getTimestamp();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${timestamp}] [${label}]`);
    console.log(`${'='.repeat(80)}`);
    console.log(formatObject(headers));
    console.log(`${'='.repeat(80)}\n`);
  }

  /**
   * Log de seção (para organizar logs complexos)
   */
  section(title) {
    const timestamp = getTimestamp();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${timestamp}] ${title}`);
    console.log(`${'='.repeat(80)}`);
  }

  /**
   * Fim de seção
   */
  endSection() {
    console.log(`${'='.repeat(80)}\n`);
  }

  /**
   * Log de métrica/performance
   */
  metric(name, value, unit = '') {
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] [METRIC] ${name}: ${value}${unit ? ' ' + unit : ''}`);
  }

  /**
   * Log de evento importante
   */
  event(eventName, data = null) {
    const timestamp = getTimestamp();
    console.log(`\n${'*'.repeat(80)}`);
    console.log(`[${timestamp}] [EVENT] ${eventName}`);
    console.log(`${'*'.repeat(80)}`);
    if (data) {
      console.log(formatObject(data));
    }
    console.log(`${'*'.repeat(80)}\n`);
  }
}

/**
 * Logger específico para o Pagsmile Proxy
 */
class PagsmileProxyLogger extends VercelLogger {
  constructor() {
    super('PAGSMILE-PROXY');
  }

  /**
   * Log de requisição para o Pagsmile
   */
  logPagsmileRequest(method, url, headers, body = null) {
    this.section('📤 REQUISIÇÃO PARA PAGSMILE');
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log('\n--- REQUEST HEADERS ---');
    console.log(formatObject(headers));
    if (body) {
      console.log('\n--- REQUEST BODY ---');
      console.log(formatObject(body));
    }
    this.endSection();
  }

  /**
   * Log de resposta do Pagsmile
   */
  logPagsmileResponse(status, statusText, headers, data) {
    this.section('📥 RESPOSTA DO PAGSMILE');
    console.log(`Status: ${status} ${statusText || ''}`);
    console.log('\n--- RESPONSE HEADERS ---');
    console.log(formatObject(headers));
    console.log('\n--- RESPONSE BODY ---');
    console.log(formatObject(data));
    this.endSection();
  }

  /**
   * Log dos headers REAIS enviados pelo Axios
   */
  logAxiosRealHeaders(headers) {
    this.section('🔍 HEADERS REAIS ENVIADOS PELO AXIOS');
    console.log(formatObject(headers));
    
    // Destaque especial para o header Origin
    if (headers.Origin || headers.origin) {
      const originValue = headers.Origin || headers.origin;
      console.log(`\n✅ Header Origin CONFIRMADO: ${originValue}`);
    } else {
      console.log('\n❌ ATENÇÃO: Header Origin NÃO ENCONTRADO!');
    }
    
    this.endSection();
  }

  /**
   * Log de erro no proxy
   */
  logProxyError(error, context = '') {
    this.section('❌ ERRO NO PROXY');
    console.log(`Context: ${context}`);
    
    if (error.response) {
      console.log(`\nStatus: ${error.response.status}`);
      console.log('Response Data:', formatObject(error.response.data));
      console.log('Response Headers:', formatObject(error.response.headers));
    }
    
    if (error.request) {
      console.log('\nRequest:', formatObject({
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      }));
    }
    
    console.log(`\nMessage: ${error.message}`);
    if (error.stack) {
      console.log(`Stack: ${error.stack}`);
    }
    
    this.endSection();
  }
}

/**
 * Middleware para logar todas as requisições
 */
function requestLoggerMiddleware(logger) {
  return (req, res, next) => {
    const timestamp = getTimestamp();
    const startTime = Date.now();

    // Log da requisição
    logger.info(`${req.method} ${req.url}`, {
      headers: req.headers,
      query: req.query,
      body: req.body
    });

    // Intercepta a resposta
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      logger.metric('Request Duration', duration, 'ms');
      logger.info(`Response ${res.statusCode} for ${req.method} ${req.url}`);
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Função para garantir que logs sejam enviados antes do término da function
 */
async function flushLogs() {
  // No Vercel, precisamos garantir que os logs sejam enviados
  // antes da function terminar
  return new Promise(resolve => {
    // Pequeno delay para garantir que os logs sejam processados
    setTimeout(resolve, 100);
  });
}

/**
 * Informações do ambiente Vercel
 */
function logVercelEnvironment() {
  if (isVercel) {
    console.log('\n' + '='.repeat(80));
    console.log('[VERCEL ENVIRONMENT]');
    console.log('='.repeat(80));
    console.log('VERCEL:', process.env.VERCEL);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('VERCEL_REGION:', process.env.VERCEL_REGION);
    console.log('VERCEL_URL:', process.env.VERCEL_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('='.repeat(80) + '\n');
  }
}

module.exports = {
  VercelLogger,
  PagsmileProxyLogger,
  requestLoggerMiddleware,
  flushLogs,
  logVercelEnvironment,
  isVercel
};

