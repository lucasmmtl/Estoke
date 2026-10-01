import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import type { PutEstoqueDTO } from "../schemas/EstoqueSchemas.js";

@injectable()
export class UpdateEstoqueUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(data: PutEstoqueDTO): Promise<any> {
    try {
      await this.estoqueRepository.EditEstoque(data);

      return {
        message: "Edição do estoque realizada com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao editar o estoque");
    }
  }
}
