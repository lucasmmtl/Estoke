import { inject, injectable } from "tsyringe";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";

@injectable()
export class GetPerfilUseCase {
  constructor(
    @inject("UsuarioRepository")
    private usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(idUsuario: number): Promise<any> {
    const usuario = await this.usuarioRepository.GetUsuarioPorId(idUsuario);

    return usuario ?? null;
  }
}
