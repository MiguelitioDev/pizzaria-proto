# Pizzaria Vó Agripina — Cardápio digital

Cardápio e pedidos por WhatsApp (Vite + React + TypeScript + Tailwind v4).

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes unitários (vitest)
npm run build    # tsc + vite build
```

## Configuração

- `VITE_WHATSAPP_NUMBER` (veja `.env.example`): número do restaurante, só dígitos com DDI+DDD. Sem ele o checkout só oferece "Copiar pedido". Na Vercel: Settings → Environment Variables.
- `src/config/business.ts`: horários, formas de pagamento, taxa de entrega.
- `src/data/menu.ts` é gerado por `npm run gen:menu` a partir de `data/raw/`.

Detalhes e pendências: `SOURCE_AUDIT.md` e `PLAN.md`.
