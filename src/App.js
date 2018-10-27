import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Dropzone from 'react-dropzone'
import { DirectUpload } from "activestorage"
import {fromEvent} from 'file-selector';




class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      users: [],
      isEditing: false,
      userSelectedForEdits: null,
      files: [],
      fileUploads: [],
      imgUrl: null,
      imgName: null,
      imgLoaded: false
    }
    this.grabFiles = this._grabFiles.bind(this)
    this.fileInput = React.createRef();
  }

  componentDidMount() {
    fetch('http://localhost:3000/api/v1/users')
    .then(response => response.json())
    .then(json => this.setState({
      users: json
    }))
  }

  onDrop = (f) => {
    console.log("f", f)
    // const im = new Image()
    // im.onload = () => {
    //   const reader = new FileReader()
    //   reader.onload = () => {
    //
    //   }
    // }
    //



    //
    // console.log(f)
    // debugger
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader()
      console.log("reader: ", reader)


      reader.onload = () => {
        if (!!reader.result) {
          resolve(reader.result)
        }
        else {
          reject(Error("Failed converting to base64"))
        }
      }

      reader.readAsDataURL(f[0])
    })
    // promise.then(result => {
    //   console.log("f[0] before adding data_url: ", f[0])
    //   f[0]["data_url"] = result
    //   console.log("f[0] after adding data_url: ", f[0])
    // }, err => {
    //   console.log(err)
    // })
    // console.log("f[0] after adding data_url key: ", f[0] )
    //
    //
    //
    //
    // let selectedUser = this.state.userSelectedForEdits
    // selectedUser['avatar'] = f
    // this.setState({
    //   files: f,
    //   userSelectedForEdits: selectedUser
    // }, () => console.log(this.state.userSelectedForEdits))


    let selectedUser = this.state.userSelectedForEdits
    promise.then(result => {
      console.log("result: ", result)
      selectedUser['avatar'] = {data_url: result, title: f[0].name}
      this.setState({
        files: f,
        userSelectedForEdits: selectedUser
      }, () => console.log(this.state.userSelectedForEdits))
    }, err => {
      console.log(err)
    })



  }

  onSelectEdit = (event) => {
    let u = this.state.users.find((user) => user.id == event.target.id)
    this.setState({
      isEditing: true,
      userSelectedForEdits: u
    }, () => console.log("selected user: ", this.state.userSelectedForEdits))
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
    // if (this.state.files.length > 0) {
    //     userUpdates['avatar'] = this.state.files[0]
    // }
    console.log("in submit", userUpdates)

    fetch(`http://localhost:3000/api/v1/users/${userUpdates.id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify(userUpdates)
    })
    .then(response => response.json())
    .then(json => this.helperFindAndSplice(json))
  }

  helperFindAndSplice = (u) => {
    let idx = this.state.users.indexOf(this.state.users.find((k) => k.id == u.id))
    let updatedUserState = this.state.users.splice(0)
    updatedUserState = [
      ...updatedUserState.slice(0, idx),
      u,
      ...updatedUserState.slice(idx+1)
    ]
    this.setState({
      users: updatedUserState,
      isEditing: false,
      userSelectedForEdits: null
    })
  }

  _grabFiles = (event) => {
    // event.preventDefault()
    // let fileUploadState = this.state.fileUploads.splice(0)
    // fileUploadState = [
    //   ...fileUploadState,
    //   ...this.fileInput.current.files
    // ]
    //
    // debugger
    // console.log("hi")
    const file = this.fileInput.current.files[0]
    const reader  = new FileReader();

    reader.onloadend = () => {
      this.setState({
        imgUrl: reader.result,
        imgName: file.name,
        imgLoaded: true
      }, () => console.log("resulting url saved in state: ", this.state.imgUrl))
    }
    if (file) {
      reader.readAsDataURL(file);
      console.log("in if file, file: ", file)
      this.setState({
        imgUrl :reader.result,
        imgName: file.name
      })
    }
    else {
      this.setState({
        imgUrl: ""
      })
    }
  }

  onSubmit2 = (event) => {
    event.preventDefault()

    let userUpdates = this.state.userSelectedForEdits
    let formdata = new FormData()
    formdata.append('username', userUpdates['username'])
    formdata.append('location', userUpdates['location'])

    formdata.append('id', userUpdates['id'])
    console.log("formdata", formdata)
    // Object.entries(userUpdates).forEach((entry) => {
    //   if (entry[1] != null) {
    //   console.log(entry)
    //   console.log("entry[0]: ", entry[0], "entry[1]: ", entry[1])
    //   console.log(formdata)
    //   return formdata.append(entry[0], entry[1])
    // }
    // })




    // if (this.state.files.length > 0) {
    //     userUpdates['avatar'] = this.state.files[0]
    // }
    console.log("in submit", formdata)

    fetch(`http://localhost:3000/api/v1/users/${userUpdates.id}`, {
      method: 'PATCH',
      body: formdata
    })
    .then(response => response.json())
    .then(json => this.helperFindAndSplice(json))
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
            <form name="user" onSubmit={this.onSubmit2}>
              <label> Username: </label>
                <input onChange={this.onFieldEdit} type="text" name="username" value={this.state.userSelectedForEdits.username} />


              <label> Location:</label>
                <input onChange={this.onFieldEdit} type="text" name="location" value={this.state.userSelectedForEdits.location} />

{/*
              <div>

                <label> File Upload
                  <input type="file" accept="image/png, image/jpeg" ref={this.fileInput} multiple onChange={this.grabFiles}>
                  </input>
                </label>
                {!!this.state.imgLoaded &&
                  <div className="fakePreview">
                    <img src={this.state.imgUrl} height="100"/>
                  </div>
                }



              </div>
*/}
              <div className="fakePreview">
                <button type="submit">Fake Submit</button>
              </div>
            </form>


              {/*
                <div className="drop-zone-section">
                <label> Avatar:
                <div className="drop-area">
                <Dropzone onDrop={this.onDrop.bind(this)} getDataTransferItems={evt => fromEvent(evt)} inputProps={{accept: "image/png, image/jpeg"}}>
                {this.state.files.length > 0 ? (
                <img src={this.state.files[0].preview} width="200px"/>
                ) : (
                <p>Drop Files Here</p>
                )
                }
                </Dropzone>
                </div>

                {this.state.files.length > 0 &&
                <div className="drop-list">
                {this.state.files.map((item) => {
                return <div className="file-item" key={item.name}>{item.name}</div>
                })}
                </div>
                }

                </label>

                </div>
                */}



              {/*  <button onClick={this.onSubmitEdits}>
              submit
              </button>*/}
            </div>
          }

        </div>
      );
    }
  }

  export default App;
