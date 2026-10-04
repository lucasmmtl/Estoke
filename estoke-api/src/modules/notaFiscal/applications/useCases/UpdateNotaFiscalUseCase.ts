import { inject, injectable } from "tsyringe";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";
import type { PutNotaFiscalDTO } from "../schemas/NotaFiscalSchemas.js";

@injectable()
export class UpdateNotaFiscalUseCase {
  constructor(
    @inject("NotaFiscalRepository")
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  async execute(data: PutNotaFiscalDTO): Promise<any> {
    try {
      const editada = await this.notaFiscalRepository.EditNotaFiscal(data);

      if (!editada) {
        return {
          message: "Nota fiscal não encontrada!",
        };
      }

      return {
        message: "Edição da nota fiscal realizada com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao editar a nota fiscal");
    }
  }
}
