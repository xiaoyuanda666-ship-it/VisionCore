// AgentManager.js
import merge from "lodash.merge";
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

const AGENT_ROOT = path.resolve('./agents_data');
const META_FILE = path.join(AGENT_ROOT, 'agents_meta.json');

fs.ensureDirSync(AGENT_ROOT);

class AgentManager {
  constructor() {
    this.agents = new Map(); // agentId -> { path, lastPID, status, startedAt, lastActive }
    this.loadMeta();
    this.normalizeStatus();
  }

  // --- 持久化 ---
  loadMeta() {
    if (fs.existsSync(META_FILE)) {
      const meta = fs.readJsonSync(META_FILE);
      Object.entries(meta).forEach(([id, info]) => this.agents.set(id, info));
    }
  }

  saveMeta() {
    const meta = {};
    for (const [id, info] of this.agents.entries()) {
      meta[id] = info;
    }
    fs.writeJsonSync(META_FILE, meta, { spaces: 2 });
  }

  normalizeStatus() {
    // 挂掉或异常退出的 Agent 状态统一改为 stopped
    for (const [id, info] of this.agents.entries()) {
      if (info.status === 'running') {
        info.status = 'stopped';
        info.lastPID = null;
      }
    }
    this.saveMeta();
  }

  // --- 辅助函数 ---
  getAgentDir(agentId) {
    const dir = path.join(AGENT_ROOT, agentId);
    fs.ensureDirSync(dir);
    return dir;
  }

  // --- 命令接口 ---
  listAgents() {
    return Array.from(this.agents.entries()).map(([id, info]) => ({
      agentId: id,
      path: info.path,
      lastPID: info.lastPID,
      status: info.status,
      startedAt: info.startedAt,
      lastActive: info.lastActive
    }));
  }

  createAgent(agentId) {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId);
    }
    const dir = this.getAgentDir(agentId);
    const info = {
      path: dir,
      lastPID: null,
      status: 'stopped',
      startedAt: null,
      lastActive: null,
      llm: {
        model: "gpt-4o",
        temperature: 0.7
      }
    };
    this.agents.set(agentId, info);
    this.saveMeta();
    return info;
  }
  updateAgent(agentId, patch) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} does not exist`);
    }

    merge(agent, patch);

    this.saveMeta();
    return agent;
  }

  startAgent(agentId) {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) throw new Error(`Agent ${agentId} does not exist`);
    if (agentInfo.status === 'running') throw new Error(`Agent ${agentId} is already running`);

    const scriptPath = path.resolve('./agents/MainAgent.js');
    const child = spawn('node', [scriptPath, agentId, agentInfo.path], {
      stdio: ['pipe', 'pipe', 'pipe'],// 子进程的输入输出全都通过管道传给父进程
      // stdio: 'ignore',  // 不关心输出
      // detached: true    // 独立进程组
    });

    // 捕获输出日志，可通过 WebSocket 或管理台中转
    child.stdout.on('data', (data) => {
      console.log(`[${agentId} STDOUT] ${data.toString().trim()}`);
      agentInfo.lastActive = new Date().toISOString();
      this.saveMeta();
    });

    // child.unref(); // 让父进程退出后子进程继续运行

    child.stderr.on('data', (data) => {
      console.error(`[${agentId} STDERR] ${data.toString().trim()}`);
    });

    child.on('exit', (code, signal) => {
      console.log(`[${agentId}] exited with code ${code} signal ${signal}`);
      const info = this.agents.get(agentId);
      if (info) {
        info.status = 'stopped';
        info.lastPID = null;
        this.saveMeta();
      }
    });

    child.on('error', (err) => {
      console.error(`[${agentId}] failed to start:`, err);
      agentInfo.status = 'stopped';
      agentInfo.lastPID = null;
      this.saveMeta();
    });

    agentInfo.lastPID = child.pid;
    agentInfo.status = 'running';
    agentInfo.startedAt = new Date().toISOString();
    this.saveMeta();

    return child;
  }

  stopAgent(agentId) {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo || agentInfo.status !== 'running') {
      throw new Error(`Agent ${agentId} is not running`);
    }
    process.kill(agentInfo.lastPID);
    agentInfo.status = 'stopped';
    agentInfo.lastPID = null;
    this.saveMeta();
  }

  deleteAgent(agentId, force = false) {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) throw new Error(`Agent ${agentId} does not exist`);

    if (agentInfo.status === 'running') {
      if (force) this.stopAgent(agentId);
      else throw new Error(`Agent ${agentId} is running, stop it or use force=true`);
    }

    const backupDir = path.join(AGENT_ROOT, `${agentId}_deleted_${Date.now()}`);
    fs.moveSync(agentInfo.path, backupDir);
    this.agents.delete(agentId);
    this.saveMeta();
    return backupDir;
  }
}

export default new AgentManager();