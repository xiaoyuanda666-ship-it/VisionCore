import { read_file } from "./impl/read_file.js";
import { write_file } from "./impl/write_file.js";
import { search_web } from "./impl/search_web.js";
import { call_api } from "./impl/call_api.js";
import { execute_code } from "./impl/execute_code.js";
import { list_dir} from "./impl/list_dir.js";
import { delete_file } from "./impl/delete_file.js";
import { http_request } from "./impl/http_request.js";
// import { writeMemory } from "./memory/write_memory.js";
import { send_message } from "./impl/send_message.js";
import { modify_nowMemory } from "./memory/modify_nowMemory.js";
import { modify_self } from "./memory/modify_self.js";
import { modify_talking_to } from "./memory/modify_talking_to.js";

export async function runTool(name, args, context) {

  switch (name) {

    case "read_file":
      return read_file(args);
    case "http_request":
      return await http_request(args);

    case "write_file":
      return write_file(args);
    // case "write_memory":
    //   return writeMemory(args, context)
    case "modify_nowMemory":
      return modify_nowMemory(args, context)

    case "modify_talking_to":
      return modify_talking_to(args, context)

    case "modify_self":
    return modify_self(args, context)

    case "send_message_to_websocket":
      return await send_message(args, context)
      
    case "delete_file":
      return delete_file(args);

    case "list_dir":
    return list_dir(args);

    case "search_web":
      return await search_web(args);

    case "call_api":
      return await call_api(args);

    case "execute_code":
      return execute_code(args);

    // case "sendMessageToTUIChannel":
    //   return sendMessageToTUIChannel(args);

    default:
      return "Unknown tool: " + name;
  }
}