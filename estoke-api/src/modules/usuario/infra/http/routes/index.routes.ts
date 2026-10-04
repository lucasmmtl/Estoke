import { Router } from "express";
import { UsuarioController } from "../controller/UsuarioController.js";
import {
  autenticacao,
  autenticacaoOpcional,
} from "../../../../../shared/middlewares/autenticacao.js";

const usuarioRoutes: Router = Router();
const baseRoute = "usuarios";

const usuarioController = new UsuarioController();

usuarioRoutes.post(
  `/${baseRoute}/`,
  autenticacaoOpcional,
  usuarioController.usuarioCadastro,
);
usuarioRoutes.post(`/${baseRoute}/login`, usuarioController.usuarioLogin);
usuarioRoutes.get(
  `/${baseRoute}/perfil`,
  autenticacao,
  usuarioController.usuarioPerfil,
);

export default usuarioRoutes;
