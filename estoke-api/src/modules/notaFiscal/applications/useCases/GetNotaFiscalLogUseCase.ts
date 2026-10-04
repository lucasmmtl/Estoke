import { inject, injectable } from "tsyringe";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";

@injectable()
export class GetNotaFiscalLogUseCase {
  constructor(
    @inject("NotaFiscalRepository")
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  async execute(idNotaFiscal: number): Promise<any> {
    const log =
      await this.notaFiscalRepository.GetNotaFiscalLog(idNotaFiscal);

    return log;
  }
}
