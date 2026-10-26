/** All monetary values are integer centavos (BRL) to avoid float errors. */
export type Cents = number

export interface ProductOption {
  /** Unique across the whole menu. */
  id: string
  name: string
  /** Amount ADDED to the product base price when selected. */
  price: Cents
}

export interface OptionGroup {
  id: string
  name: string
  /** min > 0 means the group is required. */
  min: number
  /** Max number of distinct options that can be selected. */
  max: number
  options: ProductOption[]
}

export interface Product {
  id: string
  categoryId: string
  /** Verbatim from the source menu (trimmed). */
  name: string
  description: string
  basePrice: Cents
  /** Public path under /images, absent when the source has no photo. */
  image?: string
  optionGroups: OptionGroup[]
}

export interface Category {
  id: string
  name: string
}

export interface Menu {
  categories: Category[]
  products: Product[]
}

/** What the customer picked. Prices are NEVER stored here; always recomputed from the menu. */
export interface CartLine {
  /** Stable key: productId + sorted option ids + normalized note. */
  key: string
  productId: string
  selectedOptionIds: string[]
  quantity: number
  note: string
}

export type FulfillmentMethod = 'delivery' | 'pickup'

export interface CustomerDetails {
  name: string
  phone: string
  street: string
  number: string
  neighborhood: string
  complement: string
}
