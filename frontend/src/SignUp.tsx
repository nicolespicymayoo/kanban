import * as React from 'react' 
import fetchAPI from './fetchAPI'

interface State {
  username: string,
  password: string
  secondPassword: string
  passwordError: boolean
}

class SignUp extends React.Component<{}, State> {
  state: State = {
    username: '',
    password: '',
    secondPassword: '',
    passwordError: false
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

    if (password === secondPassword) {
      fetchAPI('/signup', 'POST', {
        username: username,
        password: password,
      }).then(response => response.json())
      .then(res => {
        if (res.success) {
          localStorage.setItem('sessionToken', res.token)
          location.href = '/kanban'
        } 
      }).catch(error => console.log(error))
    } else {
      this.setState({ passwordError: true })
    }
  }

  render(){
    return (
      <div className='signUpForm'>
        <div className='title'>Sign Up</div>
        <input className='username' onChange={this.handleChangeUsername} />
        <input className='password' onChange={this.handleChangePassword} type='password' />
        <input className='password' onChange={this.handleChangeSecondPassword} type='password' />
        <button className='submitButton' onClick={this.submitForm}>Sign In</button>
        {this.state.passwordError ? <div>Passwords do not match. Please try again.</div> : null}
      </div>
    )
  }
}

export default SignUp


// username input
// password input
// check password input

