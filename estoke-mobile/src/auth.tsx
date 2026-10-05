import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type Perfil } from "./api";
import { lerToken, limparToken, salvarToken } from "./storage";

type Auth = {
  perfil: Perfil | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const Contexto = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await lerToken();

      if (token) {
        try {
          setPerfil(await api.perfil());
        } catch {
          await limparToken();
        }
      }

      setCarregando(false);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { token } = await api.login(email, senha);
    await salvarToken(token);
    setPerfil(await api.perfil());
  }, []);

  const sair = useCallback(async () => {
    await limparToken();
    setPerfil(null);
  }, []);

  return (
    <Contexto.Provider value={{ perfil, carregando, entrar, sair }}>
      {children}
    </Contexto.Provider>
  );
}

export function useAuth(): Auth {
  const contexto = useContext(Contexto);

  if (!contexto) throw new Error("useAuth precisa estar dentro do AuthProvider.");

  return contexto;
}
