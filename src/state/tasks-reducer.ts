import { TasksStateType } from '../App';
import { v1 } from 'uuid';
import {
    addTodolistAC,
    AddTodolistActionType, changeTodolistTitleAC, FilterValuesType,
    removeTodolistAC,
    RemoveTodolistActionType,
    SetTodosType
} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {AppRootStateType} from "./store";
import {Dispatch} from "redux";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    todolistId: string
    task: TaskType
}

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}
export type setTasksType = {
    type: 'SET-TASKS',
    todolistId: string
    tasks: TaskType[]
}
export type UpdateTaskActionType = {
    type: 'UPDATE-TASK',
    todolistId: string
    taskId: string
    task: TaskType
}


type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodosType
    | setTasksType
    | UpdateTaskActionType


const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            const stateCopy = {...state}
            // const newTask: TaskType = {
            //     id: v1(),
            //     title: action.title,
            //     status: TaskStatuses.New,
            //     todoListId: action.todolistId, description: '',
            //     startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            // }
            const tasks = stateCopy[action.todolistId];
            const newTasks = [action.task, ...tasks];
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolistId]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        case 'SET-TODOS': {
            const stateCopy = {...state}
            action.todos.forEach(t =>
                stateCopy[t.id] = []
            )
            // action.todos.reduce((acc, current) => {
            //     acc[current.id] = []
            //     return acc
            // }, {} as TasksStateType)
            return stateCopy
        }
        case 'UPDATE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId]
            const newTasks = tasks.map(t => t.id !== action.taskId ? t : action.task)
            stateCopy[action.todolistId] = newTasks
            return stateCopy
        }
        case 'SET-TASKS': {
            return {...state, [action.todolistId]: action.tasks}
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType, todolistId: string): AddTaskActionType => {
    return {type: 'ADD-TASK', task, todolistId}
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}
export const setTasksAC = (todolistId: string, tasks: TaskType[]) => {
    return {type: 'SET-TASKS', todolistId, tasks} as const
}
export const updateTaskAC = (todolistId: string, taskId: string, task: TaskType) => {
    return {type: 'UPDATE-TASK', todolistId, taskId, task} as const
}


///thunsk

export const getTasksTC = (todolistId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.getTasks(todolistId).then(res => {
        const tasks = res.data.items
        dispatch(setTasksAC(todolistId, tasks))
    })
}
export const removeTasksTC = (todolistId: string, taskId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.deleteTask(todolistId, taskId).then(res => {
        const action = removeTaskAC(taskId, todolistId)
        dispatch(action)
    })
}
export const addTaskTC = (todolistId: string, title: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.createTask(todolistId, title).then(res => {
        const task = res.data.data.item
        dispatch(addTaskAC(task, todolistId))
    })
}
export const updateTaskStatusTC = (todolistId: string, taskId: string, status: TaskStatuses) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistId].find(task => task.id === taskId)
    if (!task) return

    const model: UpdateTaskModelType = {
        title: task.title,
        status,
        deadline: task.deadline,
        startDate: task.startDate,
        priority: task.priority,
        description: task.description
    }
    todolistsAPI.updateTask(todolistId, taskId, model).then(res => {
        const task = res.data.data.item
        dispatch(changeTaskStatusAC(taskId, status, todolistId))
    })
}
export const updateTaskTC = (todolistId: string, taskId: string, updateModel: Partial<UpdateTaskModelType>) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistId].find(task => task.id === taskId)
    if (!task) return

    const model: UpdateTaskModelType = {
        title: task.title,
        status: task.status,
        deadline: task.deadline,
        startDate: task.startDate,
        priority: task.priority,
        description: task.description,
        ...updateModel
    }
    todolistsAPI.updateTask(todolistId, taskId, model).then(res => {
        const task = res.data.data.item
        dispatch(updateTaskAC(todolistId, taskId, task))
    })
}
export const removeTodolistsTC = (todolistId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.deleteTodolist(todolistId).then(res => {
        const action = removeTodolistAC(todolistId)
        dispatch(action)
    })
}
export const addTodolistTC = (title: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.createTodolist(title).then(res => {
        const todolist = addTodolistAC(title)
        dispatch(todolist)
    })
}
export const changeTaskTitleTC = (id: string, title: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    todolistsAPI.updateTodolist(id, title).then(res => {
        const changeTask = changeTodolistTitleAC(id, title)
        dispatch(changeTask)
    })
}
