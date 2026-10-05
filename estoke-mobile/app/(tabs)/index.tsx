import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth";
import { atividades, resumo, useDados } from "../../src/useDados";
import { Cartao, Carregando, Etiqueta, Secao, Vazio } from "../../src/components/ui";
import { cores, espaco, raio } from "../../src/theme";
import {
  iniciais,
  mesAtual,
  moedaCurta,
  numero,
  quando,
  saudacao,
} from "../../src/format";

const ATALHOS = [
  { chave: "nota", rotulo: "Nova nota", icone: "file-plus-outline", destino: "/nota" },
  { chave: "entrada", rotulo: "Entrada", icone: "package-down", destino: "/produto" },
  { chave: "saida", rotulo: "Saída", icone: "package-up", destino: "/nota?tipo=SAIDA" },
  { chave: "consultar", rotulo: "Consultar", icone: "magnify", destino: "/estoque" },
] as const;

export default function Inicio() {
  const { perfil } = useAuth();
  const router = useRouter();
  const { produtos, notas, carregando, atualizando, erro, atualizar } = useDados();
  const topo = useSafeAreaInsets().top;

  const r = resumo(produtos, notas);
  const recentes = atividades(produtos, notas);

  return (
    <View style={e.tela}>
      <View style={[e.cabecalho, { paddingTop: topo + espaco.md }]}>
        <View style={{ flex: 1 }}>
          <Text style={e.saudacao}>
            {saudacao()}, {perfil?.nome ?? ""}
          </Text>
          <Text style={e.marca}>Estokê</Text>
        </View>
        <Pressable style={e.sino} hitSlop={8}>
          <Ionicons name="notifications-outline" size={20} color="#FFF" />
        </Pressable>
        <View style={e.avatar}>
          <Text style={e.avatarTexto}>{iniciais(perfil?.nome ?? "")}</Text>
        </View>
      </View>

      <View style={e.corpo}>
        <ScrollView
          contentContainerStyle={e.conteudo}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} />
          }
        >
          {carregando ? (
            <Carregando />
          ) : erro ? (
            <Cartao>
              <Vazio icone="cloud-offline-outline" texto={erro} />
            </Cartao>
          ) : (
            <>
              <Text style={e.titulo}>Visão geral</Text>

              <View style={e.linha}>
                <Indicador
                  rotulo="PRODUTOS"
                  valor={numero(r.totalProdutos)}
                  nota={`+${r.novosNoMes} este mês`}
                  corNota={cores.primaria}
                  icone="cube"
                  corIcone={cores.primaria}
                  fundoIcone={cores.primariaSuave}
                />
                <Indicador
                  rotulo="EM ESTOQUE"
                  valor={moedaCurta(r.valorEmEstoque)}
                  nota="valor atual"
                  corNota={cores.verde}
                  icone="leaf"
                  corIcone={cores.verde}
                  fundoIcone={cores.verdeSuave}
                />
                <Indicador
                  rotulo="BAIXO QTDE."
                  valor={numero(r.baixos.length)}
                  nota="requer atenção"
                  corNota={cores.ambar}
                  icone="alert"
                  corIcone={cores.ambar}
                  fundoIcone={cores.ambarSuave}
                />
              </View>

              <Secao titulo="Acesso rápido">
                <View style={e.linha}>
                  {ATALHOS.map((atalho, indice) => (
                    <Pressable
                      key={atalho.chave}
                      style={e.atalho}
                      onPress={() => router.push(atalho.destino as never)}
                    >
                      <View
                        style={[
                          e.atalhoIcone,
                          indice === 0 && { backgroundColor: cores.primaria },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={atalho.icone as never}
                          size={22}
                          color={indice === 0 ? "#FFF" : cores.texto}
                        />
                      </View>
                      <Text style={e.atalhoRotulo}>{atalho.rotulo}</Text>
                    </Pressable>
                  ))}
                </View>
              </Secao>

              <View style={[e.linha, { marginTop: espaco.lg }]}>
                <Cartao estilo={e.meio}>
                  <View style={e.meioTopo}>
                    <Text style={e.meioTitulo}>Estoque baixo</Text>
                    <Etiqueta
                      texto={`${r.baixos.length} ${r.baixos.length === 1 ? "item" : "itens"}`}
                      cor={cores.ambar}
                      fundo={cores.ambarSuave}
                    />
                  </View>
                  {r.baixos.length === 0 ? (
                    <Text style={e.meioVazio}>Nenhum item em falta.</Text>
                  ) : (
                    r.baixos.slice(0, 2).map((produto) => (
                      <View key={produto.id} style={e.itemBaixo}>
                        <View style={{ flex: 1 }}>
                          <Text style={e.itemNome} numberOfLines={1}>
                            {produto.descricao}
                          </Text>
                          <Text style={e.itemSub}>ID {produto.id}</Text>
                        </View>
                        <Text style={e.itemQtd}>{produto.quantidade} un.</Text>
                      </View>
                    ))
                  )}
                </Cartao>

                <Pressable
                  style={e.meio}
                  onPress={() => router.push("/notas")}
                >
                  <Cartao estilo={{ flex: 1 }}>
                    <View style={e.meioTopo}>
                      <Text style={e.meioTitulo}>Notas fiscais</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={cores.primaria}
                      />
                    </View>
                    <Text style={e.meioNumero}>{numero(r.totalNotas)}</Text>
                    <Text style={e.itemSub}>
                      {r.notasDoMes} em {mesAtual()}
                    </Text>
                    <View style={e.meioRodape}>
                      <Text style={[e.meioTag, { color: cores.verde }]}>
                        {r.entradas} entradas
                      </Text>
                      <Text style={[e.meioTag, { color: cores.ambar }]}>
                        {r.saidas} saídas
                      </Text>
                    </View>
                  </Cartao>
                </Pressable>
              </View>

              <Secao
                titulo="Atividades recentes"
                acao="Ver todas"
                aoTocarAcao={() => router.push("/estoque")}
              >
                <Cartao estilo={{ paddingVertical: espaco.sm }}>
                  {recentes.length === 0 ? (
                    <Vazio icone="time-outline" texto="Nada por aqui ainda." />
                  ) : (
                    recentes.map((atividade) => (
                      <View key={atividade.chave} style={e.atividade}>
                        <View style={e.atividadeIcone}>
                          <MaterialCommunityIcons
                            name={
                              atividade.tipo === "nota"
                                ? "file-document-outline"
                                : "package-down"
                            }
                            size={18}
                            color={cores.primaria}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={e.atividadeTitulo} numberOfLines={1}>
                            {atividade.titulo}
                          </Text>
                          <Text style={e.itemSub} numberOfLines={1}>
                            {atividade.detalhe}
                          </Text>
                        </View>
                        <Text style={e.atividadeHora}>
                          {quando(atividade.quando)}
                        </Text>
                      </View>
                    ))
                  )}
                </Cartao>
              </Secao>

              <Pressable
                style={e.pendencias}
                onPress={() => router.push("/estoque")}
              >
                <View style={e.pendenciasIcone}>
                  <Ionicons name="time-outline" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={e.pendenciasTitulo}>Pendências do dia</Text>
                  <Text style={e.pendenciasSub}>
                    {r.baixos.length} itens em falta · {r.saidas} notas de saída
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function Indicador({
  rotulo,
  valor,
  nota,
  corNota,
  icone,
  corIcone,
  fundoIcone,
}: {
  rotulo: string;
  valor: string;
  nota: string;
  corNota: string;
  icone: string;
  corIcone: string;
  fundoIcone: string;
}) {
  return (
    <Cartao estilo={e.indicador}>
      <View style={e.indicadorTopo}>
        <Text style={e.indicadorRotulo}>{rotulo}</Text>
        <View style={[e.indicadorIcone, { backgroundColor: fundoIcone }]}>
          <MaterialCommunityIcons
            name={icone as never}
            size={12}
            color={corIcone}
          />
        </View>
      </View>
      <Text style={e.indicadorValor}>{valor}</Text>
      <Text style={[e.indicadorNota, { color: corNota }]}>{nota}</Text>
    </Cartao>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.topo },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.xl,
  },
  saudacao: { color: cores.topoSuave, fontSize: 13 },
  marca: { color: cores.topoTexto, fontSize: 22, fontWeight: "800", marginTop: 2 },
  sino: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#22354F",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  corpo: {
    flex: 1,
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xl * 2 },
  titulo: { fontSize: 20, fontWeight: "800", color: cores.texto, marginBottom: espaco.md },
  linha: { flexDirection: "row", gap: espaco.sm },
  indicador: { flex: 1, padding: espaco.md },
  indicadorTopo: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  indicadorRotulo: {
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
    color: cores.textoSuave,
    letterSpacing: 0.4,
  },
  indicadorIcone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  indicadorValor: {
    fontSize: 20,
    fontWeight: "800",
    color: cores.texto,
    marginTop: espaco.sm,
  },
  indicadorNota: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  atalho: { flex: 1, alignItems: "center", gap: espaco.sm },
  atalhoIcone: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 58,
    borderRadius: raio.lg,
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: "center",
    justifyContent: "center",
  },
  atalhoRotulo: { fontSize: 11, color: cores.texto, fontWeight: "600" },
  meio: { flex: 1 },
  meioTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espaco.md,
  },
  meioTitulo: { fontSize: 14, fontWeight: "700", color: cores.texto },
  meioVazio: { fontSize: 12, color: cores.textoSuave },
  meioNumero: { fontSize: 28, fontWeight: "800", color: cores.texto },
  meioRodape: { marginTop: espaco.md, gap: 2 },
  meioTag: { fontSize: 11, fontWeight: "600" },
  itemBaixo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    marginBottom: espaco.md,
  },
  itemNome: { fontSize: 13, fontWeight: "600", color: cores.texto },
  itemSub: { fontSize: 11, color: cores.textoSuave, marginTop: 1 },
  itemQtd: { fontSize: 13, fontWeight: "700", color: cores.ambar },
  atividade: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
  },
  atividadeIcone: {
    width: 34,
    height: 34,
    borderRadius: raio.sm,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  atividadeTitulo: { fontSize: 13, fontWeight: "700", color: cores.texto },
  atividadeHora: { fontSize: 11, color: cores.textoSuave },
  pendencias: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    backgroundColor: cores.topo,
    borderRadius: raio.lg,
    padding: espaco.lg,
    marginTop: espaco.xl,
  },
  pendenciasIcone: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#22354F",
    alignItems: "center",
    justifyContent: "center",
  },
  pendenciasTitulo: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  pendenciasSub: { color: cores.topoSuave, fontSize: 11, marginTop: 2 },
});
