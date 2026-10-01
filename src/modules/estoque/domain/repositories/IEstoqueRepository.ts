import type {
  CreateEstoqueDTO,
  PutEstoqueDTO,
  SoftDeleteEstoqueDTO,
} from "../../applications/schemas/EstoqueSchemas.js";

export interface IEstoqueRepository {
  CreateEstoqueEntrada(params: CreateEstoqueDTO): Promise<void>;
  GetEstoque(): Promise<any>;
  SoftDeleteEstoque(idProduto: SoftDeleteEstoqueDTO): Promise<void>;
  EditEstoque(params: PutEstoqueDTO): Promise<any>;
}
