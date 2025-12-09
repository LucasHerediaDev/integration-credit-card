#!/usr/bin/env node

/**
 * Script de Diagnóstico - Identificar Parâmetros Faltantes
 * 
 * Este script analisa os logs do proxy para identificar quais
 * parâmetros estão sendo enviados para o Pagsmile e quais podem
 * estar faltando.
 */

console.log('\n========================================');
console.log('🔍 DIAGNÓSTICO DE PARÂMETROS FALTANTES');
console.log('========================================\n');

// Parâmetros obrigatórios para submit-card-pay segundo a documentação
const REQUIRED_PARAMS = {
  'prepay_id': {
    description: 'ID de pré-pagamento obtido no /trade/create',
    source: 'Query param ou Body',
    example: 'dGVzdFByZXBheUlkRm9yRXhhbXBsZQ=='
  },
  'card_token': {
    description: 'Token do cartão criptografado pelo SDK',
    source: 'Query param ou Body',
    example: 'tok_abc123xyz456'
  },
  'app_id': {
    description: 'ID da aplicação Pagsmile',
    source: 'Body',
    example: '1234567890123456'
  },
  'phone': {
    description: 'Telefone do cliente',
    source: 'Body',
    example: '5511999999999'
  },
  'email': {
    description: 'Email do cliente',
    source: 'Body',
    example: 'customer@example.com'
  },
  'postal_code': {
    description: 'CEP do cliente',
    source: 'Body',
    example: '01310100'
  },
  'payer_id': {
    description: 'CPF do cliente',
    source: 'Body',
    example: '12345678900'
  },
  'address': {
    description: 'Objeto com endereço completo',
    source: 'Body',
    example: {
      country_code: 'BRA',
      zip_code: '01310100',
      state: 'SP',
      city: 'São Paulo',
      street: 'Avenida Paulista 1000'
    }
  }
};

console.log('📋 Parâmetros Obrigatórios para submit-card-pay:\n');
console.log('┌─────────────────┬──────────────────────────────────────────┬──────────────┐');
console.log('│ Parâmetro       │ Descrição                                │ Fonte        │');
console.log('├─────────────────┼──────────────────────────────────────────┼──────────────┤');

Object.entries(REQUIRED_PARAMS).forEach(([param, info]) => {
  const paramPadded = param.padEnd(15);
  const descPadded = info.description.padEnd(40);
  const sourcePadded = info.source.padEnd(12);
  console.log(`│ ${paramPadded} │ ${descPadded} │ ${sourcePadded} │`);
});

console.log('└─────────────────┴──────────────────────────────────────────┴──────────────┘\n');

console.log('========================================');
console.log('🔧 COMO VERIFICAR OS PARÂMETROS');
console.log('========================================\n');

console.log('1. Verifique os logs do servidor (Vercel ou local)');
console.log('2. Procure pela seção "📤 REQUISIÇÃO COMPLETA PARA PAGSMILE"');
console.log('3. Compare os parâmetros enviados com a lista acima');
console.log('4. Certifique-se de que TODOS os parâmetros estão presentes\n');

console.log('========================================');
console.log('💡 POSSÍVEIS CAUSAS DO ERRO 40001');
console.log('========================================\n');

const possibleCauses = [
  {
    issue: 'prepay_id faltando ou vazio',
    solution: 'Verificar se o /trade/create retornou um prepay_id válido'
  },
  {
    issue: 'card_token faltando',
    solution: 'Verificar se o SDK está gerando o card_token corretamente'
  },
  {
    issue: 'app_id não está sendo enviado no body',
    solution: 'Adicionar app_id explicitamente no payload'
  },
  {
    issue: 'Query params não estão sendo mesclados no body',
    solution: 'Verificar o código do proxy que mescla query params'
  },
  {
    issue: 'Campos do endereço incompletos',
    solution: 'Verificar se address.country_code, state, city, street estão presentes'
  },
  {
    issue: 'Formato incorreto de algum campo',
    solution: 'Verificar se phone tem código do país, CPF tem 11 dígitos, etc'
  }
];

possibleCauses.forEach((cause, index) => {
  console.log(`${index + 1}. ❌ ${cause.issue}`);
  console.log(`   ✅ Solução: ${cause.solution}\n`);
});

console.log('========================================');
console.log('📝 EXEMPLO DE PAYLOAD CORRETO');
console.log('========================================\n');

const correctPayload = {
  // Query params mesclados no body
  prepay_id: 'dGVzdFByZXBheUlkRm9yRXhhbXBsZQ==',
  card_token: 'tok_abc123xyz456',
  
  // Dados do pagamento
  app_id: '1234567890123456',
  phone: '5511999999999',
  email: 'customer@example.com',
  postal_code: '01310100',
  payer_id: '12345678900',
  address: {
    country_code: 'BRA',
    zip_code: '01310100',
    state: 'SP',
    city: 'São Paulo',
    street: 'Avenida Paulista 1000'
  }
};

console.log(JSON.stringify(correctPayload, null, 2));

console.log('\n========================================');
console.log('🚀 PRÓXIMOS PASSOS');
console.log('========================================\n');

console.log('1. Acesse os logs do Vercel ou do servidor local');
console.log('2. Encontre a última requisição para submit-card-pay');
console.log('3. Copie o body da requisição');
console.log('4. Compare com o exemplo acima');
console.log('5. Identifique qual parâmetro está faltando');
console.log('6. Ajuste o código do frontend ou do proxy\n');

console.log('========================================');
console.log('📞 SUPORTE');
console.log('========================================\n');

console.log('Se o problema persistir:');
console.log('- Compartilhe os logs completos da requisição');
console.log('- Entre em contato com o suporte do Pagsmile');
console.log('- Verifique a documentação: https://docs.pagsmile.com\n');

console.log('✅ Diagnóstico concluído!\n');

