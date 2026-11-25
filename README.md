# quickpay-ecommerce
Prueba tecnica-DanielGuillermoPriolo 

Backend 
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
Frontend 
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |   93.92 |    85.96 |   91.42 |   94.42 |                   
 src                    |   93.02 |    88.23 |   81.81 |      95 |                   
  App.tsx               |   93.02 |    88.23 |   81.81 |      95 | 163-175           
 src/app                |   82.35 |       50 |     100 |   81.25 |                   
  store.ts              |   82.35 |       50 |     100 |   81.25 | 14-22             
 src/components         |     100 |      100 |     100 |     100 |                   
  CardBrandBadge.tsx    |     100 |      100 |     100 |     100 |                   
 src/feat/checkout      |   92.72 |    83.67 |   89.65 |   92.66 |                   
  PaymentModal.tsx      |   96.49 |    95.91 |   88.23 |   96.42 | 297,476           
  PaymentResultPage.tsx |     100 |    85.18 |     100 |     100 | 41,54,79,99       
  SummaryBackdrop.tsx   |     100 |    85.71 |     100 |     100 | 86,144            
  checkoutSlice.ts      |   85.36 |        0 |      90 |   85.36 | 91-99,161-162     
 src/feat/products      |   97.72 |    95.45 |   93.75 |   97.56 |                   
  ProductListPage.tsx   |   95.65 |      100 |   88.88 |   95.23 | 130               
  productsSlice.ts      |     100 |       75 |     100 |     100 | 54                
 src/services           |     100 |      100 |     100 |     100 |                   
  api.service.ts        |     100 |      100 |     100 |     100 |                   
 src/utils              |   95.74 |    84.61 |     100 |   97.72 |                   
  card-validation.ts    |   95.45 |    84.61 |     100 |   97.56 | 37                
  currency.ts           |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------