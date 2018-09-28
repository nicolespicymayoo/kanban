import *  as React from 'react'
import { Link } from 'react-router-dom'
import { fetchPOST } from './fetchAPI'
import styled from 'styled-components'

interface State {
  username: string
  password: string
  error: string | null
}

class Login extends React.Component<{}, State>{
  state: State = {
    username: '',
    password: '',
    error: null
  }

  updateUsername = (value: string ) => {
    this.setState({username: value})
  }

  updatePassword = (value: string) => {
    this.setState({password: value})
  }

  submitForm = () => {
    const username = this.state.username
    const password = this.state.password
    fetchPOST('/login' ,{
      user: username,
      password: password
    }).then(response => response.json())
    .then(res => {
      if ( res.success ){
        localStorage.setItem('sessionToken', res.token)
        localStorage.setItem('loggingIn', 'true')
        location.href = '/kanban'
      } else {
        this.setState({error: 'login failed'})
      }
      
    })
    .catch(error => console.log(error))
  }

  handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: e.target.value })
  }

  handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({password: e.target.value})
  }

  render() {
    return (
      <Container>
        <LoginForm>
          <Title>Log in</Title>
          <Input  placeholder='username' onChange={this.handleChangeUsername}/>
          <Input placeholder='password' onChange={this.handleChangePassword} type='password'/>
          <Button className='submitButton' onClick={this.submitForm}>Sign In</Button>
          <Signup>No account? <Link to='/sign-up'>Sign Up</Link></Signup>
        </LoginForm>
      </Container>
    )
  }
}

export default Login

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const LoginForm = styled.div`
  border: 1px solid rgba(0,0,0,.1);
  padding: 50px 40px 70px
  border-radius: 5px;
`

const Title = styled.h3`
  font-weight: 200;
  width: auto;
  margin: 0;
  margin-bottom: 25px;
`
const Input = styled.input`
  display: block;
  height: 28px;
  width: 200px;
  padding-left: 5px;
  margin: 4px 0;
  font-size: 14px;
  font-weight: 200;
`

const Button = styled.button`
  width: 100%;
  height: 28px;
  background-color: rgba(82, 194, 250, .5);
  border: 1px solid rgba(42, 152, 247, .8);
  border-radius: 3px;
  color: white;
  font-size: 13px;
  margin: 20px 0 8px;
`
const Signup = styled.div`
  font-size: 12px;
`