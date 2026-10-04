import { container } from "tsyringe";
import { EstoqueRepository } from "../../modules/estoque/infra/postgre/EstoqueRepository.js";
import { NotaFiscalRepository } from "../../modules/notaFiscal/infra/postgre/NotaFiscalRepository.js";
import { UsuarioRepository } from "../../modules/usuario/infra/postgre/UsuarioRepository.js";

container.registerSingleton("EstoqueRepository", EstoqueRepository);
container.registerSingleton("NotaFiscalRepository", NotaFiscalRepository);
container.registerSingleton("UsuarioRepository", UsuarioRepository);
