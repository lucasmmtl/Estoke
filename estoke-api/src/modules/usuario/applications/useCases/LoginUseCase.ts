import { inject, injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import type { LoginDTO } from "../schemas/UsuarioSchemas.js";
import { gerarToken } from "../../../../shared/auth/token.js";

@injectable()
export class LoginUseCase {
  constructor(
    @inject("UsuarioRepository")
    private usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(data: LoginDTO): Promise<any> {
    const usuario = await this.usuarioRepository.GetUsuarioPorEmail(data.email);

    if (!usuario) return null;

    const senhaConfere = await bcrypt.compare(data.senha, usuario.senha);

    if (!senhaConfere) return null;

    return {
      token: gerarToken(usuario.id),
    };
  }
}
