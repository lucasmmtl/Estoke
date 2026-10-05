import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, type Nota, type Produto } from "./api";
import { LIMITE_ESTOQUE_BAIXO } from "./theme";
import { ehDesteMes } from "./format";

export function useDados() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const [listaProdutos, listaNotas] = await Promise.all([
        api.produtos(),
        api.notas(),
      ]);
      setProdutos(listaProdutos);
      setNotas(listaNotas);
    } catch (problema) {
      setErro((problema as Error).message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  const atualizar = useCallback(() => {
    setAtualizando(true);
    carregar();
  }, [carregar]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return { produtos, notas, carregando, atualizando, erro, atualizar };
}

export function resumo(produtos: Produto[], notas: Nota[]) {
  const baixos = produtos
    .filter((produto) => produto.quantidade <= LIMITE_ESTOQUE_BAIXO)
    .sort((a, b) => a.quantidade - b.quantidade);

  return {
    totalProdutos: produtos.length,
    novosNoMes: produtos.filter((produto) => ehDesteMes(produto.criado_em)).length,
    valorEmEstoque: produtos.reduce(
      (soma, produto) => soma + produto.quantidade * produto.valor_produto,
      0,
    ),
    baixos,
    totalNotas: notas.length,
    notasDoMes: notas.filter((nota) => ehDesteMes(nota.criado_em)).length,
    entradas: notas.filter((nota) => nota.tipo === "ENTRADA").length,
    saidas: notas.filter((nota) => nota.tipo === "SAIDA").length,
  };
}

export type Atividade = {
  chave: string;
  tipo: "nota" | "entrada";
  titulo: string;
  detalhe: string;
  quando: string;
};

export function atividades(produtos: Produto[], notas: Nota[]): Atividade[] {
  const deNotas: Atividade[] = notas.map((nota) => ({
    chave: `nota-${nota.id}`,
    tipo: "nota",
    titulo: `NF ${nota.numero}/${nota.serie} cadastrada`,
    detalhe: `${nota.tipo === "ENTRADA" ? "Entrada" : "Saída"} · ${nota.fornecedor}`,
    quando: nota.criado_em,
  }));

  const deProdutos: Atividade[] = produtos.map((produto) => ({
    chave: `produto-${produto.id}`,
    tipo: "entrada",
    titulo: `Entrada de ${produto.quantidade} un.`,
    detalhe: produto.descricao,
    quando: produto.criado_em,
  }));

  return [...deNotas, ...deProdutos]
    .sort((a, b) => (a.quando < b.quando ? 1 : -1))
    .slice(0, 3);
}
