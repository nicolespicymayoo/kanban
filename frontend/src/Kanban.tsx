import * as React from 'react';
import './App.css'
import Task from './Task'
import { fetchGET, fetchPOST, fetchDELETE } from './fetchAPI'
import styled from 'styled-components'

export type Board = {
  id: number,
  name: string,
  index: number,
  tasks: Array<{ id: number, index: number, text: string }>
}

interface State {
  boards: Array<Board>
  newBoardTitle: string
  newTaskValue: string
  isLoading: boolean,
  displayBanner: boolean,
  dislpayLoginMsg: boolean,
  dislpaySignupMsg: boolean
}

type Res = {
  success: boolean,
  boards: Array<Board>
}

class Kanban extends React.Component<{}, State> {
  state: State = {
    boards: [],
    newBoardTitle: '',
    newTaskValue: '',
    isLoading: true,
    displayBanner: false,
    dislpayLoginMsg: false,
    dislpaySignupMsg: false
  }

  componentDidMount() {
    const loggingIn = localStorage.getItem('loggingIn')
    const signedUp = localStorage.getItem('signedUp')
    if (loggingIn == 'true') {
      this.setState({displayBanner: true, dislpayLoginMsg: true})
      localStorage.setItem('loggingIn', 'false')
      setTimeout(() => {
        this.setState({ displayBanner: false, dislpayLoginMsg: false })
      }, 4000);
    }
    if (signedUp == 'true') {
      this.setState({ displayBanner: true, dislpaySignupMsg: true })
      localStorage.setItem('signedUp', 'false')
      setTimeout(() => {
        this.setState({ displayBanner: false, dislpaySignupMsg: false })
      }, 4000);
    }
    fetchGET('/kanban')
      .then(response => response.json())
      .then((res: Res) => {
        if (res.success) {
          this.setState({ boards: res.boards, isLoading: false})
        }
      }).catch(error => console.log(error))
  }

  addBoard = () => {
    const boardTitle = this.state.newBoardTitle
    fetchPOST('/addBoard', {name: boardTitle})
      .then(response => response.json()
      ).then((res: Res) => this.setState({ 
        boards: res.boards, 
        newBoardTitle: '' 
      }))
      .catch(error => console.log(error))
  }

  updateNewBoardName = (value: string) => {
    this.setState({ newBoardTitle: value })
  }

  updateNewTaskName = (value: string) => {
    this.setState({
      newTaskValue: value
    })
  }

  deleteBoard = (boardID: number) => {
    fetchDELETE('/deleteBoard', {id: boardID})
      .then(response => response.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))
  }


  moveBoardLeft = (boardID: number) => {
    fetchPOST('/moveBoard/left', {
      boardID: boardID,
    }).then(response => response.json())
      .then((res: Res) => this.setState({boards: res.boards}))
    .catch(error => console.log(error))
  }

  moveBoardRight = (boardID: number) => {
    fetchPOST('/moveBoard/right', {
      boardID: boardID,
    }).then(response => response.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))
  }

  addTask = () => {
    let text = this.state.newTaskValue
    fetchPOST('/addTask', {text: text})
      .then(res => res.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))

    this.setState({ newTaskValue: '' })
  }

  moveTaskLeft = (taskID: number) => {
    fetchPOST('/moveTask/left', {
      taskID: taskID
    }).then(response => response.json())
      .then((res: Res) => {
        this.setState({ boards: res.boards })
      }
    ).catch(error => console.log(error))
  }

  moveTaskRight = (taskID: number) => {
    fetchPOST('/moveTask/right', {
      taskID: taskID,
    }).then(response => response.json())
      .then((res: Res) => {
        this.setState({ boards: res.boards })
      }
    ).catch(error => console.log(error))
  }

  moveTaskUp = (taskID: number) => {
    fetchPOST('/moveTask/up', {
      taskID: taskID,
    }).then(response => response.json())
      .then((res: Res) => {
        this.setState({ boards: res.boards })
      }
    ).catch(error => console.log(error))
  }

  moveTaskDown = (taskID: number) => {
    fetchPOST('/moveTask/down', {
      taskID: taskID,
    }).then(response => response.json())
      .then((res: Res) => {
        this.setState({ boards: res.boards })
      }
    ).catch(error => console.log(error))
  }

  deleteTask = (taskID: number) => {
    fetchDELETE('deleteTask', { taskID: taskID })
      .then(response => response.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))
  }

  checkEnter = (e: React.KeyboardEvent, target: string) => {
    console.log(e)
    if (e.keyCode == 13) {
      if (target === 'task') {
        this.addTask()
      }
      if (target === 'board') {
        this.addBoard()
      }
    }
  }

  hideBanner = () => {
    this.setState({ displayBanner: false })
  }

  logout = () => {
    console.log('logout activated')
    fetchPOST('/logout', {})
    .then(response => response.json())
      .then((res: Res) => {
      if(res.success){
        localStorage.removeItem('token')
        location.href = '/login'
      }
    }).catch(error => console.log(error))
  }

  render() {
    if(this.state.isLoading){
      return null
    }
    
    return (
        <KanbanContainer>
            {this.state.displayBanner ? 
              <WelcomeBanner>
                <BannerText>
                  {this.state.dislpayLoginMsg ? 'Welcome back!' : null}
                  {this.state.dislpaySignupMsg ? 'Welcome!' : null}
                </BannerText>
              <HideBannerButton onClick={this.hideBanner}>✕</HideBannerButton>
              </WelcomeBanner> 
            : null}
            <LogoutButton onClick={this.logout}>log out</LogoutButton>
            <Title>My Kanban</Title>
            <AddContentForm>
                  {/* value = this.state.value to reset task value to '' after submitting a task */}
              <FormInput placeholder='New Board' onChange={e => this.updateNewBoardName(e.target.value)} value={this.state.newBoardTitle} onKeyDown={e => this.checkEnter(e, 'board')} />
              <FormButton onClick={this.addBoard}>Add Board</FormButton>
            </AddContentForm>
            <AddContentForm>
              <FormInput placeholder='New Task' value={this.state.newTaskValue} onChange={(e) => this.updateNewTaskName(e.target.value)} onKeyDown={e => this.checkEnter(e, 'task')} />
              <FormButton onClick={this.addTask}>Add Task</FormButton>
            </AddContentForm>
         
            <BoardsContainer>
              {this.state.boards.map((board, boardIndex) =>
                <Board key={boardIndex}>
                  <BoardTitle>{board.name}</BoardTitle>
                  <BoardControls>
                    {boardIndex > 0 ? <BoardButton onClick={() => this.moveBoardLeft(board.id)}> ⇦ </BoardButton> : null}
                    {boardIndex < this.state.boards.length - 1 ? <BoardButton onClick={() => this.moveBoardRight(board.id)}> ⇨ </BoardButton> : null}
                    <BoardButton onClick={() => this.deleteBoard(board.id)}>✕</BoardButton>
                  </BoardControls>
                  {board.tasks.map((task, taskIndex) => (
                      <Task
                        text={task.text}
                        taskID={task.id}
                        taskIndex={taskIndex}
                        boardIndex={boardIndex}
                        boardLength={this.state.boards[0].tasks.length}
                        moveRight={this.moveTaskRight}
                        moveLeft={this.moveTaskLeft}
                        moveUp={this.moveTaskUp}
                        moveDown={this.moveTaskDown}
                        deleteTask={this.deleteTask}
                      /> 
                  ))}
                </Board>
              )}
            </BoardsContainer>
        </KanbanContainer>
    )
  }
}

export default Kanban

const KanbanContainer = styled.div`
  font-family: 'helvetica';
  font-weight: 200;
  padding: 80px 20px 20px;
`

const WelcomeBanner = styled.div`
  position: absolute; 
  left: 0;
  right: 0;
  top: 0;
  margin: auto;
  padding: 10px 30px;
  width: 220px;
  background-color: rgba(82, 194, 250, .5);
  color: white;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgba(42, 152, 247, .8);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
`

const BannerText = styled.p`
  display: inline-block;
  letter-spacing: .05em;
  margin: 10px;
  vertical-align: bottom;
`

const HideBannerButton = styled.div`
  margin: 4px;
  border-radius: 3px;
  font-size: 10px;
  color: white;
  background-color: none;
  display: inline-block;
  vertical-align: bottom;
  margin: 10px;
`

const Title = styled.h2`
  font-weight: 200;
  margin-bottom: 15px;
`
const LogoutButton = styled.button`
  float: right;
  padding: 4px 6px;
  border-radius: 5px;
  vertical-align: top;
`
const AddContentForm = styled.div`
  display: inline;
  margin-right: 22px;
`
const FormInput = styled.input`
  padding: 6px;
  width: 280px;
`
const FormButton = styled.button`
  -webkit-appearance: none;
  padding: 6px;
  margin: 4px;
  border-radius: 3px;
`
const BoardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 35px;
`
const Board = styled.div`
  margin: 10px 4px;
  width: 280px;
  border: 1px solid black;
  border-radius: 5px;
  padding: 15px 20px 25px;
`
const BoardTitle = styled.h3`
  float: left;
  font-weight: 200;
`

const BoardControls = styled.div`
  float: right;
  padding: 20px;
`

const BoardButton = styled.button`
  vertical-align: middle;
`