import { Pool } from "pg";

const host = process.env.SUPABASE_DB_HOST;
const database = process.env.SUPABASE_DB_NAME;
const user = process.env.SUPABASE_DB_USER;
const password = process.env.SUPABASE_DB_PASSWORD;
const port = Number(process.env.SUPABASE_DB_PORT ?? "5432");

if (!host || !database || !user || !password) {
  throw new Error(
    "Defina SUPABASE_DB_HOST, SUPABASE_DB_NAME, SUPABASE_DB_USER e SUPABASE_DB_PASSWORD no .env.",
  );
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    "SUPABASE_DB_PORT precisa ser uma porta válida entre 1 e 65535.",
  );
}

if (host.endsWith(".pooler.supabase.com") && !user.includes(".")) {
  throw new Error(
    "Para o pooler compartilhado do Supabase, SUPABASE_DB_USER deve incluir o project ref (por exemplo: postgres.<project-ref>).",
  );
}

export const postgres = new Pool({
  host,
  port,
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false },
});

postgres.on("error", (error) => {
  console.error("Erro inesperado no pool do PostgreSQL:", error);
});
