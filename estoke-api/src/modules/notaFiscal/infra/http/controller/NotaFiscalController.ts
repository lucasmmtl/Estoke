import type { Request, Response } from "express";
import {
  GetNotaFiscalSchema,
  IdNotaFiscalSchema,
  PostNotaFiscalSchema,
  PutNotaFiscalSchema,
  SoftDeleteNotaFiscalSchema,
} from "../../../applications/schemas/NotaFiscalSchemas.js";
import { container } from "tsyringe";
import { usuarioAutenticado } from "../../../../../shared/middlewares/autenticacao.js";
import { CreateNotaFiscalUseCase } from "../../../applications/useCases/CreateNotaFiscalUseCase.js";
import { GetNotaFiscalUseCase } from "../../../applications/useCases/GetNotaFiscalUseCase.js";
import { GetNotaFiscalLogUseCase } from "../../../applications/useCases/GetNotaFiscalLogUseCase.js";
import { UpdateNotaFiscalUseCase } from "../../../applications/useCases/UpdateNotaFiscalUseCase.js";
import { SoftDeleteNotaFiscalUseCase } from "../../../applications/useCases/SoftDeleteNotaFiscalUseCase.js";

export class NotaFiscalController {
  async notaFiscalCadastro(req: Request, res: Response): Promise<Response> {
    const { numero, serie, tipo, fornecedor, cnpj, valorTotal, dataEmissao } =
      PostNotaFiscalSchema.parse(req.body);

    const createNotaFiscalUseCase = container.resolve(CreateNotaFiscalUseCase);

    const criadoPor = usuarioAutenticado(req);

    const data = await createNotaFiscalUseCase.execute({
      numero,
      serie,
      tipo,
      fornecedor,
      cnpj,
      valorTotal,
      dataEmissao,
      criadoPor,
    });

    return res.json(data);
  }

  async notaFiscalListagem(req: Request, res: Response): Promise<Response> {
    const { tipo } = GetNotaFiscalSchema.parse(req.query);

    const getNotaFiscalUseCase = container.resolve(GetNotaFiscalUseCase);

    const data = await getNotaFiscalUseCase.execute({ tipo });

    return res.json(data);
  }

  async notaFiscalHistorico(req: Request, res: Response): Promise<Response> {
    const { idNotaFiscal } = IdNotaFiscalSchema.parse(req.params);

    const getNotaFiscalLogUseCase = container.resolve(GetNotaFiscalLogUseCase);

    const data = await getNotaFiscalLogUseCase.execute(idNotaFiscal);

    return res.json(data);
  }

  async notaFiscalEdicao(req: Request, res: Response): Promise<Response> {
    const { idNotaFiscal, numero, serie, tipo, fornecedor, cnpj, valorTotal, dataEmissao } =
      PutNotaFiscalSchema.parse({ ...req.body, ...req.params });

    const updateNotaFiscalUseCase = container.resolve(UpdateNotaFiscalUseCase);

    const modificadoPor = usuarioAutenticado(req);

    const data = await updateNotaFiscalUseCase.execute({
      idNotaFiscal,
      numero,
      serie,
      tipo,
      fornecedor,
      cnpj,
      valorTotal,
      dataEmissao,
      modificadoPor,
    });

    return res.json(data);
  }

  async notaFiscalExclusao(req: Request, res: Response): Promise<Response> {
    const { idNotaFiscal } = SoftDeleteNotaFiscalSchema.parse(req.params);

    const softDeleteNotaFiscalUseCase = container.resolve(
      SoftDeleteNotaFiscalUseCase,
    );

    const modificadoPor = usuarioAutenticado(req);

    const data = await softDeleteNotaFiscalUseCase.execute({
      idNotaFiscal,
      modificadoPor,
    });

    return res.json(data);
  }
}
