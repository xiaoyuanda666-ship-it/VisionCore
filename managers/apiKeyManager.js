import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { OpenAIClient } from '../engine/providers/OpenAIClient.js';
import { DeepSeekClient } from '../engine/providers/DeepSeekClient.js';
import { QwenClient } from '../engine/providers/QwenLLMClient.js';

const STORE_FILE = path.resolve('./apikeys.json');

// --- 加密设置 ---
const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.scryptSync('你的主密码或者密钥', 'salt', 32);
const IV_LENGTH = 16;

// --- 加密/解密 ---
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decrypt(data) {
  const [ivHex, tagHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- 保存/读取 API Key ---
async function saveApiKey(provider, apiKey) {
  let store = {};
  if (await fs.pathExists(STORE_FILE)) {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    store = JSON.parse(raw);
  }
  store[provider] = encrypt(apiKey);
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

async function loadApiKeys() {
  if (!await fs.pathExists(STORE_FILE)) return {};
  const raw = await fs.readFile(STORE_FILE, 'utf8');
  const store = JSON.parse(raw);
  const result = {};
  for (const provider in store) {
    result[provider] = decrypt(store[provider]);
  }
  return result;
}

// --- 并行检测 provider ---
async function detectProvider(apiKey) {
  const clients = [
    { name: 'openai', ClientClass: OpenAIClient },
    { name: 'deepseek', ClientClass: DeepSeekClient },
    { name: 'qwen', ClientClass: QwenClient },
  ];

  const promises = clients.map(({ name, ClientClass }) =>
    (async () => {
      try {
        const client = new ClientClass({ apiKey });
        const ok = await client.pingHello(); // 使用轻量检测
        if (ok) return name;
        return null;
      } catch (err) {
        console.error(`Provider ${name} failed:`, err.message);
        return null;
      }
    })()
  );

  const results = await Promise.all(promises);
  const detected = results.find(r => r !== null);
  if (!detected) throw new Error('Invalid API Key');
  return detected;
}

// --- 初始化客户端 ---
function initClient(provider, apiKey) {
  if (provider === 'deepseek') return new DeepSeekClient({ apiKey });
  if (provider === 'openai') return new OpenAIClient({ apiKey });
  if (provider === 'qwen') return new QwenClient({ apiKey });
  throw new Error('Unknown provider');
}

// --- 对外接口 ---
// 用户输入 API Key
export async function registerApiKey(apiKey) {
  const provider = await detectProvider(apiKey);
  const client = initClient(provider, apiKey);
  await saveApiKey(provider, apiKey);
  return { provider, client };
}

// 启动程序时加载所有已保存 API Key
export async function loadAllClients() {
  const keys = await loadApiKeys();
  const clients = {};
  for (const [provider, apiKey] of Object.entries(keys)) {
    clients[provider] = initClient(provider, apiKey);
  }
  return clients;
}