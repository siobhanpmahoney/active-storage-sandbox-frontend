import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Dropzone from 'react-dropzone'


class App extends Component {
  
  constructor(props) {
    super(props)

    this.state = {
      users: [],
      isEditing: false,
      userSelectedForEdits: null,
      files: []
    }
  }

  componentDidMount() {
    fetch('http://localhost:3000/api/v1/users')
    .then(response => response.json())
    .then(json => this.setState({
      users: json
    }))
  }

  onDrop = (f) => {
    debugger
    let updatedFiles = [...this.state.files, f]
    this.setState({
      files: updatedFiles
    })
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
          <div className="editForm">
            <form>
              <label> Username:
                <input onChange={this.onFieldEdit} type="text" name="username" value={this.state.userSelectedForEdits.username} />
              </label>

              <label> Location:
                <input onChange={this.onFieldEdit} type="text" name="location" value={this.state.userSelectedForEdits.location} />
              </label>



              <div className="drop-zone-section">
                <label> Avatar:
                  <div className="drop-area">
                    <Dropzone onDrop={this.onDrop.bind(this)}>
                      <p>Drop Files Here</p>
                    </Dropzone>
                  </div>

                  {this.state.files.length > 0 &&
                    <div className="drop-list">
                      {this.state.files.map((item) => {
                        return <div className="file-item" key={item[0].name}>{item[0].name}</div>
                      })}
                    </div>
                  }

                </label>

              </div>
            </form>

            <button onClick={this.onSubmitEdits}>
              submit
            </button>
          </div>
        }

      </div>
    );
  }
}

export default App;
