import type { CreateUsuarioDTO } from "../../applications/schemas/UsuarioSchemas.js";

export type UsuarioAutenticacao = {
  id: number;
  senha: string;
};

export type UsuarioPublico = {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  criado_em: Date;
};

export interface IUsuarioRepository {
  CreateUsuario(params: CreateUsuarioDTO): Promise<void>;
  GetUsuarioPorEmail(email: string): Promise<UsuarioAutenticacao | undefined>;
  GetUsuarioPorId(idUsuario: number): Promise<UsuarioPublico | undefined>;
}
