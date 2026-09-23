# Deploy no Railway

## Serviços

Crie dois serviços no mesmo projeto Railway:

1. **PostgreSQL**, usando o template oficial do Railway.
2. **Aplicação**, conectada ao repositório deste projeto.

O Railway fornece `DATABASE_URL` automaticamente quando o banco é adicionado ao projeto.

## Variáveis da aplicação

Configure as variáveis privadas no serviço da aplicação:

```text
APP_URL=https://SEU-DOMINIO.up.railway.app
SESSION_SECRET=<segredo aleatório com pelo menos 32 caracteres>
SEED_ADMIN_EMAIL=<e-mail administrativo>
SEED_ADMIN_PASSWORD=<senha forte>
SUPPLIER_API_URL=https://vendasdoramon.squareweb.app
SUPPLIER_API_KEY=<chave do fornecedor>
SUPPLIER_NAME=Fornecedor principal
SUPPLIER_PRICE_MARGIN_PERCENT=50
MERCADOPAGO_ACCESS_TOKEN=<access token do Mercado Pago>
```

Não envie `.env` para o repositório. Use somente as Variables do Railway.

## Deploy

O arquivo `railway.toml` configura:

- build com `npm run build`;
- migrações Prisma antes de iniciar a aplicação;
- healthcheck em `/api/health`;
- reinício automático em falhas.

Após o primeiro deploy:

1. abra `/api/health` e confirme `{"status":"ok"}`;
2. configure no Mercado Pago o webhook:
   `https://SEU-DOMINIO/api/payments/mercado-pago/webhook`;
3. faça uma sincronização manual em `/admin/fornecedores`;
4. não rode o seed DEMO em produção.
