import { randomUUID } from "node:crypto"
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      }: null)

      return res.end(JSON.stringify(tasks))
    } 
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) {
        return res.writeHead(400).end(JSON.stringify({
          error: "Provide the task's title"
        }))
      }

      if (!description) {
        return res.writeHead(400).end(JSON.stringify({
          error: "Provide the task's description"
        }))
      }

      const newTask = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', newTask)

      return res.end(JSON.stringify(newTask))
    } 
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title && !description) {
        return res.writeHead(400).end(JSON.stringify({
          error: 'You need to provide title or description to be updated.'
        }))
      }

      const [selectedTask] = database.select('tasks', { id })

      if (!selectedTask)
        return res.writeHead(404).end()

      database.update('tasks', id, {
        title: title ?? selectedTask.title,
        description: description ?? selectedTask.description,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [selectedTask] = database.select('tasks', { id })

      if (!selectedTask) {
        return res.writeHead(404).end()
      }

      database.update('tasks', id, {
        completed_at: !!selectedTask.completed_at ? null : new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [selectedTask] = database.select('tasks', { id })

      if (!selectedTask)
        return res.writeHead(404).end()

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  }
]
