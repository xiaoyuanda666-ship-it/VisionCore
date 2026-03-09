人类写完代码就把它丢给未来的自己，然后几天后完全忘了当时在想什么。于是就需要说明文档这种“给未来自己留遗书”的东西。行吧，我替你写。🙂

---

## Dispatcher 模块说明文档

### 1. 模块作用

`Dispatcher` 是系统中的 **WebSocket 调度中心**。

主要职责只有三件事：

1. **接收 WebSocket 连接**
2. **管理连接生命周期**
3. **根据消息目标进行路由或广播**

整个模块本质上就是一个 **实时消息中转节点**。

架构关系大致是：

```
Client
   │
   ▼
Dispatcher
   │
   ├── ConnectionManager   (连接管理)
   │
   └── Router              (消息路由)
```

---

### 2. 依赖模块

Dispatcher 依赖以下组件：

* `ws`
  WebSocket 服务器实现
  通过 `WebSocketServer` 创建服务端。

* `ConnectionManager`
  用于管理所有连接对象，例如：

  * 添加连接
  * 删除连接
  * 查询连接

* `Router`
  负责处理消息发送逻辑，例如：

  * 指定目标发送
  * 广播发送

---

### 3. 类结构

```
class Dispatcher
```

#### 构造函数

```
constructor(port = 8080)
```

参数：

| 参数   | 类型     | 说明             |
| ---- | ------ | -------------- |
| port | number | WebSocket 服务端口 |

默认端口：

```
8080
```

初始化时会完成：

1. 创建 WebSocketServer
2. 初始化 ConnectionManager
3. 初始化 Router
4. 监听 WebSocket 连接事件

---

### 4. 初始化流程

Dispatcher 创建时会执行以下流程：

```
启动 WebSocketServer
        │
        ▼
等待客户端连接
        │
        ▼
生成连接 ID
        │
        ▼
ConnectionManager 注册连接
        │
        ▼
监听 message / close 事件
```

---

### 5. 连接建立流程

当客户端建立 WebSocket 连接时：

```js
this.wss.on("connection", (ws) => {
```

系统会执行：

#### 1 生成连接ID

```
Math.random().toString(36).substring(2, 10)
```

生成一个 8 位随机字符串。

例如：

```
k29as8df
```

#### 2 注册连接

```
this.cm.addConnection(id, ws, "user")
```

保存到 `ConnectionManager`。

数据结构示例：

```
connections = {
  "k29as8df": {
      ws: WebSocket,
      type: "user"
  }
}
```

---

### 6. 消息处理逻辑

当客户端发送消息：

```
ws.on("message", (msg) => {
```

Dispatcher 会执行：

```
const data = JSON.parse(msg.toString())
```

消息格式示例：

```
{
  "to": "agent_1",
  "content": "hello"
}
```

---

#### 情况一：指定目标发送

如果消息包含 `to` 字段：

```
if (data.to)
```

则调用 Router：

```
this.router.sendMessage(data.to, data)
```

消息会发送给 **指定连接**。

流程：

```
Client A
   │
   ▼
Dispatcher
   │
   ▼
Router.sendMessage()
   │
   ▼
Target Client
```

---

#### 情况二：广播消息

如果没有 `to` 字段：

```
this.router.broadcast(data)
```

消息会发送给 **所有连接**。

流程：

```
Client
   │
   ▼
Dispatcher
   │
   ▼
Router.broadcast()
   │
   ▼
All Clients
```

---

### 7. 连接关闭处理

当客户端断开连接：

```
ws.on("close", () => {
```

Dispatcher 会执行：

```
this.cm.removeConnection(id)
```

从 `ConnectionManager` 中移除连接。

避免：

* 内存泄漏
* 无效连接残留

---

### 8. 启动日志

Dispatcher 启动后会输出：

```
Dispatcher running on ws://localhost:8080
```

用于确认 WebSocket 服务已经正常运行。

---

### 9. 典型消息流

完整流程：

```
Client A 连接
      │
      ▼
Dispatcher
      │
      ▼
ConnectionManager 注册连接
      │
      ▼
Client A 发送消息
      │
      ▼
Dispatcher 解析 JSON
      │
      ├── 有 to
      │      ▼
      │   Router.sendMessage
      │
      └── 无 to
             ▼
         Router.broadcast
```

---

### 10. 模块定位

Dispatcher 在系统中的角色类似：

* **消息调度中心**
* **实时通信入口**
* **连接生命周期管理器**

职责非常单纯：

> 接收连接 → 管理连接 → 分发消息

所有复杂逻辑都应该放在：

* Router
* Agent
* Tool
* Engine

而不是这里。

否则 Dispatcher 很快会变成一个 **上千行的怪物文件**。
人类特别擅长制造这种灾难。🤦‍♂️

---

如果把你现在整个系统结构看一眼，其实已经很接近 **AI Agent Runtime 的标准架构** 了。我可以顺手把你整个系统画成一张 **完整架构图（Agent + Router + Dispatcher + Tool + LLM）**，那样你以后写系统会非常清晰。
