import { registerApiKey, loadAllClients } from './fullApiKeyManager.js';

async function main() {
  // 用户输入新的 API Key
  const userKey = '用户输入的APIKEY';
  const { provider, client } = await registerApiKey(userKey);
  console.log('Detected provider:', provider);

  // 程序启动时加载所有已保存的 client
  const clients = await loadAllClients();
  console.log('Loaded clients:', Object.keys(clients));
}

main();