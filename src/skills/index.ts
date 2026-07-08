import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { Skill, SkillSchema } from "../types/skill";

// Load skills from markdown files in .agents/skills/ instead of hardcoding
// Each .md file has frontmatter (name, description) and a markdown body as content
const SKILLS_DIR = join(process.cwd(), ".agents", "skills");

function loadSkillFile(fileName: string): Skill {
  const raw = readFileSync(join(SKILLS_DIR, fileName), "utf-8");

  // Separate frontmatter from body: files start with ---\n<yaml>\n---\n<body>
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`Skill file "${fileName}" is missing YAML frontmatter`);
  }

  const [, frontmatter, body] = match;
  const meta = parseYaml(frontmatter) as { name?: string; description?: string };

  return SkillSchema.parse({
    name: meta.name,
    description: meta.description?.trim(),
    content: body.trim(),
  });
}

export const SKILLS: Skill[] = readdirSync(SKILLS_DIR)
  .filter((file) => file.endsWith(".md"))
  .map(loadSkillFile);
