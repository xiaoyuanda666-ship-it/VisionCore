import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("./FileSystem");

// 列出 BASE_DIR 下的文件和文件夹
export function list_dir({ dir = "" }) {
  try {
    const fullPath = path.resolve(BASE_DIR, dir);

    if (!fullPath.startsWith(BASE_DIR)) {
      return "list_dir error: path outside of allowed directory";
    }

    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    // 返回 JSON 字符串而不是对象数组
    return JSON.stringify(items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? "directory" : "file"
    })));
  } catch (err) {
    return "list_dir error: " + err.message;
  }
}