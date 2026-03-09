import { registerApiKey, loadAllClients } from './apiKeyManager.js';
import 'dotenv/config'

async function test() {
  try {
    const userKey = process.env.DEEPSEEK_API_KEY;
    const { provider, client } = await registerApiKey(userKey);
    console.log('Detected provider:', provider);

    const res = await client.send([
      { role: 'system', content: 'ping' },
      { role: 'user', content: 'Hello!' }
    ], { max_tokens: 10 });

    console.log('Test response text:', res.text);

    const clients = await loadAllClients();
    console.log('Loaded clients:', Object.keys(clients));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();