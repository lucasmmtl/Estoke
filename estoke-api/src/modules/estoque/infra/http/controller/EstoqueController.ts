import type { Request, Response } from "express";
import {
  IdEstoqueSchema,
  PostEstoqueSchema,
  PutEstoqueSchema,
  SoftDeleteEstoqueSchema,
} from "../../../applications/schemas/EstoqueSchemas.js";
import { container } from "tsyringe";
import { usuarioAutenticado } from "../../../../../shared/middlewares/autenticacao.js";
import { CreateEstoqueEntradaUseCase } from "../../../applications/useCases/CreateEstoqueEntradaUseCase.js";
import { GetEstoqueUseCase } from "../../../applications/useCases/GetEstoqueUseCase.js";
import { GetEstoqueLogUseCase } from "../../../applications/useCases/GetEstoqueLogUseCase.js";
import { SoftDeleteUseCase } from "../../../applications/useCases/SoftDeleteUseCase.js";
import { UpdateEstoqueUseCase } from "../../../applications/useCases/UpdateEstoqueUseCase.js";

export class EstoqueController {
  async estoqueEntrada(req: Request, res: Response): Promise<Response> {
    const { descricao, quantidade, valorProduto } = PostEstoqueSchema.parse(
      req.body,
    );

    const createEstoqueEntradaUseCase = container.resolve(
      CreateEstoqueEntradaUseCase,
    );

    const criadoPor = usuarioAutenticado(req);

    const data = await createEstoqueEntradaUseCase.execute({
      descricao,
      quantidade,
      valorProduto,
      criadoPor,
    });

    return res.json(data);
  }

  async estoqueListagem(req: Request, res: Response): Promise<Response> {
    const getEstoqueUseCase = container.resolve(GetEstoqueUseCase);

    const data = await getEstoqueUseCase.execute();

    return res.json(data);
  }

  async estoqueHistorico(req: Request, res: Response): Promise<Response> {
    const { idProduto } = IdEstoqueSchema.parse(req.params);

    const getEstoqueLogUseCase = container.resolve(GetEstoqueLogUseCase);

    const data = await getEstoqueLogUseCase.execute(idProduto);

    return res.json(data);
  }

  async estoqueExclusao(req: Request, res: Response): Promise<Response> {
    const { idProduto } = SoftDeleteEstoqueSchema.parse(req.params);

    const softDeleteUseCase = container.resolve(SoftDeleteUseCase);

    const modificadoPor = usuarioAutenticado(req);

    const data = await softDeleteUseCase.execute({
      idProduto,
      modificadoPor,
    });

    return res.json(data);
  }

  async estoqueEdicao(req: Request, res: Response): Promise<Response> {
    const { idProduto, descricao, quantidade, valorProduto } =
      PutEstoqueSchema.parse({ ...req.body, ...req.params });

    const updateEstoqueUseCase = container.resolve(UpdateEstoqueUseCase);

    const modificadoPor = usuarioAutenticado(req);

    const data = await updateEstoqueUseCase.execute({
      idProduto,
      descricao,
      quantidade,
      valorProduto,
      modificadoPor,
    });

    return res.json(data);
  }
}
