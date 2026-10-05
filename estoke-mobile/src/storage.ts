import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const CHAVE = "estoke_token";

export async function salvarToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(CHAVE, token);
    return;
  }
  await SecureStore.setItemAsync(CHAVE, token);
}

export async function lerToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(CHAVE);
  }
  return SecureStore.getItemAsync(CHAVE);
}

export async function limparToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(CHAVE);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE);
}
