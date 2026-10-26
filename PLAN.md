# PLAN — Cardápio digital Vó Agripina

## Achados
Fonte é um app Yooga (Angular) sem WhatsApp/pagamento/horários públicos. Dados reais obtidos pela API pública; ver `SOURCE_AUDIT.md`.
Repositório estava vazio (sem skills de projeto); Vite + React 19 + TS + Tailwind v4 escolhidos.

## Direção visual
"Minimalismo premium caloroso": fundo creme `#FBF5E9`, vermelho tomate `#C4352E` (só ação/seleção), verde floresta `#2E5B3B`
(apoio), crosta `#EBC684`; cores tiradas do logo. Fraunces (títulos) + DM Sans (texto), self-hosted. Sem gradientes/avaliações/promoções inventadas.

## Arquitetura
- `src/data/menu.ts` (gerado) · `src/config/business.ts` (toda configuração do negócio) · `src/types.ts` (dinheiro em centavos)
- `src/lib/` lógica pura testada: `pricing`, `cart`, `search`, `validation`, `whatsapp`, `format`
- `src/state/CartContext.tsx` (reducer + persistência localStorage, sempre revalidada contra o menu)
- `src/components/` apresentação (Header, Hero, Search, Categories, Grid/Card, ProductDetails, ShoppingCart, CheckoutForm, WhatsAppCheckout…)

## Jornada
Navegar/buscar → card (ou "+") → detalhes (opções obrigatórias, quantidade, nota) → sacola → entrega/retirada + dados → mensagem WhatsApp
pré-formatada (ou "Copiar pedido" sem número configurado). O site nunca afirma pedido recebido/pago.

## Pendências de negócio
WhatsApp, pagamentos, horários, confirmação das interpretações de DOIS SABORES/opções de metade, fotos faltantes.

## Validação
`npm run build` (tsc + vite), `npm test` (vitest), `npx oxlint`, e fluxo E2E em Chrome headless (5 viewports, busca, opções, carrinho, persistência, checkout).
