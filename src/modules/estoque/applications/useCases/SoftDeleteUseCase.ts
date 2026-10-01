import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import type { SoftDeleteEstoqueDTO } from "../schemas/EstoqueSchemas.js";

@injectable()
export class SoftDeleteUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(idProduto: SoftDeleteEstoqueDTO): Promise<any> {
    try {
      await this.estoqueRepository.SoftDeleteEstoque(idProduto);

      return {
        message: "Produto excluido do estoque com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao excluir produto do estoque");
    }
  }
}
