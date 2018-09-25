import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from "typeorm"
// import { Session } from "inspector"

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number
  @Column({select: false})
  username: string
  @Column({select: false})
  password: string
  @OneToMany(() => Boards, boards => boards.user)
  boards: Boards[]
  @OneToMany(() => Sessions, session => session.token)
  sessions: Sessions[]
}

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn()
  id: number
  @Column({nullable: true})
  token: string
  @ManyToOne(() => Users, {nullable: false})
  user: Users
}

@Entity()
export class Boards {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ nullable: false })
  index: number
  @Column({ nullable: true })
  name: string
  @OneToMany(() => Tasks, task => task.board)
  tasks: Tasks[]
  @ManyToOne(() => Users, user => user.boards, {nullable: false})
  user: Users
}

@Entity()
export class Tasks {
  @PrimaryGeneratedColumn()
  id: number
  @ManyToOne(() => Boards, board => board.tasks)
  board: Boards
  @Column({ nullable: false })
  index: number
  @Column({ nullable: true })
  text: string
}

export default [Boards, Tasks, Users, Sessions]

