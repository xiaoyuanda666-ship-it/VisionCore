import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("./FileSystem");

export function read_file({ path: filePath }) {
  try {
    const fullPath = path.resolve(BASE_DIR, filePath);
    if (!fullPath.startsWith(BASE_DIR)) {
      return "read_file error: path outside of allowed directory";
    }
    return fs.readFileSync(fullPath, "utf-8");
  } catch (err) {
    return "read_file error: " + err.message;
  }
}