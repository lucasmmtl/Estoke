import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../src/api";
import { Botao, Campo, Carregando } from "../src/components/ui";
import { cores, espaco } from "../src/theme";

export default function Produto() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = !!id;

  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(editando);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando) return;

    (async () => {
      try {
        const produto = (await api.produtos()).find(
          (item) => item.id === Number(id),
        );

        if (!produto) {
          setErro("Produto não encontrado.");
        } else {
          setDescricao(produto.descricao);
          setQuantidade(String(produto.quantidade));
          setValor(String(produto.valor_produto).replace(".", ","));
        }
      } catch (problema) {
        setErro((problema as Error).message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, editando]);

  async function salvar() {
    const quantidadeNumero = Number(quantidade);
    const valorNumero = Number(valor.replace(",", "."));

    if (!descricao.trim()) return setErro("Informe a descrição do produto.");
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero < 0)
      return setErro("Quantidade precisa ser um número inteiro.");
    if (!(valorNumero > 0)) return setErro("Valor precisa ser maior que zero.");

    setErro(null);
    setEnviando(true);

    try {
      if (editando) {
        await api.editarProduto(Number(id), {
          descricao: descricao.trim(),
          quantidade: quantidadeNumero,
          valorProduto: valorNumero,
        });
      } else {
        await api.criarProduto({
          descricao: descricao.trim(),
          quantidade: quantidadeNumero,
          valorProduto: valorNumero,
        });
      }

      router.back();
    } catch (problema) {
      setErro((problema as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function excluir() {
    Alert.alert("Excluir produto", `Remover "${descricao}" do estoque?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirProduto(Number(id));
            router.back();
          } catch (problema) {
            setErro((problema as Error).message);
          }
        },
      },
    ]);
  }

  if (carregando) return <Carregando />;

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      <Campo
        rotulo="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Caneta esferográfica azul"
      />
      <Campo
        rotulo="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        placeholder="0"
        keyboardType="number-pad"
      />
      <Campo
        rotulo="Valor unitário (R$)"
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />

      {erro ? <Text style={e.erro}>{erro}</Text> : null}

      <Botao
        titulo={editando ? "Salvar alterações" : "Adicionar ao estoque"}
        aoTocar={salvar}
        carregando={enviando}
      />

      {editando ? (
        <View style={{ marginTop: espaco.md }}>
          <Botao titulo="Excluir produto" aoTocar={excluir} variante="perigo" />
        </View>
      ) : null}
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  erro: {
    fontSize: 13,
    color: cores.vermelho,
    marginBottom: espaco.md,
    textAlign: "center",
  },
});
