import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";

@injectable()
export class GetEstoqueUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(): Promise<any> {
    const estoque = await this.estoqueRepository.GetEstoque();
    return estoque;
  }
}
