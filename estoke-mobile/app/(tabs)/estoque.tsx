import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDados } from "../../src/useDados";
import { BotaoTopo, Carregando, Topo, Vazio } from "../../src/components/ui";
import { cores, espaco, raio, LIMITE_ESTOQUE_BAIXO } from "../../src/theme";
import { moeda, numero } from "../../src/format";

export default function Estoque() {
  const router = useRouter();
  const { produtos, carregando, atualizando, erro, atualizar } = useDados();
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const lista = termo
    ? produtos.filter((produto) =>
        produto.descricao.toLowerCase().includes(termo),
      )
    : produtos;

  return (
    <View style={e.tela}>
      <Topo
        titulo="Estoque"
        subtitulo={`${numero(produtos.length)} ${produtos.length === 1 ? "produto" : "produtos"}`}
        acao={<BotaoTopo icone="add" aoTocar={() => router.push("/produto")} />}
      />

      <View style={e.buscaArea}>
        <Ionicons name="search" size={16} color={cores.textoSuave} />
        <TextInput
          style={e.busca}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar produto"
          placeholderTextColor={cores.textoSuave}
        />
      </View>

      {carregando ? (
        <Carregando />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(produto) => String(produto.id)}
          contentContainerStyle={e.conteudo}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} />
          }
          ListEmptyComponent={
            <Vazio
              icone={erro ? "cloud-offline-outline" : "cube-outline"}
              texto={erro ?? "Nenhum produto por aqui."}
            />
          }
          renderItem={({ item }) => {
            const baixo = item.quantidade <= LIMITE_ESTOQUE_BAIXO;

            return (
              <Pressable
                style={e.linha}
                onPress={() => router.push(`/produto?id=${item.id}`)}
              >
                <View style={e.icone}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={20}
                    color={cores.primaria}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={e.nome} numberOfLines={1}>
                    {item.descricao}
                  </Text>
                  <Text style={e.sub}>
                    ID {item.id} · {moeda(item.valor_produto)}
                  </Text>
                </View>
                <Text style={[e.qtd, baixo && { color: cores.ambar }]}>
                  {item.quantidade} un.
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={cores.textoSuave}
                />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  buscaArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    backgroundColor: cores.cartao,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    paddingHorizontal: espaco.lg,
  },
  busca: { flex: 1, height: 48, fontSize: 14, color: cores.texto },
  conteudo: { padding: espaco.lg, gap: espaco.sm },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: raio.sm,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  nome: { fontSize: 14, fontWeight: "700", color: cores.texto },
  sub: { fontSize: 11, color: cores.textoSuave, marginTop: 2 },
  qtd: { fontSize: 13, fontWeight: "700", color: cores.texto },
});
