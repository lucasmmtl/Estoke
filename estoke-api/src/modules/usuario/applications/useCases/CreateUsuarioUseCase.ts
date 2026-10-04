import { inject, injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import type { CreateUsuarioDTO } from "../schemas/UsuarioSchemas.js";
import { authConfig } from "../../../../shared/config/auth.js";

const USUARIO_DUPLICADO = "23505";

@injectable()
export class CreateUsuarioUseCase {
  constructor(
    @inject("UsuarioRepository")
    private usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(data: CreateUsuarioDTO): Promise<any> {
    try {
      const senha = await bcrypt.hash(data.senha, authConfig.custoHash);

      await this.usuarioRepository.CreateUsuario({ ...data, senha });

      return {
        message: "Usuário cadastrado com sucesso!",
      };
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        "code" in error &&
        error.code === USUARIO_DUPLICADO
      ) {
        return null;
      }

      throw new Error("Erro ao cadastrar o usuário");
    }
  }
}
