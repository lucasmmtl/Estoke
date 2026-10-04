import express, {
    type Express,
    type NextFunction,
    type Request,
    type Response,
    type Router,
} from "express";
import { ZodError } from "zod";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const app: Express = express();
app.use(express.json());

async function findRouteFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });

    const nested = await Promise.all(entries.map(async (entry) => {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) return findRouteFiles(fullPath);
        return /^index\.routes\.(?:ts|js)$/.test(entry.name) ? [fullPath] : [];
    }));
    
    return nested.flat();
}

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = join(currentDirectory, "..");
const routeFiles = await findRouteFiles(sourceDirectory);

for (const routeFile of routeFiles) {

    const routeModule: { default?: Router } = await import(pathToFileURL(routeFile).href);
    
    if (!routeModule.default) {
        throw new Error(`O arquivo de rotas ${routeFile} precisa exportar um Router como default.`);
    }
    app.use(routeModule.default);
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Dados inválidos!",
            erros: error.issues.map((problema) => ({
                campo: problema.path.join("."),
                message: problema.message,
            })),
        });
    }

    console.error(error);

    return res.status(500).json({ message: "Erro interno no servidor." });
});

export default app;
