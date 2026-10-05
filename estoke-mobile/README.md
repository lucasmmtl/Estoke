# Estokê Mobile

App React Native (Expo) do Estokê. Consome a API em `../estoke-api`.

## Rodando

```bash
npm install
npm start
```

Depois leia o QR Code com o app Expo Go, ou use `npm run android` / `npm run ios` / `npm run web`.

## Apontando para a API

O endereço fica em `.env` (copie de `.env.example`):

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

`localhost` só funciona no emulador e no `npm run web`. **Em celular
físico, troque pelo IP da sua máquina na rede** (ex.: `http://192.168.0.12:8080`)
e rode a API com esse IP acessível. Para descobrir o IP: `ipconfig` no Windows.

## Estrutura

```
app/                 rotas (expo-router)
  _layout.tsx        provider de auth + redireciona para /login sem token
  login.tsx          entrar e criar conta
  (tabs)/            Início, Estoque, Notas, Mais
  produto.tsx        formulário de produto (novo e edição)
  nota.tsx           formulário de nota fiscal
src/
  api.ts             chamadas HTTP e tipos
  auth.tsx           contexto de autenticação
  storage.ts         token no SecureStore (localStorage no web)
  useDados.ts        carrega estoque + notas e deriva os números do início
  theme.ts           cores, espaçamentos e o limite de estoque baixo
  format.ts          moeda, datas e saudação
  components/ui.tsx  Cartao, Secao, Botao, Campo, Topo, Etiqueta, Vazio
```

O token vai em `Authorization: Bearer` em toda chamada e fica guardado no
SecureStore. Sem token válido, o app volta para o login.

O que o início mostra é calculado do que a API devolve: total de produtos,
valor somado (`quantidade x valor`), itens com quantidade até
`LIMITE_ESTOQUE_BAIXO` (em `src/theme.ts`), contagem de notas por tipo e as
últimas movimentações por `criado_em`.
