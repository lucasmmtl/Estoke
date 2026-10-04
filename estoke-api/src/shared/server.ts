import "reflect-metadata";
import "dotenv/config";
import "./container/index.js";
import app from "./app.js";

const port = process.env.SERVER_PORT

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
});
