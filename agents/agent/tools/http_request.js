import fetch from "node-fetch";

export async function http_request({ method = "GET", url, headers = {}, body = null }) {
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
      // 返回 JSON 字符串而不是对象
      data = JSON.stringify(data);
    } else {
      data = await res.text();
    }

    // 整个返回也是字符串化的 JSON，确保放进 LLM messages 安全
    return JSON.stringify({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: data
    });
  } catch (err) {
    return JSON.stringify({ status: 0, error: err.message });
  }
}