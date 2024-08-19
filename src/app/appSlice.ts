import { Dispatch } from "redux"
import { authAPI } from "../api/todolists-api"
import { setIsLoggedIn } from "features/Login/authSlice"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Simulate } from "react-dom/test-utils"
import error = Simulate.error

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"

const slice = createSlice({
  name: "app",
  initialState: {
    status: "idle" as RequestStatusType,
    error: null as string | null,
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    },
  },
  selectors: {
    selectStatus: (sliceState) => {
      sliceState.status
    },
    selectError: (sliceState) => {
      sliceState.error
    },
    selectIsInitialized: (sliceState) => {
      sliceState.isInitialized
    },
  },
})

export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedIn({ isLoggedIn: true }))
    } else {
    }

    dispatch(setAppInitialized({ isInitialized: true }))
  })
}

export type AppInitialState = ReturnType<typeof slice.getInitialState>

export const appReducer = slice.reducer
export const { setAppError, setAppStatus, setAppInitialized } = slice.actions
export const { selectStatus, selectError, selectIsInitialized } = slice.selectors
