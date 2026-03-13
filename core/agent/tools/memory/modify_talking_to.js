// modify_nowMemory.js
export async function modify_talking_to(args, { agentState }) {
  try {
    const { text } = args || {};
    if (typeof text !== "string") {
      return { success: false, error: "Invalid text type" };
    }

    agentState.set("talkingTo", text);

    return { success: true, message: "nowMemory updated" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}