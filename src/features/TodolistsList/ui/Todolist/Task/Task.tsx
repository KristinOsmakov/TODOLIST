import React, { ChangeEvent, useCallback } from "react"
import { Checkbox, IconButton } from "@mui/material"
import { Delete } from "@mui/icons-material"
import { EditableSpan } from "common/components"
import { TaskStatuses } from "common/enums"
import { TaskType } from "features/todolistsList/api/tasksApi.types";
import { useAppDispatch } from "common/hooks";
import { tasksThunks } from "features/todolistsList/model/tasksSlice";


type TaskPropsType = {
  task: TaskType
  todolistId: string
}



export const Task = (props: TaskPropsType) => {
  const dispatch = useAppDispatch()

  const onClickHandler = () => {
    dispatch(tasksThunks.removeTask({ taskId: props.task.id, todolistId: props.todolistId }));
    }


  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    let status = e.currentTarget.checked ? TaskStatuses.Completed : TaskStatuses.New
      dispatch(
        tasksThunks.updateTask({
          taskId: props.task.id,
          domainModel: { status: status },
          todolistId: props.todolistId }))
    }


  const onTitleChangeHandler = (newValue: string) => {
      dispatch(
        tasksThunks.updateTask({
        taskId: props.task.id,
        domainModel: { title: newValue },
        todolistId: props.todolistId }))
    }

  return (
    <div key={props.task.id} className={props.task.status === TaskStatuses.Completed ? "is-done" : ""}>
      <Checkbox checked={props.task.status === TaskStatuses.Completed} color="primary" onChange={onChangeHandler} />

      <EditableSpan value={props.task.title} onChange={onTitleChangeHandler} />
      <IconButton onClick={onClickHandler}>
        <Delete />
      </IconButton>
    </div>
  )
}
