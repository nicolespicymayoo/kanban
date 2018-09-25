import { Connection } from "typeorm"
import { Boards } from "./entities"
import { Response, Request } from "express"

export const getKanban = (connection: Connection) => async(req: Request, res: Response) => {
  const boards = await connection.manager.find(Boards)
  res.send(boards)
}