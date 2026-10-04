import { inject, injectable } from "tsyringe";
import type { INotaFiscalRepository } from "../../domain/repositories/INotaFiscalRepository.js";
import type { CreateNotaFiscalDTO } from "../schemas/NotaFiscalSchemas.js";

const NOTA_FISCAL_DUPLICADA = "23505";

@injectable()
export class CreateNotaFiscalUseCase {
  constructor(
    @inject("NotaFiscalRepository")
    private notaFiscalRepository: INotaFiscalRepository,
  ) {}

  async execute(data: CreateNotaFiscalDTO): Promise<any> {
    try {
      await this.notaFiscalRepository.CreateNotaFiscal(data);

      return {
        message: "Nota fiscal cadastrada com sucesso!",
      };
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        "code" in error &&
        error.code === NOTA_FISCAL_DUPLICADA
      ) {
        throw new Error(
          "Já existe uma nota fiscal com esse número, série e CNPJ.",
        );
      }

      throw new Error("Erro ao cadastrar a nota fiscal");
    }
  }
}
