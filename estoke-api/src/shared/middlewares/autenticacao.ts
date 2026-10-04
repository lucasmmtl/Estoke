import type { NextFunction, Request, Response } from "express";
import { validarToken } from "../auth/token.js";

function idDoToken(req: Request): number | null {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();

  if (!token) return null;

  return validarToken(token);
}

export function autenticacao(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const idUsuario = idDoToken(req);

  if (!idUsuario) {
    res.status(401).json({ message: "Token ausente ou inválido!" });
    return;
  }

  req.usuario = { id: idUsuario };

  next();
}

export function autenticacaoOpcional(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const idUsuario = idDoToken(req);

  if (idUsuario) {
    req.usuario = { id: idUsuario };
  }

  next();
}

export function usuarioAutenticado(req: Request): number {
  if (!req.usuario) {
    throw new Error("Rota protegida sem o middleware de autenticação.");
  }

  return req.usuario.id;
}
