import type {
  CreateEstoqueDTO,
  PutEstoqueDTO,
  SoftDeleteEstoqueDTO,
} from "../../applications/schemas/EstoqueSchemas.js";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import { postgres } from "../../../../shared/postgre/connection.js";

export class EstoqueRepository implements IEstoqueRepository {
  async CreateEstoqueEntrada(params: CreateEstoqueDTO): Promise<void> {
    const sql = `INSERT INTO ESTOQUE (
            DESCRICAO,
            QUANTIDADE,
            VALOR_PRODUTO,
            CRIADO_POR,
            CRIADO_EM
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

    await postgres.query(sql, [
      params.descricao,
      params.quantidade,
      params.valorProduto,
      params.criadoPor,
    ]);
  }

  async GetEstoque(): Promise<any> {
    const sql = `SELECT * FROM ESTOQUE`;

    return await postgres.query(sql);
  }

  async SoftDeleteEstoque(idProduto: SoftDeleteEstoqueDTO): Promise<void> {
    const sql = `UPDATE ESTOQUE SET 
                    EXCLUIDO_EM = CURRENT_TIMESTAMP 
                  WHERE ID_PRODUTO = $1`;

    await postgres.query(sql, [idProduto]);
  }

  async EditEstoque(params: PutEstoqueDTO): Promise<any> {
    const sql = `UPDATE ESTOQUE SET 
                    DESCRICAO = $1, 
                    QUANTIDADE = $2, 
                    VALOR_PRODUTO = $3, 
                    ALTERADO_EM = CURRENT_TIMESTAMP 
                  WHERE ID_PRODUTO = $5`;

    await postgres.query(sql, [
      params.descricao,
      params.quantidade,
      params.valorProduto,
      params.idProduto,
    ]);
  }
}
