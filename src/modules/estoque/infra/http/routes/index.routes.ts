import { Router } from "express";
import { EstoqueController } from "../controller/EstoqueController.js";

const estoqueRoutes: Router = Router();
const baseRoute = "estoque";

const estoqueController = new EstoqueController();

estoqueRoutes.get(`/${baseRoute}/`, estoqueController.estoqueListagem);
estoqueRoutes.post(`/${baseRoute}/`, estoqueController.estoqueEntrada);
estoqueRoutes.put(`/${baseRoute}/`, estoqueController.estoqueExclusao);
estoqueRoutes.put(`/${baseRoute}/`, estoqueController.estoqueEdicao);

export default estoqueRoutes;
