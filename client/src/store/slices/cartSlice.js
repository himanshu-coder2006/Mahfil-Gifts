import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

const itemsOf = (payload) => (payload && Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : []);
const totalsOf = (payload) => (payload && payload.totals ? payload.totals : null);

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartAPI.get();
    return { items: itemsOf(res.data), totals: totalsOf(res.data) };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await cartAPI.add(data);
    return { items: itemsOf(res.data), totals: totalsOf(res.data) };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartAPI.update(id, { quantity });
    return { items: itemsOf(res.data), totals: totalsOf(res.data) };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (id, { rejectWithValue }) => {
  try {
    const res = await cartAPI.remove(id);
    return { id, items: itemsOf(res.data), totals: totalsOf(res.data) };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totals: null, loading: false, error: null },
  reducers: {
    clearCartError: (state) => { state.error = null; },
    clearCart: (state) => { state.items = []; state.totals = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totals = action.payload.totals;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totals = action.payload.totals;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totals = action.payload.totals;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totals = action.payload.totals;
      });
  },
});

export const { clearCartError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
