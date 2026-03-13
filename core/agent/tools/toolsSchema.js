export const tools = [
{
  type: "function",
  function: {
    name: "read_file",
    description: "read a file from disk",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" }
      },
      required: ["path"]
    }
  }
},
{
    type: "function",
    function: {
      name: "send_message_to_websocket",
      description: "Send a text message to the websocket server",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Text message to send"
          }
        },
        required: ["content"],
        additionalProperties: false
      }
    }
  },
{
  type: "function",
  function: {
    name: "write_memory",
    description: "store important knowledge, experience, or user preference into memory",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The actual content of the memory to store. Can be knowledge, experience, observations, user preferences, or task-related information. Should be concise and meaningful, as it will be embedded and used for retrieval, context reference, and reasoning by the Agent."
        },
        type: {
          type: "string",
          description: "Memory category, determines storage method and usage:\n" +
          "- longterm: Long-term memory, stores core knowledge, summarized experience, and user long-term preferences; usually derived from short-term memory\n" +
          "- shortterm: Short-term memory, temporarily stores information related to the current task or conversation; usually associated with a taskId; can be summarized into longterm memory after completion\n" +
          "- self: Self memory, stores identity information, relationships, rules, and other core content; persistent and not cleared with other memories\n" +
          "- recent: Recent memory, stores recently occurred events or context; ordered by time; automatically removed when expired or exceeding the limit",
          enum: ["longterm", "shortterm", "self", "recent"]
        },
        importance: {
          type: "number",
          description: 
          "Memory importance score, range 0–1. Interpreted differently depending on memory type:\n" +
          "- recent: Importance affects retention within the short time window (e.g., one week); higher importance may delay automatic deletion.\n" +
          "- shortterm: Importance guides which items may be promoted to recent or longterm memory after task completion.\n" +
          "- longterm: Importance is advisory; these memories are permanent unless explicitly removed by the agent.\n" +
          "- self: Importance indicates core identity, relationships, or key knowledge; used for prioritization, sorting, and dynamic loading."
        },
        taskId: {
          type: "string",
          description: "Optional identifier for a specific task or ongoing activity. Primarily used with shortterm memory to link memories to a particular task, enabling better context tracking, task completion, and selective promotion of important information to recent or longterm memory."
        }
      },
      required: ["text"]
    }
  }
},
{
  type: "function",
  function: {
    name: "modify_nowMemory",
    description: "修改当前的瞬时记忆,就像人的短期记忆那样，详细的当下，正在处理的工作，头脑下的念头等",

    parameters: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }
},
{
  type: "function",
  function: {
    name: "modift_talking_to",
    description: "修改我正在交谈的对象，就像人的对话意识那样，我正在和谁说话，我正在和哪个对象交互等，喜好是什么样的，以帮助第一时间识别出我正在和谁交谈的对话对象身份，我该用什么样的语气和风格与他交谈，以帮助第一时间识别出我正在和谁交谈的对话对象身份",

    parameters: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }
},
{
  type: "function",
  function: {
    name: "modify_self",
    description: "修改自我认知，就像人的自我意识那样，我是谁，我的名字是什么，我的性格是什么样的等，以帮助第一时间识别到我自己的身份",

    parameters: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }
},
{
  type: "function",
  function: {
    name: "list_dir",
    description: "list files and directories under a given path within the sandboxed FileSystem",
    parameters: {
      type: "object",
      properties: {
        dir: { 
          type: "string",
          description: "relative path under /FileSystem, empty string for root"
        }
      },
      required: ["dir"]
    }
  }
},
{
  type: "function",
  function: {
    name: "delete_file",
    description: "delete a file under the sandboxed FileSystem; will not allow deleting outside BASE_DIR",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "relative file path under /FileSystem, e.g., 'subdir/file.txt'"
        }
      },
      required: ["path"]
    }
  }
},
{
  type: "function",
  function: {
    name: "write_file",
    description: "write content to a file; will automatically create parent directories if they do not exist",
    parameters: {
      type: "object",
      properties: {
        path: { 
          type: "string",
          description: "relative file path under /FileSystem, e.g., 'subdir/file.txt'" 
        },
        content: { 
          type: "string",
          description: "content to write into the file"
        }
      },
      required: ["path","content"]
    }
  }
},

{
  type: "function",
  function: {
    name: "search_web",
    description: "search the web",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  }
},
{
  type: "function",
  function: {
    name: "http_request",
    description: "Make an HTTP request, like curl. Supports GET, POST, PUT, DELETE. Returns status, headers, and body.",
    parameters: {
      type: "object",
      properties: {
        method: {
          type: "string",
          description: "HTTP method, e.g., GET, POST",
          enum: ["GET", "POST", "PUT", "DELETE"]
        },
        url: {
          type: "string",
          description: "The full URL to request"
        },
        headers: {
          type: "object",
          description: "Optional HTTP headers",
          additionalProperties: { type: "string" }
        },
        body: {
          type: "string",
          description: "Optional request body (for POST/PUT)"
        }
      },
      required: ["method", "url"]
    }
  }
},

{
  type: "function",
  function: {
    name: "call_api",
    description: "call an external api",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string" },
        method: { type: "string" },
        body: { type: "object" }
      },
      required: ["url"]
    }
  }
},

{
  type: "function",
  function: {
    name: "execute_code",
    description: "execute javascript code",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string" }
      },
      required: ["code"]
    }
  }
}

];