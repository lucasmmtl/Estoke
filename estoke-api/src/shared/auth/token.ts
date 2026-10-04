import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.js";

export function gerarToken(idUsuario: number): string {
  return jwt.sign({}, authConfig.jwt.segredo, {
    subject: String(idUsuario),
    expiresIn: authConfig.jwt.expiracao,
  });
}

export function validarToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, authConfig.jwt.segredo);

    if (typeof payload === "string" || !payload.sub) return null;

    const idUsuario = Number(payload.sub);

    return Number.isInteger(idUsuario) ? idUsuario : null;
  } catch {
    return null;
  }
}
