import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { menu } from '../data/menu'
import { cartCount, cartReducer, loadCart, saveCart } from '../lib/cart'
import type { CartLine } from '../types'

export interface CartContextValue {
  lines: CartLine[]
  count: number
  addItem: (
    productId: string,
    selectedOptionIds: string[],
    quantity: number,
    note?: string,
  ) => void
  setQuantity: (key: string, qty: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [], () =>
    loadCart(menu, typeof localStorage === 'undefined' ? undefined : localStorage),
  )

  useEffect(() => {
    saveCart(lines, typeof localStorage === 'undefined' ? undefined : localStorage)
  }, [lines])

  const addItem = useCallback(
    (productId: string, selectedOptionIds: string[], quantity: number, note = '') => {
      dispatch({
        type: 'add',
        productId,
        selectedOptionIds,
        quantity,
        note,
      })
    },
    [],
  )

  const setQuantity = useCallback((key: string, qty: number) => {
    dispatch({
      type: 'setQuantity',
      key,
      quantity: qty,
    })
  }, [])

  const removeItem = useCallback((key: string) => {
    dispatch({
      type: 'remove',
      key,
    })
  }, [])

  const clear = useCallback(() => {
    dispatch({
      type: 'clear',
    })
  }, [])

  const count = useMemo(() => cartCount(lines), [lines])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, count, addItem, setQuantity, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}
