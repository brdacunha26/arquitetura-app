import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import { config } from 'dotenv';

// Log de diagnóstico detalhado
console.log('🔍 Iniciando verificação de conexão com o banco de dados');
console.log('Node.js versão:', process.version);
console.log('Diretório atual:', process.cwd());
console.log('Caminho do script:', __filename);

// Função para validar chave de API
function validateSupabaseKey(key: string): boolean {
  // Verificações básicas de formato
  if (!key) return false;
  
  // Verificar se tem 3 partes separadas por pontos (JWT típico)
  const parts = key.split('.');
  if (parts.length !== 3) {
    console.error('❌ Chave de API não segue formato JWT esperado');
    return false;
  }

  // Verificar comprimento mínimo
  if (key.length < 100) {
    console.error('❌ Chave de API parece muito curta');
    return false;
  }

  return true;
}

// Log de variáveis de ambiente do sistema
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🌍 Detalhes da Conexão Supabase:');
console.log('URL:', supabaseUrl);
console.log('Chave Anônima Válida:', validateSupabaseKey(supabaseAnonKey || ''));
console.log('Comprimento da Chave:', supabaseAnonKey?.length);

// Função de leitura de arquivo mais robusta
function readEnvFile(filePath: string): {[key: string]: string} {
  try {
    console.log(`🔍 Tentando ler arquivo: ${filePath}`);
    
    // Tentar múltiplas codificações
    const encodings = ['utf8', 'utf-8', 'latin1', 'windows-1252'];
    
    for (const encoding of encodings) {
      try {
        const fileContent = fs.readFileSync(filePath, { encoding: encoding as BufferEncoding });
        
        console.log(`📋 Leitura bem-sucedida com codificação: ${encoding}`);
        
        // Processar conteúdo do arquivo
        const envVars: {[key: string]: string} = {};
        const lines = fileContent.split('\n');
        
        lines.forEach(line => {
          line = line.trim();
          if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
              const cleanKey = key.trim();
              const cleanValue = value.trim().replace(/^["']|["']$/g, '');
              envVars[cleanKey] = cleanValue;
              process.env[cleanKey] = cleanValue;
            }
          }
        });

        console.log('📦 Variáveis encontradas:', Object.keys(envVars));
        return envVars;
      } catch (readError) {
        console.warn(`❌ Falha ao ler com codificação ${encoding}:`, readError);
      }
    }

    throw new Error(`Não foi possível ler o arquivo com nenhuma codificação`);
  } catch (error) {
    console.error(`❌ Erro ao processar arquivo ${filePath}:`, error);
    return {};
  }
}

// Substituir carregamento de arquivo
const envFiles = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env')
];

const loadedEnvVars: {[key: string]: string} = {};

envFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const fileVars = readEnvFile(filePath);
    Object.assign(loadedEnvVars, fileVars);
  }
});

console.log('🌍 Variáveis de ambiente carregadas:', Object.keys(loadedEnvVars));

// Tentar múltiplos caminhos para o arquivo .env
const possibleEnvPaths: string[] = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '.env')
];

// Função para ler arquivo com diferentes codificações
function readFileWithEncoding(filePath: string): string {
  const encodings: string[] = ['utf8', 'utf16le', 'latin1', 'windows-1252'];
  
  for (const encoding of encodings) {
    try {
      const buffer: Buffer = fs.readFileSync(filePath);
      const content: string = iconv.decode(buffer, encoding);
      
      console.log(`📋 Conteúdo do arquivo .env (${encoding}):`, content);
      
      return content;
    } catch (error: unknown) {
      console.warn(`Falha ao ler arquivo com codificação ${encoding}:`, 
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    }
  }
  
  throw new Error('Não foi possível ler o arquivo com nenhuma codificação');
}

let envPath: string | null = null;
let fileContent: string | null = null;

for (const testPath of possibleEnvPaths) {
  console.log('📄 Testando caminho:', testPath);
  if (fs.existsSync(testPath)) {
    try {
      fileContent = readFileWithEncoding(testPath);
      envPath = testPath;
      break;
    } catch (error: unknown) {
      console.error('Erro ao ler arquivo:', 
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    }
  }
}

if (!envPath) {
  console.error('❌ Nenhum arquivo .env encontrado nos seguintes caminhos:', possibleEnvPaths);
  process.exit(1);
}

console.log('📂 Carregando variáveis de ambiente de:', envPath);

// Escrever conteúdo em um novo arquivo temporário
const tempEnvPath: string = path.join(process.cwd(), '.env.temp');
fs.writeFileSync(tempEnvPath, fileContent || '', 'utf8');

const envConfig = dotenv.config({ path: tempEnvPath });

// Remover arquivo temporário
fs.unlinkSync(tempEnvPath);

// Log detalhado do resultado do carregamento
console.log('📦 Resultado do carregamento do dotenv:', JSON.stringify(envConfig, null, 2));

// Validação de variáveis de ambiente
const requiredEnvVars: string[] = [
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Log de todas as variáveis de ambiente
console.log('�� Todas as variáveis de ambiente:');
Object.entries(process.env).forEach(([key, value]) => {
  console.log(`- ${key}: ${value ? 'Presente' : 'Ausente'}`);
});

const missingVars: string[] = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente ausentes:', missingVars);
  process.exit(1);
}

// Log de variáveis de ambiente
console.log('🔑 Variáveis de ambiente carregadas:');
requiredEnvVars.forEach(varName => {
  console.log(`- ${varName}: ${process.env[varName] ? 'Presente' : 'Ausente'}`);
});

async function verifyDatabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🌐 Detalhes da Conexão:');
  console.log('URL:', supabaseUrl);
  console.log('Chave Anônima (primeiros 10 caracteres):', supabaseAnonKey?.substring(0, 10));
  console.log('Chave Service Role (primeiros 10 caracteres):', supabaseServiceRoleKey?.substring(0, 10));

  try {
    // Validações adicionais
    if (!supabaseUrl) {
      throw new Error('URL do Supabase não definida');
    }

    if (!supabaseServiceRoleKey) {
      console.warn('⚠️ Chave Service Role não definida, usando chave anônima');
    }

    console.log('🔑 Criando cliente Supabase...');
    const supabase = createClient(
      supabaseUrl, 
      supabaseServiceRoleKey || supabaseAnonKey || '', 
      {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            'x-verification-request': 'database-connection-test'
          }
        }
      }
    );

    console.log('📋 Tentando buscar membros da equipe...');
    const { data: members, error: fetchError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact' })
      .range(0, 10);

    if (fetchError) {
      console.error('❌ Erro detalhado ao buscar membros:', {
        message: fetchError.message,
        details: fetchError,
        code: fetchError.code,
        hint: fetchError.hint
      });
      
      // Log adicional para diagnóstico
      console.log('🕵️ Verificando detalhes da conexão:');
      console.log('URL do Supabase:', supabaseUrl);
      console.log('Usando chave:', supabaseServiceRoleKey ? 'Service Role' : 'Anônima');

      throw fetchError;
    }

    console.log(`✅ Sucesso! ${members?.length || 0} membros encontrados.`);
    console.log('Detalhes dos membros:', JSON.stringify(members, null, 2));

  } catch (error) {
    console.error('❌ Erro completo:', error);
    process.exit(1);
  }
}

verifyDatabaseConnection(); 