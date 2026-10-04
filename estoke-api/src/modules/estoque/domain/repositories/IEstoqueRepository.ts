import type {
  CreateEstoqueDTO,
  PutEstoqueDTO,
  SoftDeleteEstoqueDTO,
} from "../../applications/schemas/EstoqueSchemas.js";

export interface IEstoqueRepository {
  CreateEstoqueEntrada(params: CreateEstoqueDTO): Promise<void>;
  GetEstoque(): Promise<any>;
  GetEstoqueLog(idProduto: number): Promise<any>;
  EditEstoque(params: PutEstoqueDTO): Promise<boolean>;
  SoftDeleteEstoque(params: SoftDeleteEstoqueDTO): Promise<boolean>;
}
