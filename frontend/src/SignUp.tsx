import * as React from 'react' 
import { fetchPOST } from './fetchAPI'
import { Link } from "react-router-dom";
import styled from 'styled-components'

interface State {
  username: string,
  password: string
  secondPassword: string
  passwordMatchError: boolean
  noPasswordError: boolean
}

class SignUp extends React.Component<{}, State> {
  state: State = {
    username: '',
    password: '',
    secondPassword: '',
    passwordMatchError: false,
    noPasswordError: false
  }

  handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({username: e.target.value})
  }

  handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({password: e.target.value})
  }

  handleChangeSecondPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({secondPassword: e.target.value})
  }

  submitForm = () => {
    const username = this.state.username
    const password = this.state.password
    const secondPassword = this.state.secondPassword
    if (!password || !secondPassword ){
      this.setState({ noPasswordError: true})
    }
    if (password !== secondPassword) {
      this.setState({ passwordMatchError: true })
    }
    if (password !== '' && secondPassword !== '' && password === secondPassword) {
      fetchPOST('/signup', {
        username: username,
        password: password,
      }).then(response => response.json())
      .then(res => {
        if (res.success) {
          localStorage.setItem('sessionToken', res.token)
          localStorage.setItem('signedUp', 'true')
          location.href = '/kanban'
        } 
      }).catch(error => console.log(error))
    }
  }

  render(){
    return (
      <Container>
        <SignupForm>
          <Title>Sign Up</Title>
          <Input placeholder='username' onChange={this.handleChangeUsername} />
          <Input placeholder='password' onChange={this.handleChangePassword} type='password' />
          <Input placeholder='re-type password' onChange={this.handleChangeSecondPassword} type='password' />
          <Button onClick={this.submitForm}>Sign In</Button>
          <Login>Already have an account? <Link to='/login'>Log In</Link></Login>
          <PasswordError>
            {this.state.passwordMatchError ? <div>Passwords do not match. Please try again.</div> : <div />}
            {this.state.noPasswordError ? 'Please enter password' : <div/>}
          </PasswordError>
        </SignupForm>
      </Container>
    )
  }
}

export default SignUp

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SignupForm = styled.div`
  border: 1px solid rgba(0,0,0,.1);
  padding: 50px 40px 60px
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
  width: 200px;
  height: 28px;
  background-color: rgba(82, 194, 250, .5);
  border: 1px solid rgba(42, 152, 247, .8);
  border-radius: 3px;
  color: white;
  font-size: 13px;
  margin: 20px 0 8px;
`

const PasswordError = styled.div`
  font-size: 13px;
  margin-top: 20px;
  width: 200px;
`

const Login = styled.div`
  font-size: 12px;
`
