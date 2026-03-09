import fetch from "node-fetch";

export async function search_web({ query }) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    // 提取关键信息
    const results = [];

    // 摘要
    if (data.AbstractText && data.AbstractText.trim()) {
      results.push({
        title: data.Heading || "摘要",
        text: data.AbstractText
      });
    }

    // 相关主题
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach(item => {
        if (item.Text && item.Text.trim()) {
          results.push({
            title: item.Text.split(" - ")[0],
            text: item.Text
          });
        } else if (item.Topics) {
          // 嵌套的 RelatedTopics
          item.Topics.forEach(sub => {
            if (sub.Text && sub.Text.trim()) {
              results.push({
                title: sub.Text.split(" - ")[0],
                text: sub.Text
              });
            }
          });
        }
      });
    }

    // 返回简化字符串
    if (results.length === 0) {
      return "search_web result: 无可用摘要信息";
    }

    return results.slice(0, 5).map(r => `${r.title}: ${r.text}`).join("\n\n");

  } catch (err) {
    return "search_web error: " + err.message;
  }
}