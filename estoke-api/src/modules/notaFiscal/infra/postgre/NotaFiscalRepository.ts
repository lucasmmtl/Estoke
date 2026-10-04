import type {
  CreateNotaFiscalDTO,
  GetNotaFiscalDTO,
  PutNotaFiscalDTO,
  SoftDeleteNotaFiscalDTO,
} from "../../applications/schemas/NotaFiscalSchemas.js";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";
import { postgres } from "../../../../shared/postgre/connection.js";
import {
  registrarLog,
  type Alteracao,
  type TabelaLog,
} from "../../../../shared/postgre/log.js";
import type { PoolClient } from "pg";

const NOTA_FISCAL_LOG: TabelaLog = {
  tabela: "NOTA_FISCAL_LOG",
  colunaId: "NOTA_FISCAL_ID",
};

type NotaFiscalAtual = {
  numero: string;
  serie: string;
  tipo: string;
  fornecedor: string;
  cnpj: string;
  valor_total: number;
  data_emissao: string;
};

const COLUNAS_RETORNO = `NUMERO,
                    SERIE,
                    TIPO,
                    FORNECEDOR,
                    CNPJ,
                    VALOR_TOTAL::FLOAT8 AS VALOR_TOTAL,
                    TO_CHAR(DATA_EMISSAO, 'YYYY-MM-DD') AS DATA_EMISSAO`;

function alteracoesDaNota(
  novo: NotaFiscalAtual,
  anterior?: NotaFiscalAtual,
): Alteracao[] {
  return [
    { coluna: "NUMERO", anterior: anterior?.numero, novo: novo.numero },
    { coluna: "SERIE", anterior: anterior?.serie, novo: novo.serie },
    { coluna: "TIPO", anterior: anterior?.tipo, novo: novo.tipo },
    {
      coluna: "FORNECEDOR",
      anterior: anterior?.fornecedor,
      novo: novo.fornecedor,
    },
    { coluna: "CNPJ", anterior: anterior?.cnpj, novo: novo.cnpj },
    {
      coluna: "VALOR_TOTAL",
      anterior: anterior?.valor_total,
      novo: novo.valor_total,
    },
    {
      coluna: "DATA_EMISSAO",
      anterior: anterior?.data_emissao,
      novo: novo.data_emissao,
    },
  ];
}

export class NotaFiscalRepository implements INotaFiscalRepository {
  async CreateNotaFiscal(params: CreateNotaFiscalDTO): Promise<void> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const sql = `INSERT INTO NOTA_FISCAL (
            NUMERO,
            SERIE,
            TIPO,
            FORNECEDOR,
            CNPJ,
            VALOR_TOTAL,
            DATA_EMISSAO,
            CRIADO_POR,
            CRIADO_EM
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          RETURNING ID, ${COLUNAS_RETORNO}`;

      const resultado = await client.query<NotaFiscalAtual & { id: number }>(
        sql,
        [
          params.numero,
          params.serie,
          params.tipo,
          params.fornecedor,
          params.cnpj,
          params.valorTotal,
          params.dataEmissao,
          params.criadoPor,
        ],
      );

      const criada = resultado.rows[0];

      if (!criada) {
        throw new Error("INSERT em NOTA_FISCAL não retornou o registro criado.");
      }

      await registrarLog(
        client,
        NOTA_FISCAL_LOG,
        criada.id,
        alteracoesDaNota(criada),
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

  async GetNotaFiscal(params: GetNotaFiscalDTO): Promise<any> {
    const sql = `SELECT
                    ID,
                    ${COLUNAS_RETORNO},
                    CRIADO_POR,
                    CRIADO_EM,
                    ALTERADO_EM
                  FROM NOTA_FISCAL
                  WHERE EXCLUIDO_EM IS NULL
                    AND ($1::VARCHAR IS NULL OR TIPO = $1)
                  ORDER BY DATA_EMISSAO DESC, ID DESC`;

    const resultado = await postgres.query(sql, [params.tipo ?? null]);

    return resultado.rows;
  }

  async GetNotaFiscalLog(idNotaFiscal: number): Promise<any> {
    const sql = `SELECT
                    ID,
                    COLUNA,
                    VALOR_ANTERIOR,
                    VALOR_NOVO,
                    MODIFICADO_POR,
                    MODIFICADO_EM
                  FROM NOTA_FISCAL_LOG
                  WHERE NOTA_FISCAL_ID = $1
                  ORDER BY MODIFICADO_EM DESC, ID DESC`;

    const resultado = await postgres.query(sql, [idNotaFiscal]);

    return resultado.rows;
  }

  async EditNotaFiscal(params: PutNotaFiscalDTO): Promise<boolean> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const atual = await this.buscarNotaFiscalAtual(
        client,
        params.idNotaFiscal,
      );

      if (!atual) {
        await client.query("ROLLBACK");
        return false;
      }

      const sql = `UPDATE NOTA_FISCAL SET
                      NUMERO = COALESCE($2, NUMERO),
                      SERIE = COALESCE($3, SERIE),
                      TIPO = COALESCE($4, TIPO),
                      FORNECEDOR = COALESCE($5, FORNECEDOR),
                      CNPJ = COALESCE($6, CNPJ),
                      VALOR_TOTAL = COALESCE($7, VALOR_TOTAL),
                      DATA_EMISSAO = COALESCE($8::DATE, DATA_EMISSAO),
                      ALTERADO_EM = CURRENT_TIMESTAMP
                    WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                    RETURNING ${COLUNAS_RETORNO}`;

      const resultado = await client.query<NotaFiscalAtual>(sql, [
        params.idNotaFiscal,
        params.numero ?? null,
        params.serie ?? null,
        params.tipo ?? null,
        params.fornecedor ?? null,
        params.cnpj ?? null,
        params.valorTotal ?? null,
        params.dataEmissao ?? null,
      ]);

      const nova = resultado.rows[0];

      if (!nova) {
        throw new Error(
          "UPDATE em NOTA_FISCAL não retornou o registro alterado.",
        );
      }

      await registrarLog(
        client,
        NOTA_FISCAL_LOG,
        params.idNotaFiscal,
        alteracoesDaNota(nova, atual),
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

  async SoftDeleteNotaFiscal(
    params: SoftDeleteNotaFiscalDTO,
  ): Promise<boolean> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const sql = `UPDATE NOTA_FISCAL SET
                      EXCLUIDO_EM = CURRENT_TIMESTAMP
                    WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                    RETURNING TO_CHAR(EXCLUIDO_EM, 'YYYY-MM-DD HH24:MI:SS') AS EXCLUIDO_EM`;

      const resultado = await client.query<{ excluido_em: string }>(sql, [
        params.idNotaFiscal,
      ]);

      const excluida = resultado.rows[0];

      if (!excluida) {
        await client.query("ROLLBACK");
        return false;
      }

      await registrarLog(
        client,
        NOTA_FISCAL_LOG,
        params.idNotaFiscal,
        [{ coluna: "EXCLUIDO_EM", novo: excluida.excluido_em }],
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

  private async buscarNotaFiscalAtual(
    client: PoolClient,
    idNotaFiscal: number,
  ): Promise<NotaFiscalAtual | undefined> {
    const sql = `SELECT ${COLUNAS_RETORNO}
                  FROM NOTA_FISCAL
                  WHERE ID = $1 AND EXCLUIDO_EM IS NULL
                  FOR UPDATE`;

    const resultado = await client.query<NotaFiscalAtual>(sql, [idNotaFiscal]);

    return resultado.rows[0];
  }
}
