import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDados } from "../../src/useDados";
import {
  BotaoTopo,
  Carregando,
  Etiqueta,
  Topo,
  Vazio,
} from "../../src/components/ui";
import { cores, espaco, raio } from "../../src/theme";
import { dataBr, moeda, numero } from "../../src/format";

const FILTROS = [
  { chave: null, rotulo: "Todas" },
  { chave: "ENTRADA", rotulo: "Entradas" },
  { chave: "SAIDA", rotulo: "Saídas" },
] as const;

export default function Notas() {
  const router = useRouter();
  const { notas, carregando, atualizando, erro, atualizar } = useDados();
  const [filtro, setFiltro] = useState<"ENTRADA" | "SAIDA" | null>(null);

  const lista = filtro ? notas.filter((nota) => nota.tipo === filtro) : notas;

  return (
    <View style={e.tela}>
      <Topo
        titulo="Notas fiscais"
        subtitulo={`${numero(notas.length)} ${notas.length === 1 ? "nota" : "notas"}`}
        acao={<BotaoTopo icone="add" aoTocar={() => router.push("/nota")} />}
      />

      <View style={e.filtros}>
        {FILTROS.map((opcao) => {
          const ativo = filtro === opcao.chave;

          return (
            <Pressable
              key={opcao.rotulo}
              onPress={() => setFiltro(opcao.chave)}
              style={[e.filtro, ativo && e.filtroAtivo]}
            >
              <Text style={[e.filtroTexto, ativo && e.filtroTextoAtivo]}>
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {carregando ? (
        <Carregando />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(nota) => String(nota.id)}
          contentContainerStyle={e.conteudo}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} />
          }
          ListEmptyComponent={
            <Vazio
              icone={erro ? "cloud-offline-outline" : "document-text-outline"}
              texto={erro ?? "Nenhuma nota cadastrada."}
            />
          }
          renderItem={({ item }) => {
            const entrada = item.tipo === "ENTRADA";

            return (
              <Pressable
                style={e.linha}
                onPress={() => router.push(`/nota?id=${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Editar nota ${item.numero}, série ${item.serie}`}
              >
                <View
                  style={[
                    e.icone,
                    { backgroundColor: entrada ? cores.verdeSuave : cores.ambarSuave },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={entrada ? "package-down" : "package-up"}
                    size={20}
                    color={entrada ? cores.verde : cores.ambar}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={e.nome} numberOfLines={1}>
                    NF {item.numero}/{item.serie}
                  </Text>
                  <Text style={e.sub} numberOfLines={1}>
                    {item.fornecedor} · {dataBr(item.data_emissao)}
                  </Text>
                </View>
                <View style={e.direita}>
                  <Text style={e.valor}>{moeda(item.valor_total)}</Text>
                  <Etiqueta
                    texto={entrada ? "ENTRADA" : "SAÍDA"}
                    cor={entrada ? cores.verde : cores.ambar}
                    fundo={entrada ? cores.verdeSuave : cores.ambarSuave}
                  />
                </View>
                <Ionicons name="chevron-forward" size={16} color={cores.textoSuave} />
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
  filtros: {
    flexDirection: "row",
    gap: espaco.sm,
    backgroundColor: cores.cartao,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
  },
  filtro: {
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.sm,
    borderRadius: 999,
    backgroundColor: cores.fundo,
  },
  filtroAtivo: { backgroundColor: cores.primaria },
  filtroTexto: { fontSize: 12, fontWeight: "600", color: cores.textoSuave },
  filtroTextoAtivo: { color: "#FFF" },
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
    alignItems: "center",
    justifyContent: "center",
  },
  nome: { fontSize: 14, fontWeight: "700", color: cores.texto },
  sub: { fontSize: 11, color: cores.textoSuave, marginTop: 2 },
  direita: { alignItems: "flex-end", gap: espaco.xs },
  valor: { fontSize: 13, fontWeight: "700", color: cores.texto },
});
