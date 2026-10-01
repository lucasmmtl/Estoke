import type { Request, Response } from "express";
import {
  PostEstoqueSchema,
  PutEstoqueSchema,
  SoftDeleteEstoqueSchema,
} from "../../../applications/schemas/EstoqueSchemas.js";
import { container } from "tsyringe";
import { CreateEstoqueEntradaUseCase } from "../../../applications/useCases/CreateEstoqueEntradaUseCase.js";
import { GetEstoqueUseCase } from "../../../applications/useCases/GetEstoqueUseCase.js";
import { SoftDeleteUseCase } from "../../../applications/useCases/SoftDeleteUseCase.js";
import { UpdateEstoqueUseCase } from "../../../applications/useCases/UpdateEstoqueUseCase.js";

export class EstoqueController {
  async estoqueEntrada(req: Request, res: Response): Promise<Response> {
    const { descricao, quantidade, valorProduto } = PostEstoqueSchema.parse(
      req.body,
    );

    //o código do usuário que criou a requisição vai ser pega direta do backend, ainda será implementado...

    const createEstoqueEntradaUseCase = container.resolve(
      CreateEstoqueEntradaUseCase,
    );

    const criadoPor = 1;

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

  async estoqueExclusao(req: Request, res: Response): Promise<Response> {
    const { idProduto } = SoftDeleteEstoqueSchema.parse(req.params);

    const softDeleteUseCase = container.resolve(SoftDeleteUseCase);

    const data = await softDeleteUseCase.execute({
      idProduto,
    });

    return res.json(data);
  }

  async estoqueEdicao(req: Request, res: Response): Promise<Response> {
    const { descricao, quantidade, valorProduto, idProduto } =
      PutEstoqueSchema.parse(req.body);

    const updateEstoqueUseCase = container.resolve(UpdateEstoqueUseCase);

    const data = await updateEstoqueUseCase.execute({
      descricao,
      quantidade,
      valorProduto,
      idProduto,
    });

    return res.json(data);
  }
}
