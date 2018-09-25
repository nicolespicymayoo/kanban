import * as React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import Kanban from './Kanban'
import Login from './Login'
import SignUp from './SignUp'

type loginState = 'initial' | 'success' | 'failed'

class App extends React.Component<{}, { loggedIn: loginState }> {
  state: {loggedIn: loginState} = {loggedIn: 'initial'}
  componentDidMount() {
    const token = localStorage.getItem('sessionToken')
    if (!token) { 
      this.setState({ loggedIn: 'failed' }) 
      return
    }

    fetch('/checkForUser', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    }).then(res => {
      this.setState({ loggedIn: res.ok ? 'success' : 'failed' })

    }).catch(error => console.log(error))

  }
  render() {
    return (
      <Router>
        <div className="App">
          {this.state.loggedIn === 'success' && <Redirect to="/kanban" />}
          {this.state.loggedIn === 'failed' && <Redirect to="/login" />}
          <Route path='/login' component={Login} />
          <Route path='/sign-up' component={SignUp} exact={true} />
          <Route path='/kanban' component={Kanban} exact={true} />
        </div>
      </Router>
    )
  }
}

export default App
