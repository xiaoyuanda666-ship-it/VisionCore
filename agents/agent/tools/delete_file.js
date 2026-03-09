import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("./FileSystem");

export function delete_file({ path: filePath }) {
  try {
    const fullPath = path.resolve(BASE_DIR, filePath);

    // 校验路径是否在 BASE_DIR 内
    if (!fullPath.startsWith(BASE_DIR)) {
      return "delete_file error: path outside of allowed directory";
    }

    if (!fs.existsSync(fullPath)) {
      return "delete_file error: file does not exist";
    }

    fs.unlinkSync(fullPath);
    return "file deleted successfully";
  } catch (err) {
    return "delete_file error: " + err.message;
  }
}