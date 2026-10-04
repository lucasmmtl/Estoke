import type {
  CreateEstoqueDTO,
  PutEstoqueDTO,
  SoftDeleteEstoqueDTO,
} from "../../applications/schemas/EstoqueSchemas.js";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import { postgres } from "../../../../shared/postgre/connection.js";
import {
  registrarLog,
  type Alteracao,
  type TabelaLog,
} from "../../../../shared/postgre/log.js";
import type { PoolClient } from "pg";

const ESTOQUE_LOG: TabelaLog = {
  tabela: "ESTOQUE_LOG",
  colunaId: "ESTOQUE_ID",
};

type EstoqueAtual = {
  descricao: string;
  quantidade: number;
  valor_produto: number;
};

const COLUNAS_RETORNO = `DESCRICAO,
                    QUANTIDADE,
                    VALOR_PRODUTO::FLOAT8 AS VALOR_PRODUTO`;

function alteracoesDoProduto(
  novo: EstoqueAtual,
  anterior?: EstoqueAtual,
): Alteracao[] {
  return [
    { coluna: "DESCRICAO", anterior: anterior?.descricao, novo: novo.descricao },
    {
      coluna: "QUANTIDADE",
      anterior: anterior?.quantidade,
      novo: novo.quantidade,
    },
    {
      coluna: "VALOR_PRODUTO",
      anterior: anterior?.valor_produto,
      novo: novo.valor_produto,
    },
  ];
}

export class EstoqueRepository implements IEstoqueRepository {
  async CreateEstoqueEntrada(params: CreateEstoqueDTO): Promise<void> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const sql = `INSERT INTO ESTOQUE (
            DESCRICAO,
            QUANTIDADE,
            VALOR_PRODUTO,
            CRIADO_POR,
            CRIADO_EM
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING ID, ${COLUNAS_RETORNO}`;

      const resultado = await client.query<EstoqueAtual & { id: number }>(sql, [
        params.descricao,
        params.quantidade,
        params.valorProduto,
        params.criadoPor,
      ]);

      const criado = resultado.rows[0];

      if (!criado) {
        throw new Error("INSERT em ESTOQUE não retornou o registro criado.");
      }

      await registrarLog(
        client,
        ESTOQUE_LOG,
        criado.id,
        alteracoesDoProduto(criado),
        params.criadoPor,
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async GetEstoque(): Promise<any> {
    const sql = `SELECT
                    ID,
                    ${COLUNAS_RETORNO},
                    CRIADO_POR,
                    CRIADO_EM,
                    ALTERADO_EM
                  FROM ESTOQUE
                  WHERE EXCLUIDO_EM IS NULL
                  ORDER BY DESCRICAO, ID`;

    const resultado = await postgres.query(sql);

    return resultado.rows;
  }

  async GetEstoqueLog(idProduto: number): Promise<any> {
    const sql = `SELECT
                    ID,
                    COLUNA,
                    VALOR_ANTERIOR,
                    VALOR_NOVO,
                    MODIFICADO_POR,
                    MODIFICADO_EM
                  FROM ESTOQUE_LOG
                  WHERE ESTOQUE_ID = $1
                  ORDER BY MODIFICADO_EM DESC, ID DESC`;

    const resultado = await postgres.query(sql, [idProduto]);

    return resultado.rows;
  }

  async EditEstoque(params: PutEstoqueDTO): Promise<boolean> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const atual = await this.buscarEstoqueAtual(client, params.idProduto);

      if (!atual) {
        await client.query("ROLLBACK");
        return false;
      }

      const sql = `UPDATE ESTOQUE SET
                      DESCRICAO = COALESCE($2, DESCRICAO),
                      QUANTIDADE = COALESCE($3, QUANTIDADE),
                      VALOR_PRODUTO = COALESCE($4, VALOR_PRODUTO),
                      ALTERADO_EM = CURRENT_TIMESTAMP
                    WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                    RETURNING ${COLUNAS_RETORNO}`;

      const resultado = await client.query<EstoqueAtual>(sql, [
        params.idProduto,
        params.descricao ?? null,
        params.quantidade ?? null,
        params.valorProduto ?? null,
      ]);

      const novo = resultado.rows[0];

      if (!novo) {
        throw new Error("UPDATE em ESTOQUE não retornou o registro alterado.");
      }

      await registrarLog(
        client,
        ESTOQUE_LOG,
        params.idProduto,
        alteracoesDoProduto(novo, atual),
        params.modificadoPor,
      );

      await client.query("COMMIT");

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async SoftDeleteEstoque(params: SoftDeleteEstoqueDTO): Promise<boolean> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const sql = `UPDATE ESTOQUE SET
                      EXCLUIDO_EM = CURRENT_TIMESTAMP
                    WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                    RETURNING TO_CHAR(EXCLUIDO_EM, 'YYYY-MM-DD HH24:MI:SS') AS EXCLUIDO_EM`;

      const resultado = await client.query<{ excluido_em: string }>(sql, [
        params.idProduto,
      ]);

      const excluido = resultado.rows[0];

      if (!excluido) {
        await client.query("ROLLBACK");
        return false;
      }

      await registrarLog(
        client,
        ESTOQUE_LOG,
        params.idProduto,
        [{ coluna: "EXCLUIDO_EM", novo: excluido.excluido_em }],
        params.modificadoPor,
      );

      await client.query("COMMIT");

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async buscarEstoqueAtual(
    client: PoolClient,
    idProduto: number,
  ): Promise<EstoqueAtual | undefined> {
    const sql = `SELECT ${COLUNAS_RETORNO}
                  FROM ESTOQUE
                  WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                  FOR UPDATE`;

    const resultado = await client.query<EstoqueAtual>(sql, [idProduto]);

    return resultado.rows[0];
  }
}
