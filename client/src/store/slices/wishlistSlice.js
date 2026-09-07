import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../services/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.get();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState, rejectWithValue }) => {
  try {
    const exists = getState().wishlist.items.find((p) => p._id === productId);
    if (exists) {
      await wishlistAPI.remove(productId);
      return { action: 'removed', productId };
    } else {
      const res = await wishlistAPI.add(productId);
      return { action: 'added', items: res.data };
    }
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload.action === 'added') {
          state.items = action.payload.items;
        } else {
          state.items = state.items.filter((p) => p._id !== action.payload.productId);
        }
      });
  },
});

export default wishlistSlice.reducer;
