'use strict'

// Serialize inputs fields

function GetAllInputFieldsAsJson() {
    let settingsAsJson = '{'
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let pageName = settingsPages[i].id.substring("settings-".length)

        settingsAsJson += `"${pageName}":{`
        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')

        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substring("input-".length)
            let inputValue;
            if (inputs[j].type === "checkbox") {
                inputValue = inputs[j].checked;
            }
            else if (inputs[j].type === "text") {
                inputValue = `"${inputs[j].value}"`;
            }
            else if (inputs[j].type === "select-one") {
                inputValue = inputs[j].selectedIndex;
            }
            settingsAsJson += `"${inputName}":${inputValue}`
            if (j < inputs.length - 1) settingsAsJson += ','
        }
        settingsAsJson += '}'
        if (i < settingsPages.length - 1) settingsAsJson += ','
    }
    settingsAsJson += '}'
    return settingsAsJson
}

function SetAllInputFieldsFromJson(jsonSettings) {
    let settings = JSON.parse(jsonSettings)
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let pageName = settingsPages[i].id.substring("settings-".length)
        let settingsPage = settings[pageName]

        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')
        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substring("input-".length)
            let inputValue = settingsPage[inputName]

            if (inputs[j].type === "checkbox") {
                inputs[j].checked = inputValue
            }
            else if (inputs[j].type === "text") {
                inputs[j].value = inputValue
            }
            else if (inputs[j].type === "select-one") {
                inputs[j].selectedIndex = inputValue
            }
        }
    }
}

// Sink changes between workspaces

var connection = new signalR.HubConnectionBuilder().withUrl("/api/workspace").build()

function SinkWorkspace() {
    connection.invoke("Sink", GetAllInputFieldsAsJson())
        .then(function () {
            console.log("sink")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

function PullWorkspace() {
    connection.invoke("Pull")
        .then(function () {
            console.log("pull")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

function JoinToWorkspace(workspaceId) {
    connection.invoke("Join", workspaceId)
        .then(function () {
            console.log("join: " + workspaceId)
            PullWorkspace()
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

function LeaveFromWorkspace() {
    connection.invoke("Leave")
        .then(function () {
            console.log("leave")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
}

connection.on("Update", function (newData) {
    console.log("update:" + newData)
    SetAllInputFieldsFromJson(newData)
});

connection.start().then(function () {
    console.log("start")

    JoinToWorkspace("1234")

    //connection.invoke("Join", "1234")
    //    .then(function () {
    //        console.log("join")
    //        connection.invoke("Pull")
    //            .then(function () {
    //                console.log("pull")
    //            })
    //            .catch(function (err) {
    //                return console.error(err.toString())
    //            })
    //    })
    //    .catch(function (err) {
    //        return console.error(err.toString())
    //    })

}).catch(function (err) {
    return console.error(err.toString())
})
