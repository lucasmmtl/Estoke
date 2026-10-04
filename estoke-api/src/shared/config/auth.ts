import type { SignOptions } from "jsonwebtoken";

export type AuthConfig = {
  jwt: {
    segredo: string;
    expiracao: NonNullable<SignOptions["expiresIn"]>;
  };
  custoHash: number;
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("Defina JWT_SECRET no .env.");
}

if (secret.length < 16) {
  throw new Error("JWT_SECRET precisa ter pelo menos 16 caracteres.");
}

export const authConfig: AuthConfig = {
  jwt: {
    segredo: secret,
    expiracao: (process.env.JWT_EXPIRES_IN ??
      "1d") as AuthConfig["jwt"]["expiracao"],
  },
  custoHash: 10,
};
