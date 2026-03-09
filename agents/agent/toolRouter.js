import { read_file } from "./tools/read_file.js";
import { write_file } from "./tools/write_file.js";
import { search_web } from "./tools/search_web.js";
import { call_api } from "./tools/call_api.js";
import { execute_code } from "./tools/execute_code.js";
import { list_dir} from "./tools/list_dir.js";
import { delete_file } from "./tools/delete_file.js";
import { http_request } from "./tools/http_request.js";

export async function runTool(name, args) {

  switch (name) {

    case "read_file":
      return read_file(args);
    case "http_request":
      return await http_request(args);

    case "write_file":
      return write_file(args);
      
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