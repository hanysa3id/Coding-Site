import { z } from "zod";

export const userGroupSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9\-]+$/, "lowercase letters, digits, hyphens only"),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "hex color e.g. #fbbf24")
    .nullable()
    .optional()
    .or(z.literal("")),
  permissions: z.record(z.string(), z.unknown()).default({}),
});
export type UserGroupInput = z.infer<typeof userGroupSchema>;

export const userGroupMemberSchema = z.object({
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
});
export type UserGroupMemberInput = z.infer<typeof userGroupMemberSchema>;
