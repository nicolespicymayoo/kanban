"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
require("reflect-metadata");
const entities_1 = __importStar(require("./entities"));
// import { getKanban } from './handlers'
typeorm_1.createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "nicolemayo",
    password: "",
    database: "kanban",
    synchronize: true,
    logging: false,
    entities: entities_1.default
}).then(async (connection) => {
    const app = express_1.default();
    app.set("port", process.env.PORT || 4000);
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(errorhandler_1.default());
    // checks to see if there is a current user. if no: returns error, if yes: executes route handler function
    function guarded(handler) {
        return async (req, res) => {
            const token = req.headers.authorization;
            const session = await connection.manager.findOne(entities_1.Sessions, { token: token }, { relations: ["user"] });
            if (!session) {
                res.status(401).send({
                    success: false,
                    error: "not authorized"
                });
            }
            else {
                handler(req, res, session);
            }
        };
    }
    async function getBoards(user) {
        const boards = await connection.manager.find(entities_1.Boards, { where: { user: user }, order: { index: "ASC" }, relations: ["tasks"] });
        boards.forEach((board) => {
            board.tasks.sort((a, b) => {
                if (a.index < b.index) {
                    return -1;
                }
                if (a.index > b.index) {
                    return 1;
                }
                return 0;
            });
        });
        return boards;
    }
    function sendBoards(res, boards) {
        res.send({
            success: true,
            boards: boards
        });
    }
    app.get("/checkForUser", guarded((req, res, user) => {
        res.send({ success: true });
    }));
    app.post("/login", async (req, res) => {
        const user = req.body.user;
        const pswd = req.body.password;
        const dbUser = await connection.manager.findOne(entities_1.Users, { username: user, password: pswd });
        if (dbUser) {
            const sessionToken = Math.floor(Math.random() * (Math.pow(10, 15) - 1 + 1) + 1).toString();
            const sessionRepository = connection.getRepository(entities_1.Sessions);
            const userSession = new entities_1.Sessions();
            userSession.token = sessionToken;
            userSession.user = dbUser;
            await sessionRepository.save(userSession);
            res.send({
                success: true,
                token: sessionToken
            });
        }
        else {
            res.status(401).send({
                success: false
            });
        }
    });
    app.post("/signup", async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const dbUser = await connection.manager.findOne(entities_1.Users, { username: username, password: password });
        if (!dbUser) {
            const user = new entities_1.Users();
            user.username = username;
            user.password = password;
            await connection.manager.save([user]);
            const newUser = await connection.manager.findOne(entities_1.Users, { username: username, password: password });
            const sessionToken = Math.floor(Math.random() * (Math.pow(10, 15) - 1 + 1) + 1).toString();
            const userSession = new entities_1.Sessions();
            userSession.token = sessionToken;
            userSession.user = newUser;
            await connection.manager.save(userSession);
            res.send({
                success: true,
                token: sessionToken
            });
        }
        else {
            res.status(401).send({
                success: false
            });
        }
    });
    app.get("/kanban", guarded(async (req, res, session) => {
        getBoards(session.user)
            .then(boards => sendBoards(res, boards));
    }));
    app.post("/addBoard", guarded(async (req, res, session) => {
        const boardTitle = req.body.name;
        const currBoards = await connection.manager.find(entities_1.Boards, { where: { user: session.user } });
        console.log("curr boards length", currBoards);
        const index = currBoards.length;
        const newBoard = new entities_1.Boards();
        newBoard.name = boardTitle;
        newBoard.index = index;
        newBoard.user = session.user;
        await connection.manager.save(newBoard);
        getBoards(session.user)
            .then(boards => sendBoards(res, boards));
    }));
    app.delete("/deleteBoard", guarded(async (req, res, session) => {
        const boardID = req.body.id;
        const boardToDelete = await connection.manager.findOne(entities_1.Boards, { where: { user: session.user, id: boardID }, relations: ["tasks"] });
        const boardTasks = boardToDelete.tasks;
        for (const task of boardTasks) {
            await connection.manager.remove(task);
        }
        await connection.manager.remove(boardToDelete);
        const boards = await connection.manager.find(entities_1.Boards, { where: { user: session.user } });
        const boardsArr = [];
        boards.forEach(async (board, i) => {
            board.index = i;
            boardsArr.push(board);
        });
        await connection.manager.save(boardsArr);
        getBoards(session.user)
            .then(boards => sendBoards(res, boards));
    }));
    app.post("/moveBoard", guarded(async (req, res, session) => {
        const currBoardID = req.body.boardID;
        const direction = req.body.direction;
        const currBoard = await connection.manager.findOne(entities_1.Boards, currBoardID);
        const rightBoard = await connection.manager.findOne(entities_1.Boards, { where: { index: currBoard.index + 1 } });
        const leftBoard = await connection.manager.findOne(entities_1.Boards, { where: { index: currBoard.index - 1 } });
        if (direction === "right") {
            currBoard.index = currBoard.index + 1;
            rightBoard.index = rightBoard.index - 1;
            await connection.manager.save([currBoard, rightBoard]);
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
        if (direction === "left") {
            currBoard.index = currBoard.index - 1;
            leftBoard.index = leftBoard.index + 1;
            await connection.manager.save([currBoard, leftBoard]);
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
    }));
    app.post("/addTask", guarded(async (req, res, session) => {
        const text = req.body.text;
        const firstBoard = await connection.manager.findOne(entities_1.Boards, { where: { user: session.user, index: 0 } });
        const currTasks = await connection.manager.find(entities_1.Tasks, { board: firstBoard });
        const taskIndex = currTasks.length;
        const newTask = new entities_1.Tasks();
        newTask.text = text;
        newTask.board = firstBoard;
        newTask.index = taskIndex;
        await connection.manager.save(newTask);
        getBoards(session.user)
            .then(boards => sendBoards(res, boards));
    }));
    app.delete("/deleteTask", guarded(async (req, res, session) => {
        const taskID = req.body.taskID;
        const taskRepository = await connection.getRepository(entities_1.Tasks);
        const currTask = await taskRepository.findOne(taskID, { relations: ["board"] });
        const currBoard = currTask.board;
        await taskRepository.delete(taskID);
        const currTasks = await taskRepository.find({ board: currBoard });
        // re-index tasks
        const promiseArr = [];
        for (let i = 0; i < currTasks.length; i++) {
            const task = currTasks[i];
            task.index = i;
            const promise = await connection.manager.save(task);
            promiseArr.push(promise);
        }
        Promise.all(promiseArr);
        getBoards(session.user)
            .then(boards => sendBoards(res, boards));
    }));
    app.post("/moveTask", guarded(async (req, res, session) => {
        const direction = req.body.direction;
        const taskID = req.body.taskID;
        const currTask = await connection.manager.findOne(entities_1.Tasks, taskID, { relations: ["board"] });
        const currBoard = currTask.board;
        const currBoardTasks = await connection.manager.find(entities_1.Tasks, { board: currBoard });
        if (direction == "right") {
            // change the current task's board id to the id of the board to the right (targetBoard)
            const targetBoard = await connection.manager.findOne(entities_1.Boards, { index: currBoard.index + 1 });
            const targetBoardTasks = await connection.manager.find(entities_1.Tasks, { board: targetBoard });
            currTask.board = targetBoard;
            currTask.index = targetBoardTasks.length;
            await connection.manager.save(currTask);
            const prevBoard = await connection.manager.findOne(entities_1.Boards, { index: currTask.board.index - 1 });
            const prevBoardTasks = await connection.manager.find(entities_1.Tasks, { board: prevBoard });
            // const tasksRepository = await connection.manager.find(Tasks)
            // await prevBoardTasks.forEach(async (task, i) => {
            //   task.index = i
            //   await connection.manager.save(task)
            //   // const allTasks = await connection.manager.find(Tasks)
            // })
            const taskArr = [];
            prevBoardTasks.forEach(async (task, i) => {
                task.index = i;
                taskArr.push(task);
            });
            await connection.manager.save(taskArr);
            // await connection.manager.save(prevBoard.tasks)
            // const newBoard = await connection.manager.findOne(Boards, { where: { user: user, id: prevBoard.id }})
            // const newBoardTasks = await connection.manager.find(Tasks, { board: newBoard })
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
        if (direction == "left") {
            // change the current tasks's board id to the id of the board to the left (targetBoard)
            const targetBoard = await connection.manager.findOne(entities_1.Boards, { index: currBoard.index - 1 });
            const targetBoardTasks = await connection.manager.find(entities_1.Tasks, { board: targetBoard });
            const prevTaskIndex = currTask.index;
            // change current task's index to be the last item on the target board
            // const updatedTask = await connection.manager.update(Tasks, taskID, { board: targetBoard, index: targetBoardTasks.length})
            currTask.board = targetBoard;
            currTask.index = targetBoardTasks.length;
            await connection.manager.save(currTask);
            const prevBoard = await connection.manager.findOne(entities_1.Boards, { where: { user: session.user, index: currTask.board.index + 1 } });
            const prevBoardTasks = await connection.manager.find(entities_1.Tasks, { board: prevBoard });
            const taskArr = [];
            prevBoardTasks.forEach(async (task, i) => {
                task.index = i;
                taskArr.push(task);
            });
            await connection.manager.save(taskArr);
            // console.log("PREV BOARD", prevBoard)
            // console.log("PREV BOARD TASKS", prevBoard.tasks)
            //   prevBoardTasks.forEach(async (task, i) => {
            //     console.log(i)
            //     console.log(task.index)
            //     task.index = i
            //     await connection.manager.save(task)
            //   })
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
        if (direction == "up") {
            // find the current task & find the task at the previous index
            const prevTask = await connection.manager.findOne(entities_1.Tasks, { board: currBoard, index: currTask.index - 1 });
            await connection.manager.update(entities_1.Tasks, taskID, { index: currTask.index - 1 });
            await connection.manager.update(entities_1.Tasks, prevTask.id, { index: currTask.index });
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
        if (direction == "down") {
            // find the task at currtask index + 1
            const nextTask = await connection.manager.findOne(entities_1.Tasks, { board: currBoard, index: currTask.index + 1 });
            await connection.manager.update(entities_1.Tasks, taskID, { index: currTask.index + 1 });
            await connection.manager.update(entities_1.Tasks, nextTask.id, { index: currTask.index });
            getBoards(session.user)
                .then(boards => sendBoards(res, boards));
        }
    }));
    app.post("/logout", guarded(async (req, res, session) => {
        console.log("session passed from guarded", session);
        const sessionRepository = connection.getRepository(entities_1.Sessions);
        await sessionRepository.remove(session)
            .then((response) => {
            console.log("respoonse after delete", response);
            res.send({
                success: true
            });
        }).catch((error) => console.log(error));
    }));
    app.listen(app.get("port"), () => {
        console.log("App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
        console.log("  Press CTRL-C to stop\n");
    });
}).catch(error => console.log("TypeORM connection error: ", error));
//# sourceMappingURL=server.js.map