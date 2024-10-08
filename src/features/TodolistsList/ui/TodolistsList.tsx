import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "common/components"
import { useAppDispatch } from "common/hooks"
import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { selectIsLoggedIn } from "features/auth/model/authSlice"
import { selectTasks, tasksThunks } from "features/todolistsList/model/tasksSlice"
import { Todolist } from "features/todolistsList/ui/Todolist/Todolist"
import { FilterValuesType, selectTodolists, todolistsActions, todolistsThunks } from "features/todolistsList/model/todolistsSlice"

export const TodolistsList = () => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }
    dispatch(todolistsThunks.fetchTodolists())
  }, [])

  // const removeTask = useCallback(function (taskId: string, todolistId: string) {
  //   dispatch(tasksThunks.removeTask({ taskId, todolistId }))
  // }, [])


  const addTodolist = useCallback((title: string) => {
    return dispatch(todolistsThunks.addTodolist(title))
  }, [])

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
