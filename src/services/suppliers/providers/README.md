O provider `generic-rest` implementa a API de revenda do fornecedor atual. Ele consulta
`GET /api/stock` usando o header `X-Stock-Key` e aceita a lista no campo `stock`. Para reservar,
envia `POST /api/stock/reserve` com `service`, `buyer_id` e `sale_id`.

Cada produto do fornecedor usa `id` como código externo, `name`, `price` como custo,
`stock` como quantidade e `descricao` como descrição. O token nunca fica no código: é lido de
`SUPPLIER_API_KEY`.

Quando o fornecedor tiver um contrato diferente, crie um adapter específico implementando
`SupplierProvider` em vez de alterar o sincronizador.
