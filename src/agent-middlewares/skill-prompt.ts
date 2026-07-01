import { SKILLS } from "@/skills";
import { loadSkill } from "@/agent-tools";
import { createMiddleware } from "langchain";

// Build skills prompt from the SKILLS list
const skillsPrompt = SKILLS.map(
  (skill) => `- **${skill.name}**: ${skill.description}`
).join("\n");

export const skillMiddleware = createMiddleware({
  name: "skillMiddleware",
  tools: [loadSkill],
  wrapModelCall: async (request, handler) => {
    // Build the skills addendum
    const skillsAddendum =
      `\n\n## Available Skills\n\n${skillsPrompt}\n\n` +
      "Use the load_skill tool when you need detailed information " +
      "about handling a specific type of request.";

    // ต้องใช้ .concat() บน SystemMessage — ห้ามเอา object มาต่อ string ตรงๆ (จะกลายเป็น "[object Object]")
    // และต้อง set ผ่าน key `systemMessage` ไม่ใช่ `systemPrompt` มิฉะนั้นจะทับ prompt เดิมทิ้ง
    return handler({
      ...request,
      systemMessage: request.systemMessage.concat(skillsAddendum),
    });
  },
});