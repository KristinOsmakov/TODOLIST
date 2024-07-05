import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppActionsType, RequestStatusType, setAppError, setAppStatus} from "../../app/app-reducer";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case 'SET-TODOLIST-STATUS':
            return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.entityStatus} : tl)
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const setTodolistEntityStatusAC = (id: string, entityStatus: RequestStatusType) => ({type: 'SET-TODOLIST-STATUS', id, entityStatus} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsType | AppActionsType>) => {
        dispatch(setAppStatus('loading'))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC(res.data))
                dispatch(setAppStatus('succeeded'))
            })
            .catch(error => {
                dispatch(setAppError(error.message))
                dispatch(setAppStatus('failed'))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsType | AppActionsType>) => {
        dispatch(setAppStatus('loading'))
        dispatch(setTodolistEntityStatusAC(todolistId, 'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC(todolistId))
                dispatch(setAppStatus('succeeded'))
            })
            .catch( (error) => {
                dispatch(setTodolistEntityStatusAC(todolistId, 'failed'))
                dispatch(setAppError(error.message))
                dispatch(setAppStatus('failed'))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<ActionsType | AppActionsType>) => {
        dispatch(setAppStatus('loading'))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC(res.data.data.item))
                dispatch(setAppStatus('succeeded'))
            })
            .catch(error => {
                dispatch(setAppError(error.message))
                dispatch(setAppStatus('failed'))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType | AppActionsType>) => {
        dispatch(setAppStatus('loading'))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC(id, title))
                dispatch(setAppStatus('succeeded'))
            })
            .catch(error => {
                dispatch(setAppError(error.message))
                dispatch(setAppStatus('failed'))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | ReturnType<typeof setTodolistEntityStatusAC>
    | SetTodolistsActionType
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType,
    entityStatus: RequestStatusType

}
