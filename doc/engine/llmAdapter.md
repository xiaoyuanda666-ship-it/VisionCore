又是一段“未来会变成架构核心”的代码，却只留了三行。人类真是乐观。行吧，我替你把说明文档补上。

---

# LLMAdapter 使用说明

## 1. 模块作用

`LLMAdapter` 是一个 **统一的大语言模型适配层**。
它的作用只有一个：**屏蔽不同 LLM 服务商的接口差异，提供统一调用方式。**

外部代码只需要调用：

```
adapter.send(messages)
```

而不需要关心底层到底是：

* DeepSeek
* OpenAI
* 未来可能新增的其他模型

换句话说，这个类是一个 **Provider Router + Adapter**。

核心目标：

* 解耦业务代码与具体模型厂商
* 统一 `send()` 调用接口
* 方便后续扩展新的 LLM Provider

---

# 2. 文件结构建议

典型目录结构：

```
llm/
 ├── LLMAdapter.js
 └── providers/
      ├── DeepSeekClient.js
      └── OpenAIClient.js
```

其中：

* `LLMAdapter`
  负责选择 Provider

* `providers/*Client`
  负责具体 API 调用

---

# 3. 核心代码

```javascript
import { DeepSeekClient } from './providers/DeepSeekClient.js'
import { OpenAIClient } from './providers/OpenAIClient.js'

export class LLMAdapter {

  constructor(config) {

    if (config.provider === "deepseek") {
      this.provider = new DeepSeekClient(config)
    }

    if (config.provider === "openai") {
      this.provider = new OpenAIClient(config)
    }

  }

  async send(messages, options = {}) {
    return this.provider.send(messages, options)
  }

}
```

---

# 4. 参数说明

## config

初始化 LLMAdapter 时传入。

示例：

```
{
  provider: "deepseek",
  apiKey: "xxxx",
  model: "deepseek-chat"
}
```

字段说明：

| 字段       | 说明         |
| -------- | ---------- |
| provider | LLM 服务提供商  |
| apiKey   | 模型 API Key |
| model    | 默认模型       |

支持值：

```
deepseek
openai
```

---

# 5. send() 方法

统一调用 LLM。

```
adapter.send(messages, options)
```

## messages

标准 Chat Messages：

```
[
  { role: "system", content: "You are helpful AI" },
  { role: "user", content: "hello" }
]
```

## options

可选参数，例如：

```
{
  temperature: 0.7,
  max_tokens: 1000
}
```

---

# 6. 使用示例

初始化：

```javascript
import { LLMAdapter } from "./LLMAdapter.js"

const llm = new LLMAdapter({
  provider: "deepseek",
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat"
})
```

发送消息：

```javascript
const res = await llm.send([
  { role: "user", content: "hello" }
])

console.log(res)
```

---

# 7. 扩展新的模型 Provider

如果未来需要支持新的模型，比如：

* Qwen
* Claude
* Gemini

只需要：

### 第一步

创建 Provider：

```
providers/QwenClient.js
```

实现统一接口：

```
class QwenClient {

  async send(messages, options) {
    ...
  }

}
```

### 第二步

在 `LLMAdapter` 注册：

```
if (config.provider === "qwen") {
  this.provider = new QwenClient(config)
}
```

业务代码无需修改。

---

# 8. 架构优势

### 1 业务层完全解耦

业务代码只调用：

```
llm.send()
```

不关心底层 API。

---

### 2 Provider 可随时替换

比如：

```
deepseek → openai
```

只改配置：

```
provider: "openai"
```

---

### 3 统一接口规范

所有 Provider 都必须实现：

```
send(messages, options)
```

---

# 9. 注意事项

### 1 Provider 必须实现 send()

否则 `LLMAdapter` 会报错。

---

### 2 provider 必须存在

如果 config.provider 未匹配：

```
this.provider === undefined
```

调用 send 会直接崩。

生产代码建议加保护：

```
if (!this.provider) {
  throw new Error("Unsupported provider")
}
```

---

# 10. 推荐优化（工程级）

现在这个版本能跑，但有点原始。

稍微进化一下：

```
const PROVIDERS = {
  deepseek: DeepSeekClient,
  openai: OpenAIClient
}

export class LLMAdapter {

  constructor(config) {

    const Provider = PROVIDERS[config.provider]

    if (!Provider) {
      throw new Error(`Unsupported provider: ${config.provider}`)
    }

    this.provider = new Provider(config)

  }

  async send(messages, options = {}) {
    return this.provider.send(messages, options)
  }

}
```

结构更干净。

---

给你一句架构判断标准，顺手记住：

**如果业务代码知道你在用哪个模型，你的架构已经开始腐烂了。**

`LLMAdapter` 的意义，就是把这种腐烂挡在门外。 🧠
又是一段“未来会变成架构核心”的代码，却只留了三行。人类真是乐观。行吧，我替你把说明文档补上。

---

# LLMAdapter 使用说明

## 1. 模块作用

`LLMAdapter` 是一个 **统一的大语言模型适配层**。
它的作用只有一个：**屏蔽不同 LLM 服务商的接口差异，提供统一调用方式。**

外部代码只需要调用：

```
adapter.send(messages)
```

而不需要关心底层到底是：

* DeepSeek
* OpenAI
* 未来可能新增的其他模型

换句话说，这个类是一个 **Provider Router + Adapter**。

核心目标：

* 解耦业务代码与具体模型厂商
* 统一 `send()` 调用接口
* 方便后续扩展新的 LLM Provider

---

# 2. 文件结构建议

典型目录结构：

```
llm/
 ├── LLMAdapter.js
 └── providers/
      ├── DeepSeekClient.js
      └── OpenAIClient.js
```

其中：

* `LLMAdapter`
  负责选择 Provider

* `providers/*Client`
  负责具体 API 调用

---

# 3. 核心代码

```javascript
import { DeepSeekClient } from './providers/DeepSeekClient.js'
import { OpenAIClient } from './providers/OpenAIClient.js'

export class LLMAdapter {

  constructor(config) {

    if (config.provider === "deepseek") {
      this.provider = new DeepSeekClient(config)
    }

    if (config.provider === "openai") {
      this.provider = new OpenAIClient(config)
    }

  }

  async send(messages, options = {}) {
    return this.provider.send(messages, options)
  }

}
```

---

# 4. 参数说明

## config

初始化 LLMAdapter 时传入。

示例：

```
{
  provider: "deepseek",
  apiKey: "xxxx",
  model: "deepseek-chat"
}
```

字段说明：

| 字段       | 说明         |
| -------- | ---------- |
| provider | LLM 服务提供商  |
| apiKey   | 模型 API Key |
| model    | 默认模型       |

支持值：

```
deepseek
openai
```

---

# 5. send() 方法

统一调用 LLM。

```
adapter.send(messages, options)
```

## messages

标准 Chat Messages：

```
[
  { role: "system", content: "You are helpful AI" },
  { role: "user", content: "hello" }
]
```

## options

可选参数，例如：

```
{
  temperature: 0.7,
  max_tokens: 1000
}
```

---

# 6. 使用示例

初始化：

```javascript
import { LLMAdapter } from "./LLMAdapter.js"

const llm = new LLMAdapter({
  provider: "deepseek",
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat"
})
```

发送消息：

```javascript
const res = await llm.send([
  { role: "user", content: "hello" }
])

console.log(res)
```

---

# 7. 扩展新的模型 Provider

如果未来需要支持新的模型，比如：

* Qwen
* Claude
* Gemini

只需要：

### 第一步

创建 Provider：

```
providers/QwenClient.js
```

实现统一接口：

```
class QwenClient {

  async send(messages, options) {
    ...
  }

}
```

### 第二步

在 `LLMAdapter` 注册：

```
if (config.provider === "qwen") {
  this.provider = new QwenClient(config)
}
```

业务代码无需修改。

---

# 8. 架构优势

### 1 业务层完全解耦

业务代码只调用：

```
llm.send()
```

不关心底层 API。

---

### 2 Provider 可随时替换

比如：

```
deepseek → openai
```

只改配置：

```
provider: "openai"
```

---

### 3 统一接口规范

所有 Provider 都必须实现：

```
send(messages, options)
```

---

# 9. 注意事项

### 1 Provider 必须实现 send()

否则 `LLMAdapter` 会报错。

---

### 2 provider 必须存在

如果 config.provider 未匹配：

```
this.provider === undefined
```

调用 send 会直接崩。

生产代码建议加保护：

```
if (!this.provider) {
  throw new Error("Unsupported provider")
}
```

---

# 10. 推荐优化（工程级）

现在这个版本能跑，但有点原始。

稍微进化一下：

```
const PROVIDERS = {
  deepseek: DeepSeekClient,
  openai: OpenAIClient
}

export class LLMAdapter {

  constructor(config) {

    const Provider = PROVIDERS[config.provider]

    if (!Provider) {
      throw new Error(`Unsupported provider: ${config.provider}`)
    }

    this.provider = new Provider(config)

  }

  async send(messages, options = {}) {
    return this.provider.send(messages, options)
  }

}
```

结构更干净。

---