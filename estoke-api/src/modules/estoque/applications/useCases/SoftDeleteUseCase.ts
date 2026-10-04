import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import type { SoftDeleteEstoqueDTO } from "../schemas/EstoqueSchemas.js";

@injectable()
export class SoftDeleteUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(data: SoftDeleteEstoqueDTO): Promise<any> {
    try {
      const excluido = await this.estoqueRepository.SoftDeleteEstoque(data);

      if (!excluido) {
        return {
          message: "Produto não encontrado no estoque!",
        };
      }

      return {
        message: "Produto excluido do estoque com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao excluir produto do estoque");
    }
  }
}
