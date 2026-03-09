// tests/AgentManager.test.js
import fs from 'fs-extra';
import path from 'path';
import AgentManager from './agentManager';

const TEST_AGENT_ID = 'test-agent';
const AGENT_ROOT = path.resolve('./agents_data_test');

describe('AgentManager 功能测试', () => {
  test('创建 Agent', () => {
    const info = AgentManager.createAgent(TEST_AGENT_ID);
    expect(info).toHaveProperty('path');
    expect(info.status).toBe('stopped');
    expect(fs.existsSync(info.path)).toBe(true);
  });

  test.skip('列表 Agent', () => {
    const list = AgentManager.listAgents();
    console.log(list);
    const agent = list.find(a => a.agentId === TEST_AGENT_ID);
    expect(agent).toBeDefined();
    expect(agent.status).toBe('stopped');
  });

  test.skip('启动 Agent', (done) => {
    const child = AgentManager.startAgent(TEST_AGENT_ID);
    expect(child).toBeDefined();
    const info = AgentManager.agents.get(TEST_AGENT_ID);
    expect(info.status).toBe('running');
    expect(info.lastPID).toBeGreaterThan(0);

    // 等待 1 秒确保 Agent 实际启动
    setTimeout(() => {
      AgentManager.stopAgent(TEST_AGENT_ID);
      const stoppedInfo = AgentManager.agents.get(TEST_AGENT_ID);
      expect(stoppedInfo.status).toBe('stopped');
      done();
    }, 1000);
  });

  test.skip('停止未运行 Agent 报错', () => {
    expect(() => AgentManager.stopAgent(TEST_AGENT_ID)).toThrow(/is not running/);
  });

  test.skip('删除 Agent', () => {
    const backupDir = AgentManager.deleteAgent(TEST_AGENT_ID);
    expect(fs.existsSync(backupDir)).toBe(true);
    expect(AgentManager.agents.has(TEST_AGENT_ID)).toBe(false);
  });

  test.skip('删除不存在 Agent 报错', () => {
    expect(() => AgentManager.deleteAgent('nonexistent')).toThrow(/does not exist/);
  });
});