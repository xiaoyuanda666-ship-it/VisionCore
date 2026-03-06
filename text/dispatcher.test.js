const WebSocket = require('ws');
const Dispatcher = require('../dispatcher/dispatcher');

describe('Message Dispatcher', () => {
  let dispatcher;
  beforeAll(() => {
    dispatcher = new Dispatcher(8081);
  });

  afterAll(() => {
    dispatcher.wss.close(); // 关闭 WebSocket 服务器
  });

  test('should accept connection', (done) => {
    const ws = new WebSocket('ws://localhost:8081');
    ws.on('open', () => {
      expect(ws.readyState).toBe(1);
      ws.close();
      done();
    });
  });

  test('should broadcast message', (done) => {
    const ws1 = new WebSocket('ws://localhost:8081');
    const ws2 = new WebSocket('ws://localhost:8081');

    ws2.on('message', (msg) => {
      const data = JSON.parse(msg);
      expect(data.text).toBe('hello');
      ws1.close();
      ws2.close();
      done();
    });

    ws1.on('open', () => {
      setTimeout(() => {
        ws1.send(JSON.stringify({ text: 'hello' }));
      }, 100);
    });
  });
});