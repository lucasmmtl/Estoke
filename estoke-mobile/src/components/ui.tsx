import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cores, espaco, raio } from "../theme";

export function Cartao({
  children,
  estilo,
}: {
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}) {
  return <View style={[e.cartao, estilo]}>{children}</View>;
}

export function Secao({
  titulo,
  acao,
  aoTocarAcao,
  children,
}: {
  titulo: string;
  acao?: string;
  aoTocarAcao?: () => void;
  children: ReactNode;
}) {
  return (
    <View style={e.secao}>
      <View style={e.secaoTopo}>
        <Text style={e.secaoTitulo}>{titulo}</Text>
        {acao ? (
          <Pressable onPress={aoTocarAcao} hitSlop={8}>
            <Text style={e.secaoAcao}>{acao}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function Botao({
  titulo,
  aoTocar,
  variante = "primaria",
  carregando,
  desabilitado,
}: {
  titulo: string;
  aoTocar: () => void;
  variante?: "primaria" | "contorno" | "perigo";
  carregando?: boolean;
  desabilitado?: boolean;
}) {
  const inativo = carregando || desabilitado;

  return (
    <Pressable
      onPress={aoTocar}
      disabled={inativo}
      style={({ pressed }) => [
        e.botao,
        variante === "primaria" && e.botaoPrimaria,
        variante === "contorno" && e.botaoContorno,
        variante === "perigo" && e.botaoPerigo,
        (pressed || inativo) && e.botaoApagado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator
          color={variante === "contorno" ? cores.primaria : "#FFF"}
        />
      ) : (
        <Text
          style={[
            e.botaoTexto,
            variante === "contorno" && { color: cores.primaria },
            variante === "perigo" && { color: "#FFF" },
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

export function Campo({
  rotulo,
  erro,
  ...props
}: TextInputProps & { rotulo: string; erro?: string }) {
  return (
    <View style={e.campo}>
      <Text style={e.campoRotulo}>{rotulo}</Text>
      <TextInput
        style={[e.campoEntrada, !!erro && e.campoEntradaErro]}
        placeholderTextColor={cores.textoSuave}
        {...props}
      />
      {erro ? <Text style={e.campoErro}>{erro}</Text> : null}
    </View>
  );
}

export function Vazio({ icone, texto }: { icone: string; texto: string }) {
  return (
    <View style={e.vazio}>
      <Ionicons name={icone as never} size={28} color={cores.textoSuave} />
      <Text style={e.vazioTexto}>{texto}</Text>
    </View>
  );
}

export function Etiqueta({
  texto,
  cor,
  fundo,
}: {
  texto: string;
  cor: string;
  fundo: string;
}) {
  return (
    <View style={[e.etiqueta, { backgroundColor: fundo }]}>
      <Text style={[e.etiquetaTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

export function Carregando() {
  return (
    <View style={e.carregando}>
      <ActivityIndicator color={cores.primaria} />
    </View>
  );
}

const e = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    padding: espaco.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  secao: { marginTop: espaco.xl },
  secaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espaco.md,
  },
  secaoTitulo: { fontSize: 17, fontWeight: "700", color: cores.texto },
  secaoAcao: { fontSize: 13, fontWeight: "600", color: cores.primaria },
  botao: {
    height: 50,
    borderRadius: raio.md,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoPrimaria: { backgroundColor: cores.primaria },
  botaoContorno: {
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  botaoPerigo: { backgroundColor: cores.vermelho },
  botaoApagado: { opacity: 0.6 },
  botaoTexto: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  campo: { marginBottom: espaco.lg },
  campoRotulo: {
    fontSize: 12,
    fontWeight: "700",
    color: cores.textoSuave,
    marginBottom: espaco.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  campoEntrada: {
    height: 50,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    paddingHorizontal: espaco.lg,
    fontSize: 15,
    color: cores.texto,
  },
  campoEntradaErro: { borderColor: cores.vermelho },
  campoErro: { marginTop: espaco.xs, fontSize: 12, color: cores.vermelho },
  vazio: { alignItems: "center", paddingVertical: espaco.xl, gap: espaco.sm },
  vazioTexto: { fontSize: 13, color: cores.textoSuave, textAlign: "center" },
  etiqueta: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  etiquetaTexto: { fontSize: 11, fontWeight: "700" },
  carregando: { paddingVertical: espaco.xl * 2, alignItems: "center" },
});

export function Topo({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: ReactNode;
}) {
  const alturaTopo = useSafeAreaInsets().top;

  return (
    <View style={[t.topo, { paddingTop: alturaTopo + espaco.md }]}>
      <View style={{ flex: 1 }}>
        <Text style={t.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={t.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {acao}
    </View>
  );
}

export function BotaoTopo({
  icone,
  aoTocar,
}: {
  icone: string;
  aoTocar: () => void;
}) {
  return (
    <Pressable onPress={aoTocar} style={t.botao} hitSlop={8}>
      <Ionicons name={icone as never} size={20} color="#FFF" />
    </Pressable>
  );
}

const t = StyleSheet.create({
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    backgroundColor: cores.topo,
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.lg,
  },
  titulo: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  subtitulo: { color: cores.topoSuave, fontSize: 12, marginTop: 2 },
  botao: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
});
