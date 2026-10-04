import type { CreateUsuarioDTO } from "../../applications/schemas/UsuarioSchemas.js";
import type {
  IUsuarioRepository,
  UsuarioAutenticacao,
  UsuarioPublico,
} from "../../domain/repositories/IUsuarioRepository.js";
import { postgres } from "../../../../shared/postgre/connection.js";

export class UsuarioRepository implements IUsuarioRepository {
  async CreateUsuario(params: CreateUsuarioDTO): Promise<void> {
    const sql = `INSERT INTO USUARIOS (
            NOME,
            USUARIO,
            EMAIL,
            SENHA,
            CRIADO_POR,
            CRIADO_EM
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`;

    await postgres.query(sql, [
      params.nome,
      params.usuario,
      params.email,
      params.senha,
      params.criadoPor ?? null,
    ]);
  }

  async GetUsuarioPorEmail(
    email: string,
  ): Promise<UsuarioAutenticacao | undefined> {
    const sql = `SELECT ID, SENHA FROM USUARIOS WHERE EMAIL = $1`;

    const resultado = await postgres.query<UsuarioAutenticacao>(sql, [email]);

    return resultado.rows[0];
  }

  async GetUsuarioPorId(
    idUsuario: number,
  ): Promise<UsuarioPublico | undefined> {
    const sql = `SELECT
                    ID,
                    NOME,
                    USUARIO,
                    EMAIL,
                    CRIADO_EM
                  FROM USUARIOS
                  WHERE ID = $1`;

    const resultado = await postgres.query<UsuarioPublico>(sql, [idUsuario]);

    return resultado.rows[0];
  }
}
