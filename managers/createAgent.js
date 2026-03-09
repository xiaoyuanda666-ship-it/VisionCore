import AgentManager from './agentManager.js';

const agentId = 'agent-001';
AgentManager.createAgent(agentId);
const child = AgentManager.startAgent(agentId);

console.log(`Agent ${agentId} started with PID: ${child.pid}`);