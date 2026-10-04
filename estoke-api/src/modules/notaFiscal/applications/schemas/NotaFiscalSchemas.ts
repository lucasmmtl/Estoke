import z from "zod";

export const TipoNotaFiscalSchema = z.enum(["ENTRADA", "SAIDA"]);

const numero = z.string().trim().min(1, "Número da nota fiscal é obrigatório!");
const serie = z.string().trim().min(1, "Série da nota fiscal é obrigatória!");
const fornecedor = z.string().trim().min(1, "Fornecedor é obrigatório!");
const cnpj = z
  .string()
  .trim()
  .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos, apenas números!");
const valorTotal = z
  .number()
  .positive("Valor total da nota fiscal é obrigatório!");
const dataEmissao = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de emissão deve estar no formato AAAA-MM-DD!");

export const PostNotaFiscalSchema = z.object({
  numero,
  serie,
  tipo: TipoNotaFiscalSchema,
  fornecedor,
  cnpj,
  valorTotal,
  dataEmissao,
  criadoPor: z.number().optional(),
});

export const GetNotaFiscalSchema = z.object({
  tipo: TipoNotaFiscalSchema.optional(),
});

export const IdNotaFiscalSchema = z.object({
  idNotaFiscal: z.coerce.number().int().positive("Id da nota fiscal é obrigatório!"),
});

export const PutNotaFiscalSchema = z.object({
  idNotaFiscal: z.coerce.number().int().positive("Id da nota fiscal é obrigatório!"),
  numero: numero.optional(),
  serie: serie.optional(),
  tipo: TipoNotaFiscalSchema.optional(),
  fornecedor: fornecedor.optional(),
  cnpj: cnpj.optional(),
  valorTotal: valorTotal.optional(),
  dataEmissao: dataEmissao.optional(),
  modificadoPor: z.number().optional(),
});

export const SoftDeleteNotaFiscalSchema = z.object({
  idNotaFiscal: z.coerce.number().int().positive("Id da nota fiscal é obrigatório!"),
  modificadoPor: z.number().optional(),
});

export type CreateNotaFiscalDTO = z.infer<typeof PostNotaFiscalSchema>;
export type GetNotaFiscalDTO = z.infer<typeof GetNotaFiscalSchema>;
export type IdNotaFiscalDTO = z.infer<typeof IdNotaFiscalSchema>;
export type PutNotaFiscalDTO = z.infer<typeof PutNotaFiscalSchema>;
export type SoftDeleteNotaFiscalDTO = z.infer<typeof SoftDeleteNotaFiscalSchema>;
