import { container } from "tsyringe";
import { EstoqueRepository } from "../../modules/estoque/infra/postgre/EstoqueRepository.js";


container.registerSingleton("EstoqueRepository", EstoqueRepository)