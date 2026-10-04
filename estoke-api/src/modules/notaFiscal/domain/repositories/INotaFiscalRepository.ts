import type {
  CreateNotaFiscalDTO,
  GetNotaFiscalDTO,
  PutNotaFiscalDTO,
  SoftDeleteNotaFiscalDTO,
} from "../../applications/schemas/NotaFiscalSchemas.js";

export interface INotaFiscalRepository {
  CreateNotaFiscal(params: CreateNotaFiscalDTO): Promise<void>;
  GetNotaFiscal(params: GetNotaFiscalDTO): Promise<any>;
  GetNotaFiscalLog(idNotaFiscal: number): Promise<any>;
  EditNotaFiscal(params: PutNotaFiscalDTO): Promise<boolean>;
  SoftDeleteNotaFiscal(params: SoftDeleteNotaFiscalDTO): Promise<boolean>;
}
