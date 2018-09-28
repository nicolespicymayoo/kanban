import * as React from 'react'
import styled from 'styled-components'

type Props = {
  text: string,
  taskID: number,
  taskIndex: number,
  boardIndex: number, 
  boardLength: number,
  moveRight: ((taskID: number) => void),
  moveLeft: ((taskID: number) => void),
  moveUp: ((taskID: number) => void),
  moveDown: ((taskID: number) => void),
  deleteTask: ((taskID: number) => void),
}

class Task extends React.Component<Props, {}>{
  render(){
    return (
      <TaskContainer>
        <Text key={this.props.taskID}>{this.props.text}</Text>
        <ButtonContainer>
          {this.props.boardIndex > 0 ? <Button onClick={() => this.props.moveLeft(this.props.taskID)}> ⇦ </Button> : null}
          {this.props.taskIndex > 0 ? <Button onClick={() => this.props.moveUp(this.props.taskID)}> ⇧ </Button> : null}
          {this.props.taskIndex < this.props.boardLength - 1 ? <Button onClick={() => this.props.moveDown(this.props.taskID)}> ⇩ </Button> : null}
          {this.props.boardIndex < this.props.boardLength ? <Button onClick={() => this.props.moveRight(this.props.taskID)}> ⇨ </Button> : null}
          <Button onClick={() => this.props.deleteTask(this.props.taskID)}> ✕ </Button>
        </ButtonContainer>
      </TaskContainer>
    )
  }
}

export default Task

const TaskContainer = styled.div`
  clear: both;
  padding: 6px 2px;
`
const Text = styled.p`
  display: inline;
`
const ButtonContainer = styled.div`
  float: right;
`

const Button = styled.button`
  display: inline;
`