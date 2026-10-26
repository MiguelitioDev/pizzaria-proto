# SOURCE_AUDIT — Pizzaria Vó Agripina

Fonte: https://menu.yooga.app/voagripina/ (SPA Angular). O HTML vem vazio; os dados foram lidos da API pública
que o próprio app consome (`https://delivery2.yooga.com.br/stores/voagripina` e `/stores/voagripina/menu`).
Snapshot salvo em `data/raw/` (`store.json`, `menu.json`, `images.json`). `src/data/menu.ts` é gerado por
`node scripts/generate-menu.mjs` a partir desse snapshot.

## Recuperado da fonte (verificado)
- Nome, descrição, logo (`public/images/logo.jpeg`), endereço (Rua Dragão do Mar (Broadway), Canoa Quebrada, Aracati/CE).
- Entrega: taxa fixa R$ 6,00 dentro de raio de 1000 m do restaurante; retirada no local habilitada; pedido mínimo 0; frete grátis acima de: 0 (nenhum).
- 47 produtos em 5 categorias (Pizza 29, Pizza Doce 6, Refrigerantes 4, Refrigerante Lata 5, Águas 3), com preços exatos.
  "CERVEJAS LONG NECK" existe na fonte, mas está vazia: não foi exibida.
- 21 imagens (logo + 20 produtos) baixadas para `public/images/`.

## NÃO existe na fonte (configuração pendente, nada foi inventado)
| Item | Estado | Onde configurar |
|---|---|---|
| Número de WhatsApp | ausente na API | `VITE_WHATSAPP_NUMBER` (`.env`) ou `src/config/business.ts` |
| Formas de pagamento | ausentes | `business.paymentMethods` (vazio → "combinada pelo WhatsApp") |
| Horário de funcionamento | todos os dias vazios (fonte mostra "Aberto para agendamento") | `business.hours` (null → nada é afirmado) |
| Tempo de entrega | ausente | não exibido |
| Número do endereço | fonte tem "00" | exibido como s/n |
| Fotos de ~27 produtos | fonte não tem | usam fallback de marca (brasão); ver abaixo |

## Dúvidas / interpretações a confirmar com o dono
1. **DOIS SABORES** (R$ 0 + metades): a fonte permite 0–5 escolhas e mistura "REQUEIJÃO +R$ 7" na lista de sabores.
   Interpretei como **exatamente 2 metades** + adicional opcional Requeijão (máx. 1). Preço = soma das metades
   (ex.: 1/2 Camarão a Moda da Casa 32,50 + 1/2 Atum a Peruana 25,00 = R$ 57,50). Ajustável em `scripts/generate-menu.mjs`.
   A lista da fonte repete entradas; duplicatas exatas (nome+preço) foram removidas.
2. **Calabresa / Frango Catupiry** têm opções "1/2 X +R$ …" opcionais com valores (R$ 17,50–19,00) que parecem
   configuração antiga (somam ao preço cheio). Mantidos exatamente como na fonte sob o rótulo "Opções disponíveis".
3. **BORDA** (R$ 12) aparece como produto separado (Cheda/Catupiri; no doce, Chocolate). Mantido como produto; não vinculado automaticamente a pizzas.
4. Erros de digitação da fonte foram preservados nos dados ("catupiri", "muçarala", "PIZZAOLO"…); só a caixa (MAIÚSCULAS → Title Case) é ajustada na exibição.
5. Taxa de R$ 6,00 vale só até 1 km; o site **não** consegue validar a distância. O checkout avisa que, fora da área,
   o restaurante combina pelo WhatsApp.

## Imagens
Não foram adicionadas fotos de bancos (Unsplash/Pexels): não dá para garantir fidelidade ao produto nem licença
sem curadoria. Produtos sem foto usam um fallback discreto com o brasão da marca. Para trocar, coloque a imagem em
`public/images/products/<id>.jpeg` e adicione o id em `data/raw/images.json`, depois rode `node scripts/generate-menu.mjs`.
