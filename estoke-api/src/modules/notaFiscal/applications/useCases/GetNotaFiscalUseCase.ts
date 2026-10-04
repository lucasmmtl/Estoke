import { inject, injectable } from "tsyringe";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";
import type { GetNotaFiscalDTO } from "../schemas/NotaFiscalSchemas.js";

@injectable()
export class GetNotaFiscalUseCase {
  constructor(
    @inject("NotaFiscalRepository")
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  async execute(filtros: GetNotaFiscalDTO): Promise<any> {
    const notasFiscais =
      await this.notaFiscalRepository.GetNotaFiscal(filtros);

    return notasFiscais;
  }
}
