'use strict'

let userlist = document.getElementById("userlist")
let workspaceUsers = []

function UpdateUserList() {
    GetWorkspaceUsers()
}

function AddUser() {
    let newUserName = document.getElementById("adduser-input").value
    if (newUserName !== "") {
        AddUserToWorkspace(newUserName)
        workspaceUsers.push(newUserName)
        GenerateUserList()
    }
}

function RemoveUser(index) {
    console.log(index)
    RemoveUserFromWorkspace(workspaceUsers[index])
    workspaceUsers.splice(index, 1)
    GenerateUserList()
}

function GenerateUserList() {
    while (userlist.firstChild) {
        userlist.removeChild(userlist.lastChild)
    }

    let header = document.createElement('li')
    header.classList.add('list-group-item')
    header.innerText = 'Users list'
    userlist.appendChild(header)

    for (let i = 0; i < workspaceUsers.length; i++) {
        let li = document.createElement('li')
        li.classList.add('list-group-item', 'd-flex', 'flex-row')

        let removeButton = document.createElement('button')
        removeButton.classList.add('btn', 'p-0', 'border-0')
        removeButton.onclick = function () {
            RemoveUser(i)
        }
        let removeButtonIcon = document.createElement('i')
        removeButtonIcon.classList.add('bi', 'bi-x', 'fs-3')
        removeButton.appendChild(removeButtonIcon)
        li.appendChild(removeButton)

        let line = document.createElement('div')
        line.classList.add('vr', 'ms-2', 'me-2')
        li.appendChild(line)

        let userIcon = document.createElement('i')
        userIcon.classList.add('bi', 'bi-person-circle', 'ps-1', 'fs-2')
        li.appendChild(userIcon)

        let userName = document.createElement('p')
        userName.classList.add('m-0', 'ps-2', 'align-self-center')
        userName.innerText = workspaceUsers[i]
        li.appendChild(userName)

        userlist.appendChild(li)
    }
}

function AddUserToWorkspace(name) {
    connection.invoke("AddUser", name)
        .then(function () {
            console.log("AddUser")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

function RemoveUserFromWorkspace(name) {
    connection.invoke("RemoveUser", name)
        .then(function () {
            console.log("RemoveUser")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

connection.on("UserListResult", function (userlist) {
    console.log("UserListResult:" + userlist)
    workspaceUsers = JSON.parse(userlist)
    GenerateUserList()
})

//GenerateUserList()