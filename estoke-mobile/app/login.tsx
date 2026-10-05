import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../src/auth";
import { api } from "../src/api";
import { Botao, Campo } from "../src/components/ui";
import { cores, espaco, raio } from "../src/theme";

export default function Login() {
  const { entrar } = useAuth();
  const [criandoConta, setCriandoConta] = useState(false);
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro(null);
    setEnviando(true);

    try {
      if (criandoConta) {
        await api.cadastrar({ nome, usuario, email, senha });
      }
      await entrar(email, senha);
    } catch (problema) {
      setErro((problema as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const podeEnviar = criandoConta
    ? nome && usuario && email && senha
    : email && senha;

  return (
    <KeyboardAvoidingView
      style={e.tela}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
        <View style={e.marca}>
          <View style={e.logo}>
            <MaterialCommunityIcons name="package-variant" size={26} color="#FFF" />
          </View>
          <Text style={e.titulo}>Estokê</Text>
          <Text style={e.subtitulo}>
            {criandoConta
              ? "Crie sua conta para começar"
              : "Entre para controlar seu estoque"}
          </Text>
        </View>

        <View style={e.formulario}>
          {criandoConta ? (
            <>
              <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
                autoCapitalize="words"
              />
              <Campo
                rotulo="Usuário"
                value={usuario}
                onChangeText={setUsuario}
                placeholder="como quer ser chamado"
                autoCapitalize="none"
              />
            </>
          ) : null}

          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@empresa.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Campo
            rotulo="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="mínimo 8 caracteres"
            secureTextEntry
          />

          {erro ? <Text style={e.erro}>{erro}</Text> : null}

          <Botao
            titulo={criandoConta ? "Criar conta e entrar" : "Entrar"}
            aoTocar={enviar}
            carregando={enviando}
            desabilitado={!podeEnviar}
          />

          <Pressable
            onPress={() => {
              setCriandoConta(!criandoConta);
              setErro(null);
            }}
            style={e.alternar}
          >
            <Text style={e.alternarTexto}>
              {criandoConta
                ? "Já tenho conta. Entrar"
                : "Não tenho conta. Criar agora"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.topo },
  conteudo: { flexGrow: 1, justifyContent: "center", padding: espaco.xl },
  marca: { alignItems: "center", marginBottom: espaco.xl },
  logo: {
    width: 56,
    height: 56,
    borderRadius: raio.lg,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.md,
  },
  titulo: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  subtitulo: { fontSize: 13, color: cores.topoSuave, marginTop: espaco.xs },
  formulario: {
    backgroundColor: cores.fundo,
    borderRadius: raio.lg,
    padding: espaco.xl,
  },
  erro: {
    fontSize: 13,
    color: cores.vermelho,
    marginBottom: espaco.md,
    textAlign: "center",
  },
  alternar: { marginTop: espaco.lg, alignItems: "center" },
  alternarTexto: { fontSize: 13, color: cores.primaria, fontWeight: "600" },
});
