import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/auth";
import { Carregando } from "../src/components/ui";
import { cores } from "../src/theme";

function Rotas() {
  const { perfil, carregando } = useAuth();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    const naLogin = segmentos[0] === "login";

    if (!perfil && !naLogin) router.replace("/login");
    if (perfil && naLogin) router.replace("/");
  }, [perfil, carregando, segmentos, router]);

  if (carregando) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo }}>
        <Carregando />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="produto"
        options={{
          headerShown: true,
          presentation: "modal",
          title: "Produto",
          headerTintColor: cores.texto,
        }}
      />
      <Stack.Screen
        name="nota"
        options={{
          headerShown: true,
          presentation: "modal",
          title: "Nota fiscal",
          headerTintColor: cores.texto,
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Rotas />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
