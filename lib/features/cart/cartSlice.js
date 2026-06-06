import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export const syncCartToDB = () => async (dispatch, getState) => {
    try {
        const { cart } = getState()
        await fetch('/api/cart/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cart.cartItems) })
    } catch (err) {
        console.error('Failed to sync cart', err)
    }
}

export const loadCartFromDB = () => async (dispatch) => {
    try {
        const res = await fetch('/api/cart')
        if (!res.ok) return
        const json = await res.json()
        // Expecting cart as object of productId -> qty
        const remoteCart = json.cart || {}
        // reset current cart and populate
        dispatch(clearCart())
        for (const [productId, qty] of Object.entries(remoteCart)) {
            for (let i = 0; i < qty; i++) {
                dispatch(addToCart({ productId }))
            }
        }
    } catch (err) {
        console.error('Failed to load cart from DB', err)
    }
}

export default cartSlice.reducer
