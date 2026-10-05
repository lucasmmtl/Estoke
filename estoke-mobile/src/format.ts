const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function moeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

export function moedaCurta(valor: number): string {
  if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1).replace(".", ",")}M`;
  if (valor >= 1000) return `R$ ${Math.round(valor / 1000)}k`;
  return moeda(valor);
}

export function numero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

export function mesAtual(): string {
  return MESES[new Date().getMonth()] ?? "";
}

export function ehDesteMes(iso: string | null): boolean {
  if (!iso) return false;
  const data = new Date(iso);
  const hoje = new Date();
  return (
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear()
  );
}

export function quando(iso: string | null): string {
  if (!iso) return "";
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();

  if (mesmoDia) {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (data.toDateString() === ontem.toDateString()) return "Ontem";

  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function dataBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}
