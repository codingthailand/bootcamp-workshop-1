import { z } from 'zod';

// A skill that can be progressively disclosed to the agent
export const SkillSchema = z.object({
  name: z.string(),  // Unique identifier for the skill
  description: z.string(),  // 1-2 sentence description to show in system prompt
  content: z.string(),  // Full skill content with detailed instructions
});

export type Skill = z.infer<typeof SkillSchema>;