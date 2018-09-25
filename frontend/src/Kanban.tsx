import * as React from 'react';
// import produce from 'immer'
import './App.css'
// import TaskComponent from './Task'
import fetchAPI from './fetchAPI'

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
  isLoading: boolean
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
    isLoading: true
  }


  componentDidMount() {
    const sessionID = localStorage.getItem('sessionToken')
    fetch('/kanban', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionID || ''
      }
    })
      .then(response => response.json())
      .then((res: Res) => {
        if (res.success) {
          this.setState({ boards: res.boards, isLoading: false})
        }
      }).catch(error => console.log(error))
  }

  // fetchAPI = (url: string, method: string, params: { [key: string]: any}) => {
  //   const token = localStorage.getItem('sessionToken')
  //   return fetch(url, {
  //     method,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': token || ''
  //     },
  //     body: JSON.stringify(params)
  //   })
  // }

  addBoard = () => {
    const boardTitle = this.state.newBoardTitle
    fetchAPI('/addBoard', 'POST', {name: boardTitle})
      .then(response => response.json()
      ).then((res: Res) => this.setState({ 
        boards: res.boards, 
        newBoardTitle: '' 
      }))
      .catch(error => console.log(error))

    // this.setState({
    //   newBoardTitle: ''
    // })
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
    fetchAPI('/deleteBoard', 'DELETE', {id: boardID})
      .then(response => response.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))

    // this.setState(
    //   produce(this.state, draft => {
    //     draft.boards.splice(boardIndex, 1)
    //     draft.boardNames.splice(boardIndex, 1)
    //   })
    // )
  }

  moveBoardRight = (boardID: number, direction: string) => {
    fetchAPI('/moveBoard', 'POST', {
      boardID: boardID,
      direction: direction
    })
    .then(response => response.json())
      .then((res: Res) => this.setState({boards: res.boards}))
    .catch(error => console.log(error))
  }

  moveBoardLeft = (boardID: number, direction: string) => {
    console.log(boardID)
    fetchAPI('/moveBoard', 'POST', {
      boardID: boardID,
      direction: direction
    }).then(response => response.json())
      .then((res: Res) => this.setState({boards: res.boards}))
    .catch(error => console.log(error))
  }

  addTask = () => {
    let text = this.state.newTaskValue
    fetchAPI('/addTask', 'POST', {text: text})
      .then(res => res.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
      .catch(error => console.log(error))

    this.setState({ newTaskValue: '' })

    // with immutable javascript:----------------------------
    // const newBoard = [...this.state.boards[0], this.state.newTaskValue]
    // const newState = [...this.state.boards]

    // newState[0] = newBoard

    // this.setState({
    //   boards: newState
    // })

    // with immer: ----------------------------
    // immer's produce func is a function that takes a callback function with two args: the curr state and the draft. draft is a copy? of the state which we will mutate
    // let taskVal:string
    // if(this.state.newTaskValue === ''){
    //   if(this.state.boards[0].length == 0){
    //     taskVal = 'new task'
    //   }else{
    //     taskVal = 'new task' + this.state.boards[0].length
    //   }

    // }else{
    //   taskVal = this.state.newTaskValue
    // }

    // let boardTitle: string
    // if(this.state.newBoardTitle === ''){
    //   boardTitle = 'new board'
    // }else{
    //   boardTitle = this.state.newBoardTitle
    // }
    // if(this.state.boards.length < 1){
    //   this.addBoard()
    //   this.setState(
    //     produce(this.state, draft => {
    //       draft.boardNames.push(boardTitle)
    //       draft.boards.push([taskVal])

    //     }))
    // } else {
    //   this.setState( 
    //     produce(this.state, draft => {
    //       draft.boards[0].push(taskVal)
    //   }))
    // }
    // this.setState({
    //   newTaskValue: '',
    //   newBoardTitle: ''
    // })
  }

  moveTaskLeft = (boardIndex: number, taskIndex: number) => {
    // this.setState(
    //   produce(this.state, draft => {
    //     const currTask = draft.boards[boardIndex].splice(taskIndex, 1)
    //     draft.boards[boardIndex - 1].push(currTask[0])
    //   })
    // )
  }

  moveTaskRight = (boardIndex: number, taskIndex: number) => {
    fetchAPI('/moveBoard/right', 'UPDATE', {
      boardIndex: boardIndex,
      taskIndex: taskIndex,
      direction: 'right'
    })

    // this.setState(
    //   produce(this.state, draft => {
    //     const currTask = draft.boards[boardIndex].splice(taskIndex, 1)
    //     draft.boards[boardIndex + 1].push(currTask[0])
    //   })
    // )
  }

  moveTaskUp = (boardIndex: number, taskIndex: number) => {
    // this.setState(
    //   produce(this.state, draft => {
    //     const temp = draft.boards[boardIndex][taskIndex - 1]
    //     draft.boards[boardIndex][taskIndex - 1] = draft.boards[boardIndex][taskIndex]
    //     draft.boards[boardIndex][taskIndex] = temp
    //   })
    // )
  }

  // moveTaskDown = (boardIndex: number, taskIndex: number) => {
  //   this.setState(
  //     produce(this.state, draft => {
  //       const temp = draft.boards[boardIndex][taskIndex + 1]
  //       draft.boards[boardIndex][taskIndex + 1] = draft.boards[boardIndex][taskIndex]
  //       draft.boards[boardIndex][taskIndex] = temp
  //     })
  //   )
  // }

  deleteTask = (taskID: number) => {
    fetchAPI('deleteTask', 'DELETE', { taskID: taskID })
      .then(response => response.json())
      .then((res: Res) => this.setState({ boards: res.boards }))
    // this.setState(
    //   produce(this.state, draft => {
    //     draft.boards[boardIndex].splice(taskIndex, 1)
    //   })
    // )
  }

  moveTask = (taskID: number, direction: string) => {
    console.log(`move task ${direction} activated`)
    fetchAPI('/moveTask', 'POST', {
      taskID: taskID,
      direction: direction
    }).then(response => response.json())
      .then((res: Res) => {
        this.setState({ boards: res.boards })
      }
      )
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

  logout = () => {
    console.log('logout activated')
    fetchAPI('/logout', 'POST', {})
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
        <div className="Kanban">
            <h1 className="title">Kanban</h1>
            <button onClick={this.logout}>log out</button>
            <input placeholder='new board' onChange={e => this.updateNewBoardName(e.target.value)} value={this.state.newBoardTitle} onKeyDown={e => this.checkEnter(e, 'board')} />
            <button onClick={this.addBoard}>add board</button>
            {/* value = this.state.value to reset task value to '' after submitting a task */}
            <input placeholder='new task' value={this.state.newTaskValue} onChange={(e) => this.updateNewTaskName(e.target.value)} onKeyDown={e => this.checkEnter(e, 'task')} />
            <button onClick={this.addTask}>add task</button>
            <div className="kanban">
              {this.state.boards.map((board, boardIndex) =>
                <div className="board" key={boardIndex}>
                  <div className='boardTitle'>{board.name}</div>
                  {boardIndex > 0 ? <button onClick={() => this.moveBoardLeft(board.id, 'left')}>{`<`}</button> : null}
                  {boardIndex < this.state.boards.length - 1 ? <button onClick={() => this.moveBoardRight(board.id, 'right')}>{`>`}</button> : null}
                  <button className='deleteBoardButton' onClick={() => this.deleteBoard(board.id)}>x</button>
                  {board.tasks.map((task, taskIndex) => (
                    <div className='taskItem'>
                      <div key={taskIndex} className='taskText'>{task.text}</div>
                      <div className='taskButtonsContainer'>
                        {boardIndex > 0 ? <button onClick={() => this.moveTask(task.id, 'left')}>{`<`}</button> : null}
                        {taskIndex > 0 ? <button onClick={() => this.moveTask(task.id, 'up')}>^</button> : null}
                        {taskIndex < board.tasks.length - 1 ? <button onClick={() => this.moveTask(task.id, 'down')}>v</button> : null}
                        {boardIndex < this.state.boards.length - 1 ? <button onClick={() => this.moveTask(task.id, 'right')}>{`>`}</button> : null}
                        <button onClick={() => this.deleteTask(task.id)}>x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
    )
  }
}

export default Kanban
