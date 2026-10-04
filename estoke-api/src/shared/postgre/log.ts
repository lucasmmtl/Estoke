import type { PoolClient } from "pg";

export type TabelaLog = {
  tabela: string;
  colunaId: string;
};

export type Alteracao = {
  coluna: string;
  anterior?: unknown;
  novo?: unknown;
};

function normalizar(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  return String(valor);
}

export async function registrarLog(
  client: PoolClient,
  destino: TabelaLog,
  registroId: number,
  alteracoes: Alteracao[],
  modificadoPor: number | undefined,
): Promise<void> {
  const sql = `INSERT INTO ${destino.tabela} (
            ${destino.colunaId},
            COLUNA,
            VALOR_ANTERIOR,
            VALOR_NOVO,
            MODIFICADO_POR,
            MODIFICADO_EM
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`;

  for (const alteracao of alteracoes) {
    const valorAnterior = normalizar(alteracao.anterior);
    const valorNovo = normalizar(alteracao.novo);

    if (valorNovo === null || valorNovo === valorAnterior) continue;

    await client.query(sql, [
      registroId,
      alteracao.coluna,
      valorAnterior,
      valorNovo,
      modificadoPor,
    ]);
  }
}
