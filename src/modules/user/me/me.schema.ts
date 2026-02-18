import { UserSchema } from "@/modules/shared/schemas/user";

export const MeResponseSchema = UserSchema.omit({ password: true });
