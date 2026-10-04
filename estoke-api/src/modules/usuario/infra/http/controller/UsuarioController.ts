import type { Request, Response } from "express";
import {
  LoginSchema,
  PostUsuarioSchema,
} from "../../../applications/schemas/UsuarioSchemas.js";
import { container } from "tsyringe";
import { CreateUsuarioUseCase } from "../../../applications/useCases/CreateUsuarioUseCase.js";
import { LoginUseCase } from "../../../applications/useCases/LoginUseCase.js";
import { GetPerfilUseCase } from "../../../applications/useCases/GetPerfilUseCase.js";
import { usuarioAutenticado } from "../../../../../shared/middlewares/autenticacao.js";

export class UsuarioController {
  async usuarioCadastro(req: Request, res: Response): Promise<Response> {
    const { nome, usuario, email, senha } = PostUsuarioSchema.parse(req.body);

    const createUsuarioUseCase = container.resolve(CreateUsuarioUseCase);

    const criadoPor = req.usuario?.id ?? null;

    const data = await createUsuarioUseCase.execute({
      nome,
      usuario,
      email,
      senha,
      criadoPor,
    });

    if (!data) {
      return res
        .status(409)
        .json({ message: "E-mail ou usuário já cadastrado!" });
    }

    return res.status(201).json(data);
  }

  async usuarioLogin(req: Request, res: Response): Promise<Response> {
    const { email, senha } = LoginSchema.parse(req.body);

    const loginUseCase = container.resolve(LoginUseCase);

    const data = await loginUseCase.execute({ email, senha });

    if (!data) {
      return res.status(401).json({ message: "E-mail ou senha inválidos!" });
    }

    return res.json(data);
  }

  async usuarioPerfil(req: Request, res: Response): Promise<Response> {
    const idUsuario = usuarioAutenticado(req);

    const getPerfilUseCase = container.resolve(GetPerfilUseCase);

    const data = await getPerfilUseCase.execute(idUsuario);

    if (!data) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    return res.json(data);
  }
}
