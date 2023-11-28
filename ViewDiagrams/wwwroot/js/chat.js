'use strict'

function AddMessageToChat(messageUsername, sendDate, message) {
    let chatElem = document.getElementById("chat-messages")

    const isOwnMessage = username === messageUsername

    const usernameElem = document.createElement('p')
    usernameElem.classList.add('small', 'mb-1')
    usernameElem.innerText = username

    const sendDateElem = document.createElement('p')
    sendDateElem.classList.add('small', 'mb-1', 'text-muted')
    sendDateElem.innerText = sendDate

    const usernameAndSendDateElem = document.createElement('div')
    usernameAndSendDateElem.classList.add('d-flex', 'justify-content-between')

    if (isOwnMessage) {
        usernameAndSendDateElem.appendChild(usernameElem)
        usernameAndSendDateElem.appendChild(sendDateElem)
    } else {
        usernameAndSendDateElem.appendChild(sendDateElem)
        usernameAndSendDateElem.appendChild(usernameElem)
    }

    const messageBodyElem = document.createElement('div')
    messageBodyElem.classList.add('d-flex', 'flex-row')
    if (isOwnMessage) {
        messageBodyElem.classList.add('justify-content-start')
    } else {
        messageBodyElem.classList.add('justify-content-end', 'mb-4', 'pt-1')
    }

    const messageBodyContentElem = document.createElement('div')
    messageBodyContentElem.classList.add('d-flex', 'flex-row')

    const messageElem = document.createElement('p')

    messageElem.classList.add('small', 'p-2', 'rounded-3')
    if (isOwnMessage) {
        messageElem.classList.add('ms-3', 'mb-3')
        messageElem.style.background = "#f5f6f7"
    } else {
        messageElem.classList.add('me-3', 'mb-3', 'text-white', 'bg-warning')
    }

    messageElem.innerText = message
    messageBodyContentElem.appendChild(messageElem)

    //const userIconElem = document.createElement('img')
    //userIconElem.src = ""
    //userIconElem.alt = "user icon"
    const userIconElem = document.createElement('i')
    userIconElem.classList.add('bi', 'bi-person', 'fs-1')

    if (isOwnMessage) {
        messageBodyElem.appendChild(userIconElem)
        messageBodyElem.appendChild(messageBodyContentElem)
    } else {
        messageBodyElem.appendChild(messageBodyContentElem)
        messageBodyElem.appendChild(userIconElem)
    }

    chatElem.appendChild(usernameAndSendDateElem)
    chatElem.appendChild(messageBodyElem)
}

function SendMessage(message) {
    AddMessageToChat(username, "Now", message)
    connection.invoke("SendMessage", message)
        .then(function () {
            console.log("SendMessage")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

function GetAllMessages() {
    connection.invoke("GetAllMessages")
        .then(function () {
            console.log("GetAllMessages")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

connection.on("ReceiveMessage", function (messageUsername, sendDate, message) {
    console.log("msg:" + messageUsername + ", " + sendDate + ", " + message)
    AddMessageToChat(messageUsername, sendDate, message)
})

function InitChat() {
    const chatElem = document.getElementById("chat-messages")
    const sendBtnElem = document.getElementById("button-send-msg")
    const sendMsgElem = document.getElementById("input-send-msg")
    chatElem.innerHTML = ""

    sendBtnElem.onclick = () => {
        let msg = sendMsgElem.value
        if (msg !== "") {
            console.log("msg-> " + msg)
            SendMessage(msg)
        }
    }
    GetAllMessages()
}