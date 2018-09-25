// import * as React from 'react'
// import {Board} from './App'

// type Props = {

//   text: string,
//   // moveRight: ((boardIndex: number, taskIndex: number) => void),
//   // moveLeft: ((boardIndex: number, taskIndex: number) => void),
//   // moveUp: ((boardIndex: number, taskIndex: number) => void),
//   // moveDown: ((boardIndex: number, taskIndex: number) => void),
//   // deleteTask: ((boardIndex: number, taskIndex: number) => void),
// }

// class TaskComponent extends React.Component<Props, {}>{
//   render(){
//     return (
//       <div className='taskContainer'>
//         <div className="taskText" key={this.props.taskIndex}>{this.props.text}</div>
//         {/* {this.props.boardIndex > 0 ? <button className='taskButton' id='leftButton' onClick={() => this.props.moveLeft(this.props.boardIndex, this.props.taskIndex)}> left </button> : null}
//         {this.props.taskIndex > 0 ? <button className='taskButton' id='upButton' onClick={() => this.props.moveUp(this.props.boardIndex, this.props.taskIndex)}>^</button> : null}
//         {this.props.taskIndex < this.props.boards[this.props.boardIndex].length - 1 ? <button className='taskButton' id='downButton' onClick={() => this.props.moveDown(this.props.boardIndex, this.props.taskIndex)}>v</button> : null }
//         {this.props.boardIndex < this.props.boardCount - 1 ? <button className='taskButton' id='rightButton' onClick={() => this.props.moveRight(this.props.boardIndex, this.props.taskIndex)}>></button> : null} */}
//         <button className='delete-task-button' onClick={() => this.props.deleteTask(this.props.boardIndex, this.props.taskIndex)}>x</button>
//       </div>
//     )
//   }
// }

// export default TaskComponent