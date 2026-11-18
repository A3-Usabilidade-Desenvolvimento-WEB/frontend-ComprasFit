# ComprasFit

Aplicativo Expo para web, Android e iOS. O frontend usa Supabase Auth e a API ComprasFit para receitas, planejamento, compras, validades e sugestões.

## Executar localmente

Use Node 22.13 ou superior compatível com o Expo SDK 57. Na raiz do frontend, rode `npm ci`. Configure o arquivo local `.env` a partir de `.env.example` e inicie com `npm run web`. Para Android ou iOS, use `npm start` e um cliente compatível com o SDK do projeto.

| Variável pública | Valor |
| --- | --- |
| EXPO_PUBLIC_API_URL | `https://backend-compras-fit.vercel.app` por padrão. Para o backend local no navegador, use `http://localhost:3000`. |
| EXPO_PUBLIC_SUPABASE_URL | URL do projeto Supabase utilizado pela API |
| EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Chave publicável do mesmo projeto Supabase |

Para usar a API local, inicie `npm run dev` na raiz do backend. O emulador Android alcança o computador por `http://10.0.2.2:3000`. No aparelho físico, use o IP de rede do computador, com a API acessível nessa interface. Reinicie o Expo ao mudar de ambiente. Se o Metro reutilizar um bundle com as variáveis anteriores, use `npx expo start --clear` ou `npx expo export -p web --clear`.

## Publicar

No projeto Vercel do frontend, selecione a raiz deste repositório, preset Other, e cadastre as três variáveis da tabela para Production e os Previews correspondentes. A Vercel executa `npx expo export -p web`, publica `dist` e encaminha rotas da SPA para `index.html`. As variáveis são incorporadas ao JavaScript durante o build. Após alterá-las, gere novo deploy. A chave secreta do banco fica exclusivamente no projeto backend.

Antes do push, valide com `npm run typecheck`, `npm test` e `npm run build:web`. O backend precisa estar atualizado e o banco migrado antes de usar a nova interface. O domínio de produção é `https://comprasfit-swart.vercel.app`.

## Contas e dados

O login com e-mail usa Supabase Auth. O modo visitante precisa de login anônimo habilitado no Supabase e gera uma sessão individual. Contas antigas de demonstração precisam de cadastro no Supabase. Na atualização, o app reaproveita as preferências de interface do dispositivo. Receitas e planos da demonstração usavam outro catálogo e devem ser gerados novamente.

O app restaura o último plano salvo na API. A lista mostra embalagens e subtotais cadastrados. Trocar uma refeição gera um novo plano no histórico. Favoritos e preferências ficam no aparelho por conta. As sugestões indicam se usam a lista de compras ou se são receitas de referência.

O teste opcional `scripts/test_web.py` usa Playwright e Chromium. Execute-o contra uma instalação de desenvolvimento com login anônimo habilitado. Use `COMPRASFIT_TEST_URL` para indicar a URL do Expo. Ele cria dados de teste no backend selecionado.
