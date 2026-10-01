import { inject, injectable } from "tsyringe";
import type { IEstoqueRepository } from "../../domain/repositories/IEstoqueRepository.js";
import type { CreateEstoqueDTO } from "../schemas/EstoqueSchemas.js";

@injectable()
export class CreateEstoqueEntradaUseCase {
  constructor(
    @inject("EstoqueRepository")
    private estoqueRepository: IEstoqueRepository,
  ) {}

  async execute(data: CreateEstoqueDTO): Promise<any> {
    try {
      await this.estoqueRepository.CreateEstoqueEntrada(data);

      return {
        message: "Entrada no estoque criada com sucesso!",
      };
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao criar entrada no estoque");
    }
  }
}
