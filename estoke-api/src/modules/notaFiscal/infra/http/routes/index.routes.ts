import { Router } from "express";
import { NotaFiscalController } from "../controller/NotaFiscalController.js";
import { autenticacao } from "../../../../../shared/middlewares/autenticacao.js";

const notaFiscalRoutes: Router = Router();
const baseRoute = "notas-fiscais";

const notaFiscalController = new NotaFiscalController();

notaFiscalRoutes.use(`/${baseRoute}`, autenticacao);

notaFiscalRoutes.get(`/${baseRoute}/`, notaFiscalController.notaFiscalListagem);
notaFiscalRoutes.get(
  `/${baseRoute}/:idNotaFiscal/log`,
  notaFiscalController.notaFiscalHistorico,
);
notaFiscalRoutes.post(`/${baseRoute}/`, notaFiscalController.notaFiscalCadastro);
notaFiscalRoutes.put(
  `/${baseRoute}/:idNotaFiscal`,
  notaFiscalController.notaFiscalEdicao,
);
notaFiscalRoutes.delete(
  `/${baseRoute}/:idNotaFiscal`,
  notaFiscalController.notaFiscalExclusao,
);

export default notaFiscalRoutes;
