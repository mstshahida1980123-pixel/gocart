import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export const loadProducts = () => async (dispatch) => {
    try {
        const res = await fetch('/api/products')
        if (!res.ok) {
            console.error(`Failed to load products: HTTP ${res.status}`, await res.text())
            return
        }
        const json = await res.json()
        if (json.products && Array.isArray(json.products)) {
            dispatch(setProduct(json.products))
        } else {
            console.error('Invalid products response structure:', json)
            dispatch(setProduct([]))
        }
    } catch (err) {
        console.error('Failed to load products:', err.message)
        dispatch(setProduct([]))
    }
}

export default productSlice.reducer