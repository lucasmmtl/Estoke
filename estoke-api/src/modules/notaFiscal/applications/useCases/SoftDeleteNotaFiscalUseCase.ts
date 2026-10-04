import { inject, injectable } from "tsyringe";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";
import type { SoftDeleteNotaFiscalDTO } from "../schemas/NotaFiscalSchemas.js";

@injectable()
export class SoftDeleteNotaFiscalUseCase {
  constructor(
    @inject("NotaFiscalRepository")
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  async execute(data: SoftDeleteNotaFiscalDTO): Promise<any> {
    try {
      const excluida =
        await this.notaFiscalRepository.SoftDeleteNotaFiscal(data);

      if (!excluida) {
        return {
          message: "Nota fiscal não encontrada!",
        };
      }

      return {
        message: "Nota fiscal excluída com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao excluir a nota fiscal");
    }
  }
}
