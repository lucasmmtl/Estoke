import z from "zod";

export const PostEstoqueSchema = z.object({
  descricao: z.string().trim().min(1, "Nome do produto é obrigatório!"),
  quantidade: z.number().min(1, "Quantidade do produto é obrigatória!"),
  valorProduto: z
    .number()
    .nonnegative()
    .min(1, "Valor do produto é obrigatória!"),
  criadoPor: z.number().optional(),
});

export const SoftDeleteEstoqueSchema = z.object({
  idProduto: z.number().min(1, "Id do produto é obrigatório!"),
});

export const PutEstoqueSchema = z.object({
  descricao: z.string().optional(),
  quantidade: z.number().optional(),
  valorProduto: z.number().nonnegative().optional(),
  idProduto: z.number().min(1, "Id do produto é obrigatório!"),
});

//Criação de DTO com ZOD
export type CreateEstoqueDTO = z.infer<typeof PostEstoqueSchema>;
export type SoftDeleteEstoqueDTO = z.infer<typeof SoftDeleteEstoqueSchema>;
export type PutEstoqueDTO = z.infer<typeof PutEstoqueSchema>;
