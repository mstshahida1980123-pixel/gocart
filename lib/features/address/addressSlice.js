import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = action.payload
        },
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
    }
})

export const { setAddresses, addAddress } = addressSlice.actions

export const loadAddresses = () => async (dispatch) => {
    try {
        const res = await fetch('/api/address')
        if (res.ok) {
            const json = await res.json()
            if (json.addresses) {
                dispatch(setAddresses(json.addresses))
            }
        }
    } catch (err) {
        console.error('Failed to load addresses', err)
    }
}

export default addressSlice.reducer