import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("./FileSystem");

export function write_file({ path: filePath, content }) {
  console.log("write_file called with filePath:", filePath, "content:", content);
  try {
    const fullPath = path.resolve(BASE_DIR, filePath);

    if (!fullPath.startsWith(BASE_DIR)) {
      return "write_file error: path outside of allowed directory";
    }

    // 确保父目录存在
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(fullPath, content, "utf-8");
    return "file written successfully";
  } catch (err) {
    return "write_file error: " + err.message;
  }
}