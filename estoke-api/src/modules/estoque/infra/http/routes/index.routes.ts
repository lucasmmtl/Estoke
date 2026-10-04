import { Router } from "express";
import { EstoqueController } from "../controller/EstoqueController.js";
import { autenticacao } from "../../../../../shared/middlewares/autenticacao.js";

const estoqueRoutes: Router = Router();
const baseRoute = "estoque";

const estoqueController = new EstoqueController();

estoqueRoutes.use(`/${baseRoute}`, autenticacao);

estoqueRoutes.get(`/${baseRoute}/`, estoqueController.estoqueListagem);
estoqueRoutes.get(
  `/${baseRoute}/:idProduto/log`,
  estoqueController.estoqueHistorico,
);
estoqueRoutes.post(`/${baseRoute}/`, estoqueController.estoqueEntrada);
estoqueRoutes.put(`/${baseRoute}/:idProduto`, estoqueController.estoqueEdicao);
estoqueRoutes.delete(
  `/${baseRoute}/:idProduto`,
  estoqueController.estoqueExclusao,
);

export default estoqueRoutes;
