# quickpay-ecommerce
Prueba tecnica-DanielGuillermoPriolo 
-----------------------------------|---------|----------|---------|---------|-----------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
-----------------------------------|---------|----------|---------|---------|-----------------------------
All files                          |   92.48 |     51.4 |   97.58 |   92.32 |                             
 aplication/use_cases              |   91.54 |    56.81 |   92.85 |    90.9 |                             
  create-transaction.use-case.ts   |   94.23 |    56.25 |     100 |   93.87 | 116,135,181                 
  get-products.use-case.ts         |   94.44 |       50 |     100 |   93.75 | 38                          
  get-transaction.use-case.ts      |   94.11 |       50 |     100 |   93.33 | 45                          
  process-payment.use-case.ts      |   87.27 |    61.11 |   81.81 |   86.53 | 105,109,118,127,156,160,210 
 domain/entities                   |     100 |      100 |     100 |     100 |                             
  customer.entity.ts               |     100 |      100 |     100 |     100 |                             
  delivery.entity.ts               |     100 |      100 |     100 |     100 |                             
  product.entity.ts                |     100 |      100 |     100 |     100 |                             
  transaction.entity.ts            |     100 |      100 |     100 |     100 |                             
 infra/gateway                     |   76.92 |    37.77 |    90.9 |   77.77 |                             
  sandbox-payment.gateway.ts       |   76.92 |    37.77 |    90.9 |   77.77 | 120,147,223-233,241-255,269 
 infra/http/controllers            |     100 |       50 |     100 |     100 |                             
  health.controller.ts             |     100 |      100 |     100 |     100 |                             
  products.controller.ts           |     100 |      100 |     100 |     100 |                             
  transactions.controller.ts       |     100 |       50 |     100 |     100 | 93                          
 infra/http/helpers                |     100 |       75 |     100 |     100 |                             
  result-to-http.helper.ts         |     100 |       75 |     100 |     100 | 12                          
 infra/persistence                 |     100 |       70 |     100 |     100 |                             
  prisma-customer.repository.ts    |     100 |      100 |     100 |     100 |                             
  prisma-delivery.repository.ts    |     100 |       50 |     100 |     100 | 33                          
  prisma-product.repository.ts     |     100 |      100 |     100 |     100 |                             
  prisma-transaction.repository.ts |     100 |       50 |     100 |     100 | 37-44                       
 shared/errors                     |     100 |      100 |     100 |     100 |                             
  domain.error.ts                  |     100 |      100 |     100 |     100 |                             
 shared/rop                        |     100 |      100 |     100 |     100 |                             
  result.ts                        |     100 |      100 |     100 |     100 |                             
-----------------------------------|---------|----------|---------|---------|-----------------------------
