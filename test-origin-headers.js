#!/usr/bin/env node

/**
 * Script de Teste - Verificação de Headers Origin
 * 
 * Este script testa se o backend está enviando corretamente
 * o header Origin para o gateway Pagsmile.
 * 
 * Uso:
 *   node test-origin-headers.js [URL]
 * 
 * Exemplos:
 *   node test-origin-headers.js http://localhost:3000
 *   node test-origin-headers.js https://your-project.vercel.app
 */

const axios = require('axios');

// URL base (pode ser passada como argumento)
const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log('\n========================================');
console.log('🧪 TESTE DE HEADERS ORIGIN');
console.log('========================================');
console.log(`URL Base: ${BASE_URL}`);
console.log('========================================\n');

async function testOriginHeader() {
  try {
    console.log('📤 Enviando requisição de teste...\n');

    const testData = {
      test: true,
      timestamp: new Date().toISOString()
    };

    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/pagsmile-proxy/api/test`,
      data: testData,
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`,
        'User-Agent': 'Test-Script/1.0'
      },
      validateStatus: () => true // Aceita qualquer status
    });

    console.log('========================================');
    console.log('📥 RESPOSTA RECEBIDA');
    console.log('========================================');
    console.log(`Status: ${response.status} ${response.statusText || ''}`);
    console.log('\n--- Response Headers ---');
    console.log(JSON.stringify(response.headers, null, 2));
    console.log('\n--- Response Data ---');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('========================================\n');

    // Análise
    console.log('========================================');
    console.log('📊 ANÁLISE');
    console.log('========================================');

    if (response.status === 200) {
      console.log('✅ Status 200 OK');
    } else if (response.status === 403) {
      console.log('❌ Status 403 Forbidden');
      console.log('   Possíveis causas:');
      console.log('   - Header Origin não está sendo enviado');
      console.log('   - Domínio não permitido no Pagsmile');
      console.log('   - Problema de autenticação');
    } else {
      console.log(`⚠️  Status ${response.status}`);
    }

    console.log('\n💡 Dicas:');
    console.log('   1. Verifique os logs do servidor');
    console.log('   2. Procure por "🔍 HEADERS REAIS ENVIADOS PELO AXIOS"');
    console.log('   3. Confirme que "Origin" está presente nos logs');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ ERRO NO TESTE');
    console.error('========================================');
    console.error('Mensagem:', error.message);
    
    if (error.response) {
      console.error('\n--- Response Status ---');
      console.error(error.response.status, error.response.statusText);
      console.error('\n--- Response Data ---');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Dica: O servidor não está rodando.');
      console.error('   Execute: npm start');
    }
    
    console.error('========================================\n');
    process.exit(1);
  }
}

// Teste adicional: Verificar se o servidor está rodando
async function checkServerHealth() {
  try {
    console.log('🔍 Verificando se o servidor está rodando...\n');
    
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: 5000,
      validateStatus: () => true
    });

    if (response.status === 200) {
      console.log('✅ Servidor está rodando\n');
      return true;
    } else {
      console.log(`⚠️  Servidor respondeu com status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Servidor não está rodando');
      console.error('   Execute: npm start\n');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ URL não encontrada:', BASE_URL);
      console.error('   Verifique se a URL está correta\n');
    } else {
      console.error('❌ Erro ao conectar:', error.message, '\n');
    }
    return false;
  }
}

// Teste de headers específicos
async function testSpecificHeaders() {
  console.log('========================================');
  console.log('🔬 TESTE DETALHADO DE HEADERS');
  console.log('========================================\n');

  const headersToTest = [
    { name: 'Origin', value: BASE_URL },
    { name: 'Referer', value: `${BASE_URL}/` },
    { name: 'User-Agent', value: 'Test-Script/1.0' },
    { name: 'Content-Type', value: 'application/json' }
  ];

  console.log('Headers que serão testados:\n');
  headersToTest.forEach(header => {
    console.log(`  ${header.name}: ${header.value}`);
  });
  console.log('\n========================================\n');

  console.log('💡 Instruções:');
  console.log('   1. Mantenha o terminal do servidor visível');
  console.log('   2. Observe os logs em tempo real');
  console.log('   3. Procure pela seção "🔍 HEADERS REAIS ENVIADOS PELO AXIOS"');
  console.log('   4. Confirme que todos os headers acima estão presentes\n');
  console.log('========================================\n');

  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Execução principal
async function main() {
  console.log('Iniciando testes...\n');

  // 1. Verificar se o servidor está rodando
  const serverIsRunning = await checkServerHealth();
  
  if (!serverIsRunning) {
    console.log('❌ Não foi possível continuar os testes.\n');
    process.exit(1);
  }

  // 2. Mostrar headers que serão testados
  await testSpecificHeaders();

  // 3. Executar teste principal
  await testOriginHeader();

  console.log('✅ Testes concluídos!\n');
  console.log('========================================');
  console.log('📝 PRÓXIMOS PASSOS');
  console.log('========================================');
  console.log('1. Verifique os logs do servidor');
  console.log('2. Procure por "🔍 HEADERS REAIS ENVIADOS PELO AXIOS"');
  console.log('3. Confirme que "Origin" está presente');
  console.log('4. Se estiver no Vercel, acesse o Dashboard → Logs');
  console.log('5. Compartilhe os logs com o time tech');
  console.log('========================================\n');
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});

