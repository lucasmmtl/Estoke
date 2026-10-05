import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/auth";
import { API_URL } from "../../src/api";
import { Botao, Cartao, Topo } from "../../src/components/ui";
import { cores, espaco, raio } from "../../src/theme";
import { iniciais } from "../../src/format";

export default function Mais() {
  const { perfil, sair } = useAuth();

  return (
    <View style={e.tela}>
      <Topo titulo="Mais" />

      <ScrollView contentContainerStyle={e.conteudo}>
        <Cartao>
          <View style={e.perfil}>
            <View style={e.avatar}>
              <Text style={e.avatarTexto}>{iniciais(perfil?.nome ?? "")}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={e.nome}>{perfil?.nome}</Text>
              <Text style={e.email}>{perfil?.email}</Text>
            </View>
          </View>

          <View style={e.divisor} />

          <Linha rotulo="Usuário" valor={perfil?.usuario ?? "-"} />
          <Linha rotulo="ID" valor={String(perfil?.id ?? "-")} />
          <Linha rotulo="API" valor={API_URL} />
        </Cartao>

        <View style={{ marginTop: espaco.xl }}>
          <Botao titulo="Sair da conta" aoTocar={sair} variante="perigo" />
        </View>
      </ScrollView>
    </View>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={e.linha}>
      <Text style={e.linhaRotulo}>{rotulo}</Text>
      <Text style={e.linhaValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  perfil: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  nome: { fontSize: 16, fontWeight: "700", color: cores.texto },
  email: { fontSize: 12, color: cores.textoSuave, marginTop: 2 },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginVertical: espaco.lg,
  },
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: espaco.lg,
    paddingVertical: espaco.sm,
  },
  linhaRotulo: { fontSize: 13, color: cores.textoSuave },
  linhaValor: { flex: 1, fontSize: 13, color: cores.texto, textAlign: "right" },
});
