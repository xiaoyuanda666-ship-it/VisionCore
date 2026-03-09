**Router 模块说明文档**

### 1. 模块概述

`Router` 用于在 WebSocket 连接之间进行消息分发。
它依赖 `ConnectionManager` 来获取连接对象，并负责将消息发送给指定客户端或广播给所有客户端。

该模块只处理**消息路由与发送**，不负责连接管理。

---

### 2. 构造函数

```javascript
constructor(connectionManager)
```

**参数**

| 参数                | 类型                | 说明                 |
| ----------------- | ----------------- | ------------------ |
| connectionManager | ConnectionManager | 连接管理器实例，用于获取当前所有连接 |

**说明**

`Router` 在初始化时接收 `ConnectionManager` 实例，并保存为 `this.cm`，后续所有消息发送操作都通过该实例查询连接。

---

### 3. sendMessage

```javascript
sendMessage(toId, message)
```

**作用**

向指定连接发送消息。

**参数**

| 参数      | 类型     | 说明        |
| ------- | ------ | --------- |
| toId    | string | 目标连接 ID   |
| message | Object | 需要发送的消息对象 |

**流程**

1. 调用 `ConnectionManager.getConnection(toId)` 获取连接对象。
2. 判断连接是否存在。
3. 判断 WebSocket 状态是否为 `OPEN (1)`。
4. 将消息序列化为 JSON 并发送。

**示例**

```javascript
router.sendMessage("client123", {
  type: "chat",
  content: "hello"
});
```

---

### 4. broadcast

```javascript
broadcast(message)
```

**作用**

向所有已连接客户端广播消息。

**参数**

| 参数      | 类型     | 说明        |
| ------- | ------ | --------- |
| message | Object | 需要发送的消息对象 |

**流程**

1. 调用 `ConnectionManager.getAllConnections()` 获取所有连接。
2. 遍历连接列表。
3. 判断 WebSocket 状态是否为 `OPEN (1)`。
4. 将消息序列化为 JSON 并发送。

**示例**

```javascript
router.broadcast({
  type: "system",
  content: "server restart soon"
});
```

---

### 5. 依赖关系

```
Router
  └── ConnectionManager
        ├── getConnection(id)
        └── getAllConnections()
```

`Router` 不直接维护连接，只负责：

* 查找连接
* 发送消息
* 广播消息

---

### 6. 连接对象结构

`ConnectionManager` 返回的连接对象结构：

```javascript
{
  ws: WebSocket,
  type: string
}
```

Router 实际使用的字段只有：

```
conn.ws
```

并通过：

```
conn.ws.readyState === 1
```

判断连接是否可发送消息。

---

### 7. 模块导出

```javascript
export default Router;
```

可通过以下方式使用：

```javascript
import Router from "./router.js";

const router = new Router(connectionManager);
```

---

### 8. 模块职责

Router 负责：

* 点对点消息发送
* 广播消息发送
* WebSocket 状态检查
* JSON 序列化发送

Router 不负责：

* 连接建立
* 连接关闭
* 连接生命周期管理
* 消息解析

这些职责由 `ConnectionManager` 或上层模块处理。
