## Stage 1

### Tecnologias e bibliotecas usadas no servidor

- yarn / express / node / typescript / ts-node-dev / prisma / SQlite / axios / Insomnia / Socket.IO

### **Parte 1: Criando o backend**

Dentro da pasta escolhida como backend, o primeiro comando será o `yarn init -y`. Tal comando cria um **package.json** na aplicação, com as configurações iniciais: nome do projeto, versão, qual arquivo que vai ter como principal e qual o tipo de licença. Dentro do package.json, teremos essas informações e dependências que o projeto terá.

Instalando as dependências iniciais:

1. `yarn add express` (ou `npm install express`)
2. `yarn add -D @types/express typescript ts-node-dev` (como dependência de desenvolvimento, onde `ts-node-dev` é a biblioteca que vai servir para rodar a aplicação, fazendo um autoreload da aplicação e `types/express` é a dependência das tipagens do express)

Próxima etapa é a de criação da pasta `src`, com o arquivo `app.ts`. Mas antes, começar a codar, é preciso também criar as configurações do Typescript que usaremos na aplicação. Para isso, na pasta do projeto, cria-se o arquivo `tsconfig.json` através do comando `yarn tsc --init`.

A partir daí, começo a construir o `app.ts`:

```ts
import express from "express";

const app = express();

app.listen(4000, () => console.log(`🚀  Server is running on PORT 4000`));
```

Em seguida, crio um script no **package.json** para rodar a aplicação:

```json
  "scripts": {
    "dev": "ts-node-dev --exit-child src/app.ts"
  },
```

Utilizamos no scrpit `ts-node-dev` pois, por padrão, o Node não conseguiria identificar esse import se apenas escrevêssemos `node src/app.ts`.

O `--exit-child` é para que, ao utilizar a Prisma, a aplicação não fique presa e não rode qualquer alteração feita após ter ficado presa.

Rodando o servidor:

```bash
yarn dev
```

### **Parte 2: instalando o Prisma como dependência de desenvolvimento**

```bash
yarn add prisma -D
# npm install prisma --save-dev
```

Link para maiores detalhes sobre a instalação para adicionar o Prisma a um projeto existente: clique [aqui](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgres).

Vamos utilizar um banco de dados relacional, o SQLite, que é um banco em memória para não precisarmos instalar MySQL, PostgreSQL e derivamos, inicialmente. Depois, caso queira migrar para outro banco, é possível.

Em seguida, rodar o seguinte comando para invocar a própria biblioteca do Prisma, já instalada:

```bash
yarn prisma init
```

Esse comando cria a pasta prisma e um arquivo `.env`, com um **DATABASE_URL** com as configurações do banco de dados que vamos utilizar. Por padrão, vem com PostgreSQL, mas o Prisma também dá suporte a MySQL, SQLite, SQL Server e MongoDB (Preview).

Como vamos utilizar o SQLite, podemos apagar esse arquivo e observar o que tem dentro da pasta prisma, ou seja, o arquivo `schema.prisma`. Tal arquivo traz toda configuração de banco de dados/tabelas. Ele possui um datasource (com configurações do banco) e um client mostrando qual será utilizado.

Nesse arquivo, faremos a seguinte substituição:

```bash
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

O arquivo com extensão `dev.db` é o que abrigará todas as tabelas e dados dentro da mesma. Entretanto, apesar de estarmos usando o SQLite para o estudo, não é aconselhável utilizar o mesmo em produção.

### **Parte 3: Configuração do GithubOAuth**

Link para configuração: [https://github.com/settings/developers](https://github.com/settings/developers)

Toda vez que tivermos uma aplicação que precisa se comunicar com o github, precisamos criar um OAuth Apps, ou seja, a credencial para que a aplicação tenha acesso ao Github do usuário que está se logando.

Nessa página, além de informar o nome e a descrição da aplicação, precisamos informar `http://localhost:4000` como Homepage URL e `http://localhost:4000/signin/callback` como callback URL (para o Github enviar as informações do usuário para a URL dentro da nossa aplicação).

Após isso, precisamos gerar Client secrets. Com atenção para não recarregar a página antes de copiar a chave (se não ela fica oculta e tenho que gerar outra), criamos duas variáveis no `.env` criado pelo prisma:

```bash
GITHUB_CLIENT_SECRET=7b7ae0c97b91ec0600098bff714634244f6422a7
GITHUB_CLIENT_ID=e144fdb9ec2f062609c4
```

### **Parte 4: Criação de rota de login do Github**

Criada para simular o que o Front e o Mobile farão.

No app.ts, incluo esse trecho:

```ts
app.get("/github", (request, response) => {
  response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
  );
});
```

No momento que a URL for acessada, será redirecinada para conseguir fazer a autenticação do usuário no Github. Mas para conseguir usar o `process.env`, é preciso usar uma dependência para a aplicação ter acesso a tudo que tem dentro das variáveis:

```bash
yarn add dotenv
```

No app.ts, importo a dependência para ter acesso às variáveis de ambiente:

```ts
import "dotenv/config";
```

### **Parte 5: Criação de rota de callback do Github**

No app.ts, defino a rota e faço a seguinte desestruturação do código do usuário para conseguirmos criar o access token (para isso, pegamos o code de dentro do request):

```ts
app.get("/signin/callback", (request, response) => {
  const { code } = request.query;

  return response.json(code);
});
```

### **Parte 6: Criação de autenticação do usuário recebendo o código que o Github forneceu**

Dentro de `src`, crio uma pasta chamada `services`, onde teremos todos os serviços/regra de negócio da aplicação.

No arquivo `AuthenticateUserService.ts`, incluo:

```ts
class AuthenticateUserService {
  async execute(code: string) {}
}

export { AuthenticateUserService };
```

Crio também a camada de Controller, na pasta controllers > arquivo AuthenticateUserController.ts, com o seguinte trecho:

```ts
import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
  async handle(request: Request, response: Response) {
    const service = new AuthenticateUserService();
    // service.execute()
  }
}

export { AuthenticateUserController };
```

#### **Criando a regra de negócio da camada de serviço:**

No arquivo AuthenticateUserService.ts, os passos serão:

- Receber code(string);
- Recuperar o access_token no github;
- Recuperar infos do user no github;
- Verificar se o usuário existe no banco de dados;
  - se sim = gerar token para ele
  - se não = criar no DB e gerar um token
- Retornar o token com as informações do user logado.

**1. Receber code(string):**

```ts
class AuthenticateUserService {
  async execute(code: string) {}
}
```

**2. Recuperar o access_token no github:**

Para isso, precisamos da dependência `axios` para fazer uma chamada externa.

```bash
yarn add axios
yarn add @types/axios -D
```

No AuthenticateUserService, faço essa importação:

```bash
import axios from "axios";
```

Crio a URL que vamos precisar para acessar o access_token:

```ts
class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const response = await axios.post(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        Accept: "application/json",
      },
    });

    return response.data;
  }
}
```

Como resposta, os parâmetros são url; null (pois não vamos passar nenhuma informação dentro do body) e a terceira informação são alguns parâmetros para conseguir o acesso do token.

Dentro do controller:

```ts
class AuthenticateUserController {
  async handle(request: Request, response: Response) {
    const { code } = request.body;

    const service = new AuthenticateUserService();
    const result = await service.execute(code);

    return response.json(result);
  }
}
```

Dentro da pasta `src`, crio um arquivo de rotas da aplicação, como `routes.ts`, já instanciando o controller e chamando o método handle, que funciona como middleware e assim não sendo necessário passar request/response:

```ts
import { Router } from "express";
import { AuthenticateUserController } from "./controllers/AuthenticateUserController";

const router = Router();

router.post("/authenticate", new AuthenticateUserController().handle);

export { router };
```

No app.js, importo o router e incluo também a passagem das rotas através do `app.use` instead:

```ts
import { router } from "./routes";

app.use(router);
```

Para conseguir fazer a comunicação, usamos o Insomnia.

Para conseguir fazer essa integração, no Insomnia criamos um dashboard com environment Authenticate User, passando como request POST `_baseURL/authenticate` (a URL definida no arquivo `routes`), com o JSON com o código fornecido pelo Github:

```json
{
  "code": "ba531f6d829680104c46"
}
```

Em `app.ts`, incluo o trecho abaixo porque o Express não aceita somente requisições via JSON, então precisamos especificar para ele que possa receber dentro do seu body requisições com o corpo via JSON:

```json
app.use(express.json());
```

Com o código atualizado, clico em SEND no Insomnia e consigo o `access_token` para gerar o token dentro da nossa aplicação.

Para auxiliar nessa missão de criação de token, instalo a dependência `jsonwebtoken`:

```bash
yarn add jsonwebtoken
yarn add @types/jsonwebtoken -D
```

Em `AuthenticateUserService.ts`, crio uma interface passando o que eu quero que ela tenha:

```ts
interface IAccessTokenResponse {
  access_token: string;
}
```

E no axios informo o que ele terá de retorno, ou seja, o tipo `IAccessTokenResponse`. Posso também fazer uma desestruturação para ter acesso a tudo que há dentro do IAccessTokenResponse, dizendo, em `const { data: accessTokenResponse }` que a informação que tá vindo do data eu quero que seja acessada com o nome accessTokenResponse :

```ts
class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } =
      await axios.post<IAccessTokenResponse>(url, null, {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      });

    return response.data;
  }
}
```

**3. Recuperar infos do user no github:**

Para saber qual é o ID e ter outras informações do usuário que está logado na aplicação, incluo o seguinte trecho em `AuthenticateUserService.ts`, para caso o token esteja válido:

```TS
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`
        }
      })

    return response.data;
  }
```

Feito essa inclusão, devemos gerar outro código para passar para o Insomnia, para que ele retorne as informações que acabamos de buscar do usuário.

Como retornam bastante dados, podemos fazer um filtro dessas informações para apenas o que vamos precisar. Para isso, crio uma interface e passo o tipo do retorno na response:

```ts
interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

//código........

const response = await axios.get<IUserResponse>("https://api.github.com/user", {
  headers: {
    authorization: `Bearer ${accessTokenResponse.access_token}`,
  },
});
```

**4. Verificar se o usuário existe no banco de dados:**

- _se sim = gerar token para ele_
- _se não = criar no DB e gerar um token_

no schema.prisma, crio um model User, que será a tabela usuário.
Esse `id` será a PK e o default será um `uuid`:

```
model User {
  id         String @id @default(uuid())
  name       String
  github_id  Int
  avatar_url String
  login      String

  //nome que a tabela terá no banco de dados
  @@map("users")
}
```

---

_Aproveitando, as extensões Prisma e Prisma - Insider são indicadas para serem utilizadas. No settings.json, incluir_:

```json
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
```

---

Agora, paro a execução do servidor e rodo o seguinte comando para criação das migrations:

```bash
yarn prisma migrate dev
```

Esse comando instala o prisma client, cria a pasta migrations com a pasta que criamos durante a execução do comando e criou também o SQL com, exatamente, a estrutura que precisamos para criar uma tabela.

Assim, o Prisma conseguiu pegar toda a informação que definimos no Model User e converteu de uma forma que o banco de dados conseguisse entender.

_migrations: Histórico de tudo que está sendo realizado dentro do banco de dados. Se eu adicionar um campo na tabela users, vai criar outra migration com essa adição de coluna. O interessante é que se eu compartilhar esse código com outro dev, basta eu rodar o comando acima e tudo aquilo que tem dentro das migrations/do banco de dados tambem vai estar disponivel no banco de dados que o outro usuário está utilizando_

**Verificação de usuário no DB:**

Crio um prisma client, que fará a conexão do banco de dados, criando uma pasta prisma em src e importando no arquivo index.ts:

```ts
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

export default prismaClient;
```

Só com esse trecho de código, toda nossa conexão com banco de dados será feita. 😃

Em `AuthenticateUserService.ts`, importo esse prismaClient e faço uma desestruturação e um select onde o github_id seja igual ao id, vericando se existe algum usuário.

Se o usuário não existir, ele é criado com `await prismaClient.user.create()`, sendo user o model que eu quero criar.

```ts
import prismaClient from "../prisma";

//código...

    const response = await axios.get<IUserResponse>(
      //código...
    ;

    const { login, id, avatar_url, name } = response.data;

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    if (!user) {
     user = await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

```

Feita essa verificação, partimos para a criação do token.

**5. Retornar o token com as informações do user logado:**

Em `AuthenticateUserService.ts`, importo e adiciono as seguintes linhas:

```ts
import { sign } from "jsonwebtoken";

// código...

const token = sign(
  {
    user: {
      name: user.name,
      avatar_url: user.avatar_url,
      id: user.id,
    },
  },
  // secret para validar o token
  process.env.JWT_SECRET,
  {
    subject: user.id,
    expiresIn: "1d",
  },
);

return { token, user };
// retorno para quem estiver fazendo a requisição
```

Em `.env`, gero uma hash aleatória (esta foi gerada através do [http://www.md5.cz/](http://www.md5.cz/)):

```
JWT_SECRET=2bd7bbf7d29369dd7ce11a0bf9445c6e
```

Para eu não cair em erro 401, no `AuthenticateUserController.ts` faço um try/catch:

```ts
class AuthenticateUserController {
  async handle(request: Request, response: Response) {
    const { code } = request.body;

    const service = new AuthenticateUserService();

    try {
      const result = await service.execute(code);
      return response.json(result);
    } catch (err) {
      return response.json({ error: err.message });
    }
  }
}
```

### **Parte 7: Cadastro das mensagens**

Na pasta `services`, adiciono o arquivo `CreateMessageService.ts`, com o código inicial:

```ts
class CreateMessageService {
  async execute(text: string, user_id: string) {}
}

export { CreateMessageService };
```

Vou precisar receber duas informações: o texto que quero salvar no DB e qual usuário que está enviando a mensagem. Para cadastrar essa mensagem, vamos precisar criar a tabela no `schema.prisma`:

```
model Message {
  id String @id @default(uuid())
  text String
  created_at DateTime @default(now()) //pegando a data do sistema

  user User

  @@map("messages")
}
```

Automaticamente, ao salvar que a mensagem tem usuário do tipo "User", vai ser criado o relacionamento ao model User, de muitos para 1. Com algumas alterações, o resultado é:

```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id         String @id @default(uuid())
  name       String
  github_id  Int
  avatar_url String
  login      String

  //nome que a tabela terá no banco de dados
  messages Message[]
  @@map("users")
}

model Message {
  id         String   @id @default(uuid())
  text       String
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id])

  user_id String
  @@map("messages")
}

```

Agora, vamos rodar a migration e criar `create-messages`, fazendo todo o relacionamento de chave estrangeira automanticamente:

```bash
yarn prisma migrate dev
```

Para cadastrar a mensagem, volto em `CreateMessageService.ts` e incluo o seguinte trecho:

```ts
import prismaClient from "../prisma";

class CreateMessageService {
  async execute(text: string, user_id: string) {
    const message = await prismaClient.message.create({
      data: {
        text,
        user_id,
      },
      include: {
        user: true,
      },
    });

    return message;
  }
}

export { CreateMessageService };
```

_Quando retornar a mensagem para o front, traz todas as informações do usuário, como avatar e login.Pra isso, depois do data, existe aquele include._

Agora, crio o Controller `CreateMessageController.ts`:

```ts
import { Request, Response } from "express";

class CreateMessageController {
  async handle(request: Request, response: Response) {
    const { message } = request.body;
  }
}

export { CreateMessageController };
```

Com usuário autenticado > token > informação do usuário, criamos um middleware para, antes de bater no Controller, ver se é um token válido e se o usuário pode criar a mensagem. Para isso, crio uma pasta chamada middleware e, no arquivo `ensureAuthenticated.ts`, incluimos:

```Ts
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayLoad {
  sub: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({ errorCode: "token.invalid" });
  }

  const [, token] = authToken.split(" ");

  try {
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayLoad;
    request.user_id = sub;
    return next();
  } catch (err) {
    return response.status(401).json({ errorCode: "token.expired" });
  }
}


```

_O middleware verifica que se o usuário não for autenticado, se for inválido, retorna um erro. Mas se estiver válido, passa para frente. Por isso usamos "next"._

No código acima, estamos desestruturando o Bearer = 787874587548768178626817. Como vamos ignorar Bearer e só pegar o código, começamos com vírgula.

[0] Bearer
[1] Bearer787874587548768178626817

E sub = id do usuário.

Como o request do typescript não entenderia o trecho `request.user_id = sub;`, precisamos sobreescrever as tipagens do express, colocando uma pasta @types dentro de src, com outra pasta de nome express e aí vou sobreescrever o arquivo index.d.ts.

```ts
declare namespace Express {
  export interface Request {
    user_id: string;
  }
}
```

Com o middleware pronto, criamos a rota:

```Ts
router.post(
  "/messages",
  ensureAuthenticated,
  new CreateMessageController().handle,
);
```

De volta ao Insomnia, criamos uma request Create Message, do tipo Post, com `{{ _.baseURL }}/messages` e `{ "message": "Estou ansiosa pelo DoWhile" }` no body do JSON.

Concluindo o arquivo CreateMessageController,

```ts
import { Request, Response } from "express";
import { CreateMessageService } from "../services/CreateMessageService";

class CreateMessageController {
  async handle(request: Request, response: Response) {
    const { message } = request.body;
    const { user_id } = request;

    const service = new CreateMessageService();

    const result = await service.execute(message, user_id);

    return response.json(result);
  }
}

export { CreateMessageController };
```

Rodo o comando abaixo para trazer toda a estrutura que temos dentro do banco de dados.

```bash
yarn prisma studio
```

### **Parte 8: Configuração do websocket**

Como auxiliar na comunicação entre as aplicações (cliente/servidor), usamos o [https://socket.io/](https://socket.io/).

A comunicação com protocolo websocket é feita a todo tempo. A conexão só é fechada se alguma das partes é desconectada.

```bash
yarn add socket.io
yarn add @types/socket.io -D
```

No `app.ts`, importo:

```ts
import { Server } from "socket.io";
import http from "http";
```

E incluo as seguintes linhas para ter acesso ao io do cliente e para, quando subir o serverHttp, o app também subir junto:

```ts
const serverHttp = http.createServer(app);

const io = new Server(serverHttp);

//código...
serverHttp.listen(4000, () => console.log(`🚀 Server is running on PORT 4000`));
```

No package.json, mudo o script:

```bash
"scripts": {
    "dev": "ts-node-dev --exit-child src/server.ts"
  },
```

Instalamos também a dependência responsável por permitir ou barrar as requisições dentro da aplicação, o cors:

```bash
yarn add cors
yarn add @types/cors -D
```

No ts, digo que quero habilitar qualquer origem, permitindo que outras fontes como front-end e mobile se conectem. E também passo o evento que quero ficar ouvindo (em io.on):

```ts
import cors from "cors";

const app = express();
app.use(cors());

const io = new Server(serverHttp, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Usuário conectado no socket ${socket.id}`);
});
```

Criamos o client, na raiz do projeto, na pasta public > index.html (bem simples), só para fazer o teste se o websocket está funcionando.

Com isso, copiamos o script do CDN Socket Client e inserimos nesse HTML para termos acesso a um client do socket.

```js
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.min.js"
  integrity="sha512-eVL5Lb9al9FzgR63gDs1MxcDS2wFu3loYAgjIH0+Hg38tCS8Ag62dwKyH+wzDb+QauDpEZjXbMn11blw8cbTJQ=="
  crossorigin="anonymous"
></script>

    <script>
      const socket = io("http://localhost:4000")


      socket.on("new_message", data => console.log(data))
    </script>
```

Migramos o trecho seguinte para o arquivo server.ts, dentro de src:

```ts
serverHttp.listen(4000, () => console.log(`🚀 Server is running on PORT 4000`));
```

e, em seu lugar, no `app.ts`, exportamos tanto o serverHttp quanto o io,

```ts
export { serverHttp, io };
```

pois o serverHttp vamos precisar usar no server.ts e o io é porque precisamos criar um evento, dentro do `CreateMessageService`, para quando uma mensagem for criada, for enviada essa nova mensagem real-time para os clientes conectados:

```ts
import prismaClient from "../prisma";
import { io } from "../app";

class CreateMessageService {
  async execute(text: string, user_id: string) {
    const message = await prismaClient.message.create({
      data: {
        text,
        user_id,
      },
      include: {
        user: true,
      },
    });

    // infos que retornam para o usuário
    const infoWS = {
      text: message.text,
      user_id: message.user_id,
      created_at: message.created_at,
      user: {
        name: message.user.name,
        avatar_url: message.user.avatar_url,
      },
    };

    io.emit("new_message", infoWS);

    return message;
  }
}

export { CreateMessageService };
```

### **Parte 9. Criação de rotas para listar as 3 primeiras mensagens e perfil do usuário**

Em services, crio o arquivo `GetLast3MessagesService.ts`:

```TS
import prismaClient from "../prisma";

class GetLast3MessagesService {
  async execute() {
    const messages = await prismaClient.message.findMany({
      take: 3,
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: true,
      },
    });

    //SELECT * FROM MESSAGES LIMIT 3 ORDER BY CREATED_AT DESC
    return messages;
  }
}

export { GetLast3MessagesService };
```

Criamos no controller também o arquivo `GetLast3MessagesController.ts`:

```ts
import { Request, Response } from "express";
import { GetLast3MessagesService } from "../services/GetLast3MessagesService";

class GetLast3MessagesController {
  async handle(request: Request, response: Response) {
    const service = new GetLast3MessagesService();
    const result = await service.execute();
    return response.json(result);
  }
}

export { GetLast3MessagesController };
```

Em routes:

```ts
router.get("/messages/last3", new GetLast3MessagesController().handle);
```

No Insomnia, criamos a requisição "Get 3 lat messages". do tipo get, com a url acima.

**Retornando o profile do usuário**

No arquivo `ProfileUserService.ts`, como o usuário já vai estar autenticado na aplicação, já termos o user_id.

```ts
import prismaClient from "../prisma";

class ProfileUserService {
  async execute(user_id: string) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
    });

    return user;
  }
}

export { ProfileUserService };
```

Nos controllers, criamos o controller `ProfileUserController`

```ts
import { Request, Response } from "express";
import { ProfileUserService } from "../services/ProfileUserService";

class ProfileUserController {
  async handle(request: Request, response: Response) {
    const { user_id } = request;

    const service = new ProfileUserService();

    const result = await service.execute(user_id);

    return response.json(result);
  }
}

export { ProfileUserController };
```

E, por fim, criamos a rota em routes:

```ts
router.get("/profile", ensureAuthenticated, new ProfileUserController().handle);
```

E a request no Insomnia, passando o Bearer token anteriormente passado.

_Para melhoria, no Environment do Insomnia foi criado o token em uma variável, para que não seja preciso toda vez resgatar à mão o Bearer._
