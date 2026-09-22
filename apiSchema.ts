import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof UserSchema>;

const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().nonnegative(),
});

type UsersResponse = z.infer<typeof UsersResponseSchema>;

async function fetchUsers(url: string): Promise<UsersResponse> {
  const response = await fetch(url);
  const json = await response.json();
  return UsersResponseSchema.parse(json);
}

function parseUser(input: unknown): User | null {
  const result = UserSchema.safeParse(input);
  return result.success ? result.data : null;
}

export { UserSchema, UsersResponseSchema, fetchUsers, parseUser };
export type { User, UsersResponse };
