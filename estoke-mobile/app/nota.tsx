import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../src/api";
import { Botao, Campo, Carregando } from "../src/components/ui";
import { cores, espaco, raio } from "../src/theme";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Nota() {
  const router = useRouter();
  const parametros = useLocalSearchParams<{ tipo?: string; id?: string }>();
  const idNota = parametros.id ? Number(parametros.id) : null;

  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">(
    parametros.tipo === "SAIDA" ? "SAIDA" : "ENTRADA",
  );
  const [numero, setNumero] = useState("");
  const [serie, setSerie] = useState("1");
  const [fornecedor, setFornecedor] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [dataEmissao, setDataEmissao] = useState(hoje());
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [carregando, setCarregando] = useState(idNota !== null);

  useEffect(() => {
    if (idNota === null) return;

    let ativo = true;
    async function carregarNota() {
      try {
        const notas = await api.notas();
        const nota = notas.find((item) => item.id === idNota);
        if (!nota) {
          if (ativo) setErro("Nota fiscal não encontrada.");
          return;
        }
        if (!ativo) return;
        setNumero(nota.numero);
        setSerie(nota.serie);
        setTipo(nota.tipo);
        setFornecedor(nota.fornecedor);
        setCnpj(nota.cnpj.replace(/\D/g, ""));
        setValorTotal(String(nota.valor_total));
        setDataEmissao(nota.data_emissao);
      } catch (problema) {
        if (ativo) setErro((problema as Error).message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarNota();
    return () => {
      ativo = false;
    };
  }, [idNota]);

  async function salvar() {
    const somenteDigitos = cnpj.replace(/\D/g, "");
    const valorNumero = Number(valorTotal.replace(",", "."));

    if (!numero.trim()) return setErro("Informe o número da nota.");
    if (!serie.trim()) return setErro("Informe a série da nota.");
    if (!fornecedor.trim()) return setErro("Informe o fornecedor.");
    if (somenteDigitos.length !== 14)
      return setErro("CNPJ precisa ter 14 dígitos.");
    if (!(valorNumero > 0)) return setErro("Valor total precisa ser maior que zero.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEmissao))
      return setErro("Data de emissão deve estar no formato AAAA-MM-DD.");

    setErro(null);
    setEnviando(true);

    try {
      const corpo = {
        numero: numero.trim(),
        serie: serie.trim(),
        tipo,
        fornecedor: fornecedor.trim(),
        cnpj: somenteDigitos,
        valorTotal: valorNumero,
        dataEmissao,
      };

      if (idNota !== null) await api.editarNota(idNota, corpo);
      else await api.criarNota(corpo);

      router.back();
    } catch (problema) {
      setErro((problema as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function excluir() {
    if (idNota === null) return;

    Alert.alert("Excluir nota fiscal", `Remover a nota ${numero}/${serie}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          setErro(null);
          setExcluindo(true);
          try {
            await api.excluirNota(idNota);
            router.back();
          } catch (problema) {
            setErro((problema as Error).message);
          } finally {
            setExcluindo(false);
          }
        },
      },
    ]);
  }

  if (carregando) return <Carregando />;

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      <Text style={e.rotulo}>TIPO</Text>
      <View style={e.tipos}>
        {(["ENTRADA", "SAIDA"] as const).map((opcao) => {
          const ativo = tipo === opcao;

          return (
            <Pressable
              key={opcao}
              onPress={() => setTipo(opcao)}
              style={[e.tipo, ativo && e.tipoAtivo]}
            >
              <Text style={[e.tipoTexto, ativo && e.tipoTextoAtivo]}>
                {opcao === "ENTRADA" ? "Entrada" : "Saída"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={e.dupla}>
        <View style={{ flex: 2 }}>
          <Campo
            rotulo="Número"
            value={numero}
            onChangeText={setNumero}
            placeholder="000123"
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Campo rotulo="Série" value={serie} onChangeText={setSerie} placeholder="1" />
        </View>
      </View>

      <Campo
        rotulo="Fornecedor"
        value={fornecedor}
        onChangeText={setFornecedor}
        placeholder="Distribuidora XPTO"
      />
      <Campo
        rotulo="CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
        placeholder="apenas números"
        keyboardType="number-pad"
        maxLength={14}
      />
      <Campo
        rotulo="Valor total (R$)"
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <Campo
        rotulo="Data de emissão"
        value={dataEmissao}
        onChangeText={setDataEmissao}
        placeholder="AAAA-MM-DD"
      />

      {erro ? <Text style={e.erro}>{erro}</Text> : null}

      <Botao
        titulo={idNota !== null ? "Salvar alterações" : "Cadastrar nota"}
        aoTocar={salvar}
        carregando={enviando}
        desabilitado={excluindo}
      />
      {idNota !== null ? (
        <View style={{ marginTop: espaco.md }}>
          <Botao
            titulo="Excluir nota fiscal"
            aoTocar={excluir}
            variante="perigo"
            carregando={excluindo}
            desabilitado={enviando}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  rotulo: {
    fontSize: 12,
    fontWeight: "700",
    color: cores.textoSuave,
    marginBottom: espaco.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipos: { flexDirection: "row", gap: espaco.sm, marginBottom: espaco.lg },
  tipo: {
    flex: 1,
    height: 44,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: "center",
    justifyContent: "center",
  },
  tipoAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  tipoTexto: { fontSize: 14, fontWeight: "600", color: cores.textoSuave },
  tipoTextoAtivo: { color: "#FFF" },
  dupla: { flexDirection: "row", gap: espaco.md },
  erro: {
    fontSize: 13,
    color: cores.vermelho,
    marginBottom: espaco.md,
    textAlign: "center",
  },
});
