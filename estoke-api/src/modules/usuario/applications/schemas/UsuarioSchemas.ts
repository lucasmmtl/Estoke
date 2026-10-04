import z from "zod";

const nome = z
  .string()
  .trim()
  .min(1, "Nome é obrigatório!")
  .max(100, "Nome deve ter no máximo 100 caracteres!");
const usuario = z
  .string()
  .trim()
  .min(3, "Usuário deve ter no mínimo 3 caracteres!")
  .max(50, "Usuário deve ter no máximo 50 caracteres!");
const email = z
  .email("E-mail inválido!")
  .max(150, "E-mail deve ter no máximo 150 caracteres!")
  .toLowerCase();

export const PostUsuarioSchema = z.object({
  nome,
  usuario,
  email,
  senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres!"),
  criadoPor: z.number().nullable().optional(),
});

export const LoginSchema = z.object({
  email,
  senha: z.string().min(1, "Senha é obrigatória!"),
});

export type CreateUsuarioDTO = z.infer<typeof PostUsuarioSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
