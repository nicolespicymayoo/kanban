import *  as React from 'react'
import { Link } from 'react-router-dom'
import fetchAPI from './fetchAPI'

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
    fetchAPI('/login', 'POST', {
      user: username,
      password: password
    }).then(response => response.json())
    .then(res => {
      if ( res.success ){
        localStorage.setItem('sessionToken', res.token)
        location.href = '/kanban'
      } else {
        this.setState({error: 'login failed'})
      }
      
    })
    .catch(error => console.log(error))
    // take this.state.username
    // & this.this.state.password,
    // send it to the backend to verify in the database
    // send response : success or fail
    // if success, log in (link to user's kanban board)
    // else display error
  }

  handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: e.target.value })
  }

  handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({password: e.target.value})
  }

  render() {
    return (
      <div className='signInForm'>
        <div className='title'>Log in</div>
        <input className='username' onChange={this.handleChangeUsername}/>
        <input className='password' onChange={this.handleChangePassword} type='password'/>
        <button className='submitButton' onClick={this.submitForm}>Sign In</button>
        <div>No account? <Link to='/sign-up'>Sign Up</Link></div>
      </div>
    )
  }
}

export default Login
