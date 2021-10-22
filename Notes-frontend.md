# Stage 2

#### **Tecnologias e bibliotecas usadas na aplicação front-end:**

- React / Vite / SASS / React Icons / Prisma Studio / Socket.IO

## **Criar o projeto em React**

Existem múltiplas formas de criar um app React. Para este projeto, utilizaremos o performático Vite, que é uma ferramenta para criar não só projetos React, mas JavaScript moderno. É, basicamente, uma plataforma que permite que coloquemos o código JS e executar no browser tendo funcionalidades muito comuns em projetos (como fast-refresh) e entender sintaxes que o navegador, por padrão, não entende, como SCSS e TypeScript.

Diferentemente do webpack, o Vite utiliza os EcmaScript modules nativos do browser, ou seja, o esquema de importação e exportação de arquivos que já temos nativamente em navegadores mais modernos. Por isso o webpack é mais lento.

Para criar um template com o Vite, basta seguir os passos abaixo (documentação oficial [aqui](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)):

```bash
yarn create vite web --template react-ts
## ou
## npm init vite@latest web -- --template react-ts
```

Para acessar a pasta, instalar as dependências e rodar o projeto:

```bash
cd web
yarn
yarn dev

## ou
## cd web
## npm install
## npm run dev
```

Em seguida, limpamos o projeto deletando tudo o que não será utilizado no `app.tsx`, deixando somente no `src` `app.tsx`, `main.tsx` e `vite-end.d.ts`. O arquivo `app.tsx` fica mais ou menos assim tambem:

```tsx
export function App() {
  return <h1>Hello World!</h1>;
}
```

_Lembrando de alterar também a importação do app no main como `import { App } from './App'`_

Em seguida, criamos em src uma pasta styles, com o arquivo `global.css`, para estilizações globais do css:

```css
* {
  padding: 0.5;
  margin: 0;
  box-sizing: border-box;
  font-family: Roboto, sans-serif;
}

body {
  color: #e1e1e6;
  background-color: #121214;
}
```

Importo o arquivo CSS no main:

```ts
import "./styles/global.css";
```

Incluo a fonte no index.html da aplicação:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
      rel="stylesheet"
    />

    <title>Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

E tá pronta nossa estilização básica e limpeza de código.

## **Estilização do projeto**

Iniciando oficialmente a estilização, existem duas formas de incluir css: por seletores no `app.css` ou `CSS modules`, que são, no nome do arquivo, nunca colocar a extensão apenas como CSS e sim "module.css".

Sendo assim, o arquivo base para CSS, usando o pré-processador SASS (instalado via `yarn add sass`), fica com o nome `App.module.scss` dentro da pasta src.

No `app.tsx`, faço sua importação e passo a usar "styles" sempre antes de me referir a uma classeName, agora envolta por `{}`.

```ts
import styles from "./App.module.scss";

export function App() {
  return (
    <main className={styles.contentWrapper}>
      <h1>Hello, World</h1>
    </main>
  );
}
```

O SASS permite que façamos estilização em encadeamento.

## **Integração com o Github**

Com o backend rodando em Node, crio a pasta services, em src, com o arquivo que terá a configuração do serviço que vai se conectar com o backend: api.ts. Para isso, utlizamos o axios, que é um cliente de requisições HTTP.

```bash
yarn add axios
## npm i axios
```

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000",
});
```

E começo, assim, a fazer a integração front com back no componente MessageList:

```ts
export function MessageList() {
  useEffect(() => {
    api.get("messages/Last3").then((response) => {
      console.log(response.data);
    });
  }, []);

  // código...
```

Abrindo o Prisma studio (`yarn prisma studio`), consigo cadastrar novo usuário e mensagem e ver que as mensagens do banco de dados estão já dentro da aplicação react.

Para mostrar em tela, tenho que percorre-las.

Assim, começamos a implementar o conceito que estado, que nada mais é do que uma forma de armanzenar informações dentro do componente, que vão ser manipuladas pelo compomente.

Como código final das mensagens sendo buscadas do backend no componente MessageList:

```ts
import styles from "./style.module.scss";

import logoImg from "../../assets/logo.svg";

import { api } from "../../services/api";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
};

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    api.get<Message[]>("messages/Last3").then((response) => {
      setMessages(response.data);
    });
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => {
          return (
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

## **Funcionalidade de Login no componente LoginBox**

- Redirecionar pro Github para pedir acesso
- Redirecionar o acesso de volta à aplicação

Para isso, é importante que Authorization callback URL seja a mesma URL de onde está sendo executada a aplicação React.

<!-- http://localhost:4000/signin/callback -->

```

```
