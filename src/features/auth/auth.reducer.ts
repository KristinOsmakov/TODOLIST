import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appActions } from "app/app.reducer";
import { authAPI, LoginParamsType } from "features/auth/auth.api";
import { clearTasksAndTodolists } from "common/actions";
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError } from "common/utils";
import { Dispatch } from "redux";
import { thunkTryCatch } from "common/utils/thunk-try-catch";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    })
    .addCase(logout.fulfilled, (state) => {
      state.isLoggedIn = false;
    })
      .addCase(initializeApp.fulfilled, (state) => {
        state.isLoggedIn = true;
      })
  },
});

// thunks
export const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
  `${slice.name}/login`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await authAPI.login(arg);
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { isLoggedIn: true };
      } else {
        const isShowError = !res.data?.fieldsErrors?.length
        handleServerAppError(res.data, dispatch, isShowError);
        return rejectWithValue(res.data);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  },
);
export const logout = createAppAsyncThunk<void, void>(
  `${slice.name}/logout`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await authAPI.logout();
      if (res.data.resultCode === 0) {
        dispatch(clearTasksAndTodolists());
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return undefined
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  },
);

// export const initializeApp = createAppAsyncThunk<void, void>(`${slice.name}/initializeApp`,
//   async(_, thunkAPI) => {
//   const {dispatch, rejectWithValue} = thunkAPI
//   try {
//     const res = await authAPI.me();
//     if (res.data.resultCode === 0) {
//       return undefined;
//     } else {
//       return rejectWithValue(null)
//     }
//   }
//   catch (e) {
//     handleServerNetworkError(e, dispatch);
//     return rejectWithValue(null);
//   }
//   finally {
//     dispatch(appActions.setAppInitialized({ isInitialized: true}))
//   }
// })
export const initializeApp = createAppAsyncThunk<{
  isLoggedIn: boolean
}, undefined>('auth/initializeApp', (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  return thunkTryCatch(thunkAPI, async () => {
    const res = await authAPI.me();
    if (res.data.resultCode === 0) {
      return { isLoggedIn: true };
    } else {
      return rejectWithValue(null);
    }
  }).finally(() => {
    dispatch(appActions.setAppInitialized({ isInitialized: true }));
  });
});


export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = { login,
  initializeApp() {

  }
};
