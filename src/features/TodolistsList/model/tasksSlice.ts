import { createSlice } from "@reduxjs/toolkit"
import { appActions } from "app/appSlice"
import { clearTasksAndTodolists } from "common/actions"
import { ResultCode, TaskPriorities, TaskStatuses } from "common/enums"
import { createAppAsyncThunk, handleServerAppError, thunkTryCatch } from "common/utils"
import { todolistsThunks } from "features/todolistsList/model/todolistsSlice"
import { tasksApi } from "features/todolistsList/api/tasksApi";
import {
  AddTaskArgType, RemoveTaskArgType,
  TaskType,
  UpdateTaskArgType,
  UpdateTaskModelType
} from "features/todolistsList/api/tasksApi.types";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId]
        tasks.unshift(action.payload.task)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.domainModel }
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
  },
  selectors: {
    selectTasks: (state) => state,
  },
})

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  `${slice.name}/fetchTasks`,
  (todolistId, thunkAPI) => {
    return thunkTryCatch(thunkAPI, async () => {
      const res = await tasksApi.getTasks(todolistId)
      const tasks = res.data.items
      return { tasks, todolistId }
    })
  },
)

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>(`${slice.name}/addTask`, (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI
  return thunkTryCatch(thunkAPI, async () => {
    const res = await tasksApi.createTask(arg)
    if (res.data.resultCode === ResultCode.Success) {
      const task = res.data.data.item
      return { task }
    } else {
      return rejectWithValue(res.data)
    }
  })
})

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
  `${slice.name}/updateTask`,
  (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
      const state = getState()
      const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
      if (!task) {
        dispatch(appActions.setAppError({ error: "Task not found in the state" }))
        return rejectWithValue(null)
      }

      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...arg.domainModel,
      }

      const res = await tasksApi.updateTask(arg.todolistId, arg.taskId, apiModel)
      if (res.data.resultCode === ResultCode.Success) {
        return arg
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    })
  },
)

const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>(
  `${slice.name}/removeTask`,
  (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
      const res = await tasksApi.deleteTask(arg)
      if (res.data.resultCode === ResultCode.Success) {
        return arg
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    })
  },
)

export const tasksReducer = slice.reducer
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask }
export const { selectTasks } = slice.selectors
export const tasksPath = slice.reducerPath

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}

export type TasksStateType = {
  [key: string]: Array<TaskType>
}