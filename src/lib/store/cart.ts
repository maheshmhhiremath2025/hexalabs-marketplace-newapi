import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    code: string;
    title: string;
    price: number; // USD price
    quantity: number;
    category: string;
}

interface CartStore {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (item) => {
                const items = get().items;
                const existing = items.find(i => i.id === item.id);

                if (existing) {
                    set({
                        items: items.map(i =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, { ...item, quantity: 1 }] });
                }
            },

            removeFromCart: (id) => {
                set({ items: get().items.filter(i => i.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) {
                    get().removeFromCart(id);
                    return;
                }
                set({
                    items: get().items.map(i =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
            },
        }),
        {
            name: 'hexalabs-cart',
        }
    )
);
