# ComprasFit

## Versão web responsiva

O mesmo projeto oferece uma interface web para celular, tablet e computador. A partir de 700 px, o cardápio usa duas colunas; a partir de 900 px, a navegação aparece na lateral. Em telas de 1400 px ou mais, o cardápio usa três colunas. Em celulares, o menu permanece na parte inferior. A apresentação e os detalhes das receitas ganham duas colunas no computador. Favoritos e preferências ficam salvos no navegador usado.

```bash
npm ci
npm run web
```

Para gerar os arquivos estáticos de produção:

```bash
npm run build:web
```

Publique o conteúdo de `dist/` em uma hospedagem de sites estáticos. O build funciona sem servidor de API. A lista de compras pode ser compartilhada, copiada quando o navegador permite ou baixada como texto. Para visualizar no seu computador, execute os comandos localmente; a porta do servidor na nuvem não fica automaticamente acessível pela internet.

Teste opcional de interface (requer Python, Playwright e Chromium): gere o build, sirva `dist` na porta 8090 e execute `python scripts/test_web.py`. A URL pode ser alterada com `COMPRASFIT_TEST_URL`. O teste cobre larguras de 320 a 1440 px, navegação por teclado, configuração inicial, favoritos, receitas, lista de compras, download e persistência. Capturas são salvas em `/tmp/comprasfit-web`.

Frontend mobile em **React Native, Expo e TypeScript**, baseado nas 18 páginas do PDF de referência fornecido. Nenhum backend foi criado ou conectado.

## Executar

Requer Node.js 22.13+ ou 24.3+ (validado com 24.19) e npm.

```bash
npm ci
npm start
```

Abra pelo Expo Go compatível com SDK 58 no celular. O aparelho precisa alcançar a máquina que executa o Metro; em uma máquina na nuvem pode ser necessário um túnel ou um development build. O terminal informa as opções de conexão. Android Studio e Xcode são necessários somente para usar os respectivos emuladores locais; iOS Simulator exige macOS.

```bash
npm run android  # emulador Android ou aparelho configurado
npm run ios      # simulador iOS, em macOS
npm run web      # validação alternativa no navegador
```

No ambiente cloud, execute `bash scripts/setup.sh` para instalar com o lockfile e usar caches em diretórios graváveis. Não são necessárias variáveis de API ou credenciais.

## Funcionalidades

- Apresentação e configuração de nome, mercado, pessoas, dias, orçamento, objetivos, restrições e equipamentos.
- Planejamento semanal local, com catálogo pequeno e estimativa de custo; aviso quando o mínimo disponível ultrapassa o orçamento.
- Receitas com ingredientes, preparo, favoritos e substituição por outra receita compatível.
- Lista de compras que agrega quantidades por ingrediente e número de pessoas, marcação de compras e compartilhamento nativo.
- Tema claro/escuro, início da semana, configurações e exclusão dos dados com confirmação.
- Perfil, plano, favoritos e compras persistidos no dispositivo com AsyncStorage. Cancelar a edição preserva o plano anterior. As fotos e a ilustração de apresentação foram extraídas do PDF enviado.

## Limites desta versão

O catálogo, os preços e os dados nutricionais são **dados de demonstração**, sem consulta aos supermercados. As preferências de objetivo priorizam receitas locais quando há correspondência; não constituem um recomendador nutricional. Restrições se aplicam somente às categorias disponíveis no catálogo, sem garantia de ausência de alérgenos. O bowl vegetariano usa uma foto ilustrativa reaproveitada do design. Não há autenticação, sincronização, notificações ou backend. A tela de planejamento é calculada localmente, sem simular uma chamada ao servidor. Marcas dos mercados são apresentadas em texto; assets de alta resolução do Figma podem substituir os recortes do PDF depois.

O estado e os comandos da interface estão centralizados em `src/state/AppState.tsx`; modelos e funções de planejamento estão em `src/data`. Essa é a fronteira para incorporar o contrato real da API posteriormente. Não foi inventado um endpoint.

## Verificação

```bash
npm run typecheck
npm test
npm run export -- --platform all
```

Os testes verificam restrições, compatibilidade de equipamentos, ordem dos dias, orçamento e agregação da lista. A exportação gera bundles de Android, iOS e web; não é um APK/IPA e não substitui um teste em aparelho real.
