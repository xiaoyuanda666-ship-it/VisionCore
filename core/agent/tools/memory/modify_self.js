// modify_nowMemory.js
export async function modify_self(args, { agentState }) {
  try {
    const { text } = args || {};
    if (typeof text !== "string") {
      return { success: false, error: "Invalid text type" };
    }

    agentState.setIdentity("self", text);

    return { success: true, message: "self updated" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}