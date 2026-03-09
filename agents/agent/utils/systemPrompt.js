import fs from "fs";
import path from "path";

export function getSystemPrompt() {
  const configPath = path.resolve("./config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const promptPath = path.resolve(config.systemPromptFile);
  const systemPrompt = fs.readFileSync(promptPath, "utf-8");
  return systemPrompt;
}