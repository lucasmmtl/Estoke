import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";

@injectable()
export class GetEstoqueLogUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(idProduto: number): Promise<any> {
    const log = await this.estoqueRepository.GetEstoqueLog(idProduto);

    return log;
  }
}
