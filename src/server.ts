import errorHandler from "errorhandler"
import bodyParser from "body-parser"
import express, { Request, Response } from "express"
import { createConnection, ConnectionManager, Repository } from "typeorm"
import "reflect-metadata"
import entities, { Boards, Tasks, Users, Sessions } from "./entities"
import { connect } from "http2"
import { STATUS_CODES } from "http"
import { request, get } from "https"
// import { getKanban } from './handlers'


createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "nicolemayo",
  password: "",
  database: "kanban",
  synchronize: true,
  logging: false,
  entities
}).then(async connection => {
  const app = express()
  app.set("port", process.env.PORT || 4000)
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(errorHandler())

  type Handler = (req: Request, res: Response) => void
  type HandlerWithUser = (req: Request, res: Response, session: Sessions) => void

  // checks to see if there is a current user. if no: returns error, if yes: executes route handler function
  function guarded(handler: HandlerWithUser): Handler  {
    return async(req: Request, res: Response) => {
      const token = req.headers.authorization
      const session = await connection.manager.findOne(Sessions, {token: token}, {relations: ["user"]})
      if (!session) {
        res.status(401).send({
          success: false,
          error: "not authorized"
        })
      } else {
        handler(req, res, session)
      }
    }
  }

  async function getBoards (user: Users) {
    const boards = await connection.manager.find(Boards, { where: { user: user }, order: { index: "ASC" }, relations: ["tasks"] })
    boards.forEach((board) => {
      board.tasks.sort((a, b) => {
        if (a.index < b.index) {
          return -1
        }
        if (a.index > b.index) {
          return 1
        }
        return 0
      })
    })
    return boards
  }

  function sendBoards(res: Response, boards: Array<Boards>) {
    res.send({
      success: true,
      boards: boards
    })
  }

  app.get("/checkForUser", guarded((req, res, user) => {
    res.send({ success: true })
  }))

  app.post("/login", async (req, res) => {
    const user = req.body.user
    const pswd = req.body.password

    const dbUser = await connection.manager.findOne(Users, { username: user, password: pswd })
    if (dbUser) {
      const sessionToken = Math.floor(Math.random() * (Math.pow(10, 15) - 1 + 1) + 1).toString()
      const sessionRepository = connection.getRepository(Sessions)
      const userSession = new Sessions()
      userSession.token = sessionToken
      userSession.user = dbUser
      await sessionRepository.save(userSession)
      res.send({
        success: true,
        token: sessionToken,
        loggingIn: true
      })
    } else {
      res.status(401).send({
        success: false
      })
    }
  })

  app.post("/signup", async(req, res) => {
    const username = req.body.username
    const password = req.body.password

    const dbUser = await connection.manager.findOne(Users, {username: username, password: password})
    if (!dbUser) {
      const user = new Users()
      user.username = username
      user.password = password
      await connection.manager.save([user])

      const newUser = await connection.manager.findOne(Users, {username: username, password: password})
      const sessionToken = Math.floor(Math.random() * (Math.pow(10, 15) - 1 + 1) + 1).toString()
      const userSession = new Sessions()
      userSession.token = sessionToken
      userSession.user = newUser
      await connection.manager.save(userSession)

      res.send({
        success: true,
        token: sessionToken
      })

    } else {
      res.status(401).send({
        success: false
      })
    }
  })

  app.get("/kanban", guarded(async (req, res, session) => {
    getBoards(session.user)
    .then(boards => sendBoards(res, boards))
  }))

  app.post("/addBoard", guarded(async (req, res, session) => {
    const boardTitle = req.body.name
    const currBoards = await connection.manager.find(Boards, {where: {user: session.user}})
    const index = currBoards.length
    const newBoard = new Boards()
    newBoard.name = boardTitle
    newBoard.index = index
    newBoard.user = session.user
    await connection.manager.save(newBoard)

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.delete("/deleteBoard", guarded(async (req, res, session) => {
    const boardID = req.body.id
    const boardToDelete = await connection.manager.findOne(Boards, { where: {user: session.user, id: boardID}, relations: ["tasks"] })
    const boardTasks = boardToDelete.tasks

    for (const task of boardTasks) {
      await connection.manager.remove(task)
    }

    await connection.manager.remove(boardToDelete)
    const boards = await connection.manager.find(Boards, {where: {user: session.user}})
    const boardsArr: Array<Boards> = []
    boards.forEach(async (board, i) => {
      board.index = i
      boardsArr.push(board)
    })
    await connection.manager.save(boardsArr)

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))


  app.post("/moveBoard/left", guarded(async (req, res, session) => {
    const currBoardID = req.body.boardID
    const currBoard = await connection.manager.findOne(Boards, currBoardID)
    const leftBoard = await connection.manager.findOne(Boards, {where: { user: session.user, index: currBoard.index - 1}})

    currBoard.index = currBoard.index - 1
    leftBoard.index = leftBoard.index + 1
    await connection.manager.save([currBoard, leftBoard])

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.post("/moveBoard/right", guarded(async (req, res, session) => {
    const currBoardID = req.body.boardID
    const currBoard = await connection.manager.findOne(Boards, currBoardID)
    const rightBoard = await connection.manager.findOne(Boards, { where: { user: session.user, index: currBoard.index + 1 } })
    currBoard.index = currBoard.index + 1
    rightBoard.index = rightBoard.index - 1
    await connection.manager.save([currBoard, rightBoard])

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.post("/addTask", guarded(async (req, res, session) => {
    const text = req.body.text
    const firstBoard = await connection.manager.findOne(Boards, { where: { user: session.user,  index: 0 } })
    const currTasks = await connection.manager.find(Tasks, { board: firstBoard })
    const taskIndex = currTasks.length

    const newTask = new Tasks()
    newTask.text = text
    newTask.board = firstBoard
    newTask.index = taskIndex
    await connection.manager.save(newTask)

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.delete("/deleteTask", guarded(async (req, res, session) => {
    const taskID = req.body.taskID
    const taskRepository = await connection.getRepository(Tasks)
    const currTask = await taskRepository.findOne(taskID, { relations: ["board"] })
    const currBoard = currTask.board
    await taskRepository.delete(taskID)

    const currTasks = await taskRepository.find({ board: currBoard })
    // re-index tasks
    const promiseArr = []
    for (let i = 0; i < currTasks.length; i++) {
      const task = currTasks[i]
      task.index = i
      const promise = await connection.manager.save(task)
      promiseArr.push(promise)
    }
    Promise.all(promiseArr)

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.post("/moveTask/right", guarded(async(req, res, session) => {
    const taskID = req.body.taskID
    const currTask = await connection.manager.findOne(Tasks, taskID, { relations: ["board"] })
    const currBoard = currTask.board
    const targetBoard = await connection.manager.findOne(Boards, { where: { user: session.user, index: currBoard.index + 1}})
    const targetBoardTasks = await connection.manager.find(Tasks, {board: targetBoard})

    currTask.board = targetBoard
    currTask.index = targetBoardTasks.length
    await connection.manager.save(currTask)

    // re-index previous board's tasks
    const formerBoard = await connection.manager.findOne(Boards, { where: { user: session.user, index: currTask.board.index - 1}})
    const formerBoardTasks = await connection.manager.find(Tasks, {board: formerBoard})
    const taskArr: Array<Tasks> = []
    formerBoardTasks.forEach(async(task, i) => {
      task.index = i
      taskArr.push(task)
    })
    await connection.manager.save(taskArr)

    getBoards(session.user)
    .then(boards => sendBoards(res, boards))
  }))

  app.post("/moveTask/left", guarded(async (req, res, session) => {
    const taskID = req.body.taskID
    const currTask = await connection.manager.findOne(Tasks, taskID, { relations: ["board"] })
    const currBoard = currTask.board
    const targetBoard = await connection.manager.findOne(Boards, { where: { user: session.user, index: currBoard.index - 1 } })
    const targetBoardTasks = await connection.manager.find(Tasks, { board: targetBoard })

    currTask.board = targetBoard
    currTask.index = targetBoardTasks.length
    await connection.manager.save(currTask)

    // re-index previous board's tasks
    const formerBoard = await connection.manager.findOne(Boards, { where: { user: session.user, index: currTask.board.index + 1 } })
    const formerBoardTasks = await connection.manager.find(Tasks, { board: formerBoard })
    const taskArr: Array<Tasks> = []
    formerBoardTasks.forEach(async (task, i) => {
      task.index = i
      taskArr.push(task)
    })
    await connection.manager.save(taskArr)

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))


  app.post("/moveTask/up", guarded(async (req, res, session) => {
    const taskID = req.body.taskID
    const currTask = await connection.manager.findOne(Tasks, taskID, { relations: ["board"] })
    const currBoard = currTask.board
    const prevTask = await connection.manager.findOne(Tasks, { board: currBoard, index: currTask.index - 1 })

    await connection.manager.update(Tasks, taskID, {index: currTask.index - 1})
    await connection.manager.update(Tasks, prevTask.id, {index: prevTask.index + 1})

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.post("/moveTask/down", guarded(async (req, res, session) => {
    const taskID = req.body.taskID
    const currTask = await connection.manager.findOne(Tasks, taskID, { relations: ["board"] })
    const currBoard = currTask.board
    const nextTask = await connection.manager.findOne(Tasks, { board: currBoard, index: currTask.index + 1 })

    await connection.manager.update(Tasks, taskID, { index: currTask.index + 1 })
    await connection.manager.update(Tasks, nextTask.id, { index: currTask.index })

    getBoards(session.user)
      .then(boards => sendBoards(res, boards))
  }))

  app.post("/logout", guarded(async (req, res, session) => {
    const sessionRepository = connection.getRepository(Sessions)
    await sessionRepository.remove(session)
    .then((response) => {
      res.send({
        success: true
      })
    }).catch((error) => console.log(error))
  }))

  app.listen(app.get("port"), () => {
    console.log(
      "App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    )
    console.log("  Press CTRL-C to stop\n")
  })
}).catch(error => console.log("TypeORM connection error: ", error))
