import { lerToken } from "./storage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export type Produto = {
  id: number;
  descricao: string;
  quantidade: number;
  valor_produto: number;
  criado_por: number;
  criado_em: string;
  alterado_em: string | null;
};

export type Nota = {
  id: number;
  numero: string;
  serie: string;
  tipo: "ENTRADA" | "SAIDA";
  fornecedor: string;
  cnpj: string;
  valor_total: number;
  data_emissao: string;
  criado_por: number;
  criado_em: string;
  alterado_em: string | null;
};

export type Perfil = {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  criado_em: string;
};

export type LinhaLog = {
  id: number;
  coluna: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  modificado_por: number;
  modificado_em: string;
};

export class ErroApi extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

async function chamar<T>(
  rota: string,
  opcoes: { metodo?: string; corpo?: unknown; publico?: boolean } = {},
): Promise<T> {
  const cabecalhos: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!opcoes.publico) {
    const token = await lerToken();
    if (token) cabecalhos.Authorization = `Bearer ${token}`;
  }

  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: opcoes.metodo ?? "GET",
      headers: cabecalhos,
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    throw new ErroApi(0, `Não foi possível falar com a API em ${API_URL}.`);
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const detalhe = dados?.erros?.[0]?.message ?? dados?.message;
    throw new ErroApi(resposta.status, detalhe ?? "Erro inesperado na API.");
  }

  return dados as T;
}

export const api = {
  login: (email: string, senha: string) =>
    chamar<{ token: string }>("/usuarios/login", {
      metodo: "POST",
      corpo: { email, senha },
      publico: true,
    }),

  cadastrar: (corpo: {
    nome: string;
    usuario: string;
    email: string;
    senha: string;
  }) =>
    chamar<{ message: string }>("/usuarios/", {
      metodo: "POST",
      corpo,
      publico: true,
    }),

  perfil: () => chamar<Perfil>("/usuarios/perfil"),

  produtos: () => chamar<Produto[]>("/estoque/"),

  criarProduto: (corpo: {
    descricao: string;
    quantidade: number;
    valorProduto: number;
  }) => chamar<{ message: string }>("/estoque/", { metodo: "POST", corpo }),

  editarProduto: (
    id: number,
    corpo: { descricao?: string; quantidade?: number; valorProduto?: number },
  ) => chamar<{ message: string }>(`/estoque/${id}`, { metodo: "PUT", corpo }),

  excluirProduto: (id: number) =>
    chamar<{ message: string }>(`/estoque/${id}`, { metodo: "DELETE" }),

  logProduto: (id: number) => chamar<LinhaLog[]>(`/estoque/${id}/log`),

  notas: (tipo?: "ENTRADA" | "SAIDA") =>
    chamar<Nota[]>(`/notas-fiscais/${tipo ? `?tipo=${tipo}` : ""}`),

  criarNota: (corpo: {
    numero: string;
    serie: string;
    tipo: "ENTRADA" | "SAIDA";
    fornecedor: string;
    cnpj: string;
    valorTotal: number;
    dataEmissao: string;
  }) => chamar<{ message: string }>("/notas-fiscais/", { metodo: "POST", corpo }),

  editarNota: (
    id: number,
    corpo: {
      numero: string;
      serie: string;
      tipo: "ENTRADA" | "SAIDA";
      fornecedor: string;
      cnpj: string;
      valorTotal: number;
      dataEmissao: string;
    },
  ) => chamar<{ message: string }>(`/notas-fiscais/${id}`, { metodo: "PUT", corpo }),

  excluirNota: (id: number) =>
    chamar<{ message: string }>(`/notas-fiscais/${id}`, { metodo: "DELETE" }),

  logNota: (id: number) => chamar<LinhaLog[]>(`/notas-fiscais/${id}/log`),
};
