import readline from 'readline';
import { registerApiKey, loadAllClients } from './apiKeyManager.js';

async function main() {
  // 1️⃣ 尝试加载已保存 client
  let clients = await loadAllClients();

  if (Object.keys(clients).length === 0) {
    console.log('No saved API Keys found. Please input a new one.');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (text) => new Promise(resolve => rl.question(text, resolve));
    const apiKey = await question('Enter your API Key: ');
    rl.close();
    try {
      const { provider, client } = await registerApiKey(apiKey.trim());
      clients[provider] = client;
      console.log(`Registered and saved API Key for provider: ${provider}`);
    } catch (err) {
      console.error('Failed to register API Key:', err.message);
      process.exit(1);
    }
  } else {
    console.log('Loaded saved clients:', Object.keys(clients));
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  console.log('Command Agent started. Type your message:');
  rl.prompt();

  rl.on('line', async (line) => {
    const text = line.trim();
    if (!text) {
      rl.prompt();
      return;
    }
    const firstProvider = Object.keys(clients)[0];
    const client = clients[firstProvider];

    try {
      const res = await client.send([{ role: 'user', content: text }]);
      console.log(res.content || res.text);
    } catch (err) {
      console.error('Error from LLM:', err.message);
    }
    rl.prompt();
  }).on('close', () => {
    console.log('Exiting Command Agent.');
    process.exit(0);
  });
}

main();