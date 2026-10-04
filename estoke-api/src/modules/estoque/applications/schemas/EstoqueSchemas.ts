import z from "zod";

const descricao = z.string().trim().min(1, "Nome do produto é obrigatório!");
const quantidadeEntrada = z
  .number()
  .int()
  .min(1, "Quantidade do produto é obrigatória!");
const quantidadeEdicao = z
  .number()
  .int()
  .min(0, "Quantidade do produto não pode ser negativa!");
const valorProduto = z.number().positive("Valor do produto é obrigatório!");

export const PostEstoqueSchema = z.object({
  descricao,
  quantidade: quantidadeEntrada,
  valorProduto,
  criadoPor: z.number().optional(),
});

export const IdEstoqueSchema = z.object({
  idProduto: z.coerce.number().int().positive("Id do produto é obrigatório!"),
});

export const PutEstoqueSchema = z.object({
  idProduto: z.coerce.number().int().positive("Id do produto é obrigatório!"),
  descricao: descricao.optional(),
  quantidade: quantidadeEdicao.optional(),
  valorProduto: valorProduto.optional(),
  modificadoPor: z.number().optional(),
});

export const SoftDeleteEstoqueSchema = z.object({
  idProduto: z.coerce.number().int().positive("Id do produto é obrigatório!"),
  modificadoPor: z.number().optional(),
});

export type CreateEstoqueDTO = z.infer<typeof PostEstoqueSchema>;
export type IdEstoqueDTO = z.infer<typeof IdEstoqueSchema>;
export type PutEstoqueDTO = z.infer<typeof PutEstoqueSchema>;
export type SoftDeleteEstoqueDTO = z.infer<typeof SoftDeleteEstoqueSchema>;
