import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      users: [],
      isEditing: false,
      userSelectedForEdits: null,
    }
  }

  componentDidMount() {
    fetch('http://localhost:3000/api/v1/users')
    .then(response => response.json())
    .then(json => this.setState({
      users: json
    }))
  }

  onSelectEdit = (event) => {

    let u = this.state.users.find((user) => user.id == event.target.id)
    this.setState({
      isEditing: true,
      userSelectedForEdits: u
    })
  }

  onFieldEdit = (event) => {
    let name = event.target.name
    let val = event.target.value
    let formState = this.state.userSelectedForEdits
    formState[name] = val
    this.setState({
      userSelectedForEdits: formState
    })
  }





  onSubmitEdits = (event) => {
    event.preventDefault()
    let userUpdates = this.state.userSelectedForEdits
    fetch(`http://localhost:3000/api/v1/users/${userUpdates.id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify({
        username: userUpdates.username,
        location: userUpdates.location
      })
    })
    .then(response => response.json())
    .then(json => this.helperFindAndSplice(json))
  }

  helperFindAndSplice = (u) => {
    let idx = this.state.users.indexOf(this.state.users.find((k) => k.id == u.id))
    let updatedUserState = [
      ...this.state.users.slice(0, idx),
      u,
      ...this.state.users.slice(idx+1)
    ]
    this.setState({
      users: updatedUserState,
      isEditing: false,
      userSelectedForEdits: null
    })
  }

render() {
  return (
    <div className="App">
      <h1>Users</h1>
      {this.state.users.length > 0 &&
        <ul>
          {this.state.users.map((user) => {
            return <div>
              <li>{user.username}, {user.location}
                <span className="button">
                  <button id={user.id} onClick={this.onSelectEdit}>Edit</button>
                </span>
              </li>
            </div>
          })}
        </ul>
      }

      {!!this.state.isEditing &&
        <div className="editForm" style={{background:"white",  border: "1.5px solid #346EFF"}}>
          <form style={{background: "#346EFF", padding: "16px", border: "1.5px solid #346EFF", fontSize:"80%", display:"flex", flexFlow:"nowrap row", justifyContent:"space-around", color:"white"}}>
            <label> Username:
              <input onChange={this.onFieldEdit} style={{margin:"0px 6px", padding:"3px"}} type="text" name="username" value={this.state.userSelectedForEdits.username} />
            </label>

            <label> Location:
              <input onChange={this.onFieldEdit} style={{margin:"0px 6px", padding:"3px"}} type="text" name="location" value={this.state.userSelectedForEdits.location} />
            </label>
          </form>

          <button style={{borderColor:"#346EFF", color: "#346EFF", margin:"12px", padding: "6px", borderRadius:"10px"}} onClick={this.onSubmitEdits}>submit</button>
        </div>
      }

    </div>
  );
}
}

export default App;
