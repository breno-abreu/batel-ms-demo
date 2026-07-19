# Batel MS — Demo

Demonstração **somente frontend** do Bless App / Batel MS, com dados mock.

Não inclui backend, banco de dados nem autenticação real. O comportamento é o mesmo do modo demo do repositório principal.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:5173/](http://localhost:5173/).

## Build de produção

```bash
npm run build
npm run preview
```

O build usa a base `/batel-ms-demo/` (GitHub Pages em project site) e gera `404.html` para rotas do Vue Router.

## GitHub Pages

Após o push em `main`, o workflow `.github/workflows/deploy-github-pages.yml` publica o site.

URL esperada:

`https://breno-abreu.github.io/batel-ms-demo/`

No repositório GitHub: **Settings → Pages → Source → GitHub Actions**.

## Observações

- `IS_DEMO_MODE` permanece sempre `true` em `src/demo/demoConfig.ts`
- Mutações (criar/editar/excluir) só exibem feedback visual e **não persistem** dados
- A versão completa (API + PostgreSQL) fica no repositório principal `batel-ms`
