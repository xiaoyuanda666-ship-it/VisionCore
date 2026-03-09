import fetch from "node-fetch";

/**
 * 调用任意 HTTP API
 * @param {Object} options
 * @param {string} options.url - 请求地址
 * @param {string} [options.method="GET"] - 请求方法
 * @param {Object|null} [options.body=null] - POST 请求体
 * @param {number} [options.timeout=10000] - 超时时间，毫秒
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
export async function call_api({ url, method = "GET", body = null, timeout = 10000 }) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    });

    clearTimeout(id);

    let text;
    try {
      // 尝试解析 JSON，如果失败就当作普通文本
      const json = await res.json();
      text = JSON.stringify(json); // 保证返回字符串
    } catch {
      text = await res.text();
    }

    return { success: true, data: text };

  } catch (err) {
    clearTimeout(id);
    return { success: false, error: err.message + (err.code ? ` (${err.code})` : "") };
  }
}

// 测试调用
(async () => {
  const result = await call_api({ url: "https://worldtimeapi.org/api/timezone/Asia/Shanghai" });
  console.log(result);
})();