'use strict'

let workspaceDocument = {
    "Diagrams": [

    ]
}

function SetDefaultWorkspace() {
    workspaceDocument = {
        "Diagrams": [
            {
                "Type": "ClassDiagram",
                "Name": "Class_1",
                "Properties": [
                    {
                        "Name": "Prop 1",
                        "AccessModifier": "Public"
                    },
                    {
                        "Name": "Prop 2",
                        "AccessModifier": "Public"
                    }
                ],
                "Attributes": [
                    "Attribute 1",
                    "Attribute 2"
                ],

                "Position": { "X": "820", "Y": "750" },

                "Element": null
            },
            {
                "Type": "ClassDiagram",
                "Name": "Class_2",
                "Properties": [
                    {
                        "Name": "Prop 3",
                        "AccessModifier": "Public"
                    },
                    {
                        "Name": "Prop 4",
                        "AccessModifier": "Public"
                    }
                ],

                "Position": { "X": "1030", "Y": "1020" },

                "Element": null
            }
        ]
    }
    RegenerateDiagrams()
}

function AddDiagram(diagram) {
    workspaceDocument.Diagrams.push(diagram)
    UpdateAllDiagrams()
}

function RemoveDiagram(diagram) {
    workspaceDocument.Diagrams.pop(diagram)
    UpdateAllDiagrams()
}

function IgnoreWorkspacePrivateFields(key, value) {
    if (key == "Element") return undefined
    else return value
}

function CreateDiagram(type, pos) {
    switch (type) {
        case "ClassDiagram": return {
            "Type": "ClassDiagram",
            "Name": "NewClass",
            "Properties": [
                {
                    "Name": "New Property",
                    "AccessModifier": "Public"
                },
            ],
            "Attributes": [
            ],

            "Position": { "X": pos.x, "Y": pos.y },

            "Element": null
        }
        default:
    }
}

// Diagram generation

function GenerateClassDiagram(params) {
    const diagram = document.createElement('div')
    diagram.classList.add('draggable', 'diagram')
    diagram.style.transform = `translate(${params.Position.X}px, ${params.Position.Y}px)`

    const diagramHeader = document.createElement('div')
    diagramHeader.classList.add('draggable-header')
    diagramHeader.innerText = params.Name
    diagram.appendChild(diagramHeader)


    params.Properties.forEach((item) => {
        const itemElem = document.createElement('p')
        itemElem.innerText = item.Name
        diagram.appendChild(itemElem)
    })
    return diagram
}

function GenerateClassDiagramProperty(propName) {
    if (propName == "Properties") {
        return {
            "Name": "New property",
            "AccessModifier": "Public"
        }
    }
    return undefined
}

function GenerateDiagram(params) {
    switch (params.Type) {
        case "ClassDiagram": return GenerateClassDiagram(params)
        default:
    }
}

function GetGeneratePropertyFunc(diagramType) {
    switch (diagramType) {
        case "ClassDiagram": return GenerateClassDiagramProperty
        default:
    }
}


// Regenerate

let workspace = document.getElementsByClassName("work-space")[0]
function RegenerateDiagrams() {
    let elements = []
    for (var i = 0; i < workspaceDocument.Diagrams.length; i++) {
        let elem = GenerateDiagram(workspaceDocument.Diagrams[i])
        workspaceDocument.Diagrams[i].Element = elem
        elements.push(elem)
    }

    while (workspace.firstChild)
        workspace.removeChild(workspace.lastChild)
    elements.forEach((elem) => workspace.appendChild(elem))
}

function RegenerateDiagram(index) {
    RegenerateDiagrams()

    let elem = GenerateDiagram(workspaceDocument.Diagrams[index])
    workspace.replaceChild(elem, workspaceDocument.Diagrams[index].Element)
    workspaceDocument.Diagrams[index].Element = elem
}

// Diagram properties generation
let uniqueInputFieldId = 0
function GenerateTextField(fieldName, fieldValue, sourceObject) {
    const container = document.createElement('div')
    container.classList.add('col-md', 'mt-1')

    const formContainer = document.createElement('div')
    formContainer.classList.add('form-floating')

    const inputId = `input-u${++uniqueInputFieldId}`

    const input = document.createElement('input')
    input.classList.add('form-control')
    input.id = inputId
    input.value = fieldValue.toString()
    input.oninput = function () {
        sourceObject[fieldName] = input.value
        RegenerateDiagram(currentSelectedDiagramIndex)
        UpateJsonDocumentViewer()
    }

    const label = document.createElement('label')
    label.htmlFor = inputId
    label.innerText = fieldName

    container.appendChild(formContainer)
    formContainer.appendChild(input)
    formContainer.appendChild(label)
    return container
}

// List

function GenerateListHeader(name, items, genPropetyFunc) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')

    const p = document.createElement('p')
    p.classList.add('mb-0')
    p.innerText = name
    li.appendChild(p)

    const addButton = document.createElement('button')
    addButton.classList.add('btn', 'p-0', 'ms-auto')
    addButton.onclick = function () {
        let newProp = genPropetyFunc(name)
        if (newProp !== undefined) {
            items.push(newProp)
            UpdateCurrentDiagram()
        }
    }

    const addButtonIcon = document.createElement('i')
    addButtonIcon.classList.add('bi', 'bi-plus-circle', 'fs-5')
    addButton.appendChild(addButtonIcon)

    li.appendChild(addButton)

    ul.appendChild(li)
    return ul
}

function GenerateListItem(itemElem, items, index) {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')


    const removeButton = document.createElement('button')
    removeButton.classList.add('btn', 'p-0', 'border-0', 'mt-2', 'align-self-start')
    removeButton.onclick = function () {
        items.splice(index, 1)
        UpdateCurrentDiagram()
    }

    const removeButtonIcon = document.createElement('i')
    removeButtonIcon.classList.add('bi', 'bi-x', 'fs-5')
    removeButton.appendChild(removeButtonIcon)

    li.appendChild(itemElem)
    li.appendChild(removeButton)
    return li
}

function GenerateListItems(name, items, genPropetyFunc) {
    let list = GenerateListHeader(name, items, genPropetyFunc)
    for (var i = 0; i < items.length; i++) {
        list.appendChild(GenerateListItem(GenerateInputField(i, items[i], items, genPropetyFunc), items, i))
    }
    return list
}

// Group

function GenerateGroup(name, object, genPropetyFunc) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const liHeader = document.createElement('li')
    liHeader.classList.add('list-group-item')
    liHeader.innerText = name
    ul.appendChild(liHeader)

    let propNames = Object.getOwnPropertyNames(object)
    propNames.forEach((propName) => {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.appendChild(GenerateInputField(propName, object[propName], object, genPropetyFunc))
        ul.appendChild(li)
    })
    return ul
}



function GenerateInputField(name, value, sourceObject, genPropetyFunc) {
    if (typeof value === "string" || typeof value === "number") {
        return GenerateTextField(name, value, sourceObject)
    }
    else if (Array.isArray(value)) {
        return GenerateListItems(name, value, genPropetyFunc)
    }
    else if (typeof value === "object") {
        return GenerateGroup(name, value)
    }
    return document.createElement('div')
}


let detailsPanel = document.getElementById("diagram-parameters")
function GenerateDetailsPanel(diagram) {
    let elements = []
    if (diagram !== undefined) {
        let properties = Object.getOwnPropertyNames(diagram)
        if (properties.includes('Type')) {
            let genPropetyFunc = GetGeneratePropertyFunc(diagram['Type'])
            properties.forEach((propName) => {
                if (propName === 'Type') return

                let propValue = IgnoreWorkspacePrivateFields(propName, diagram[propName])
                if (propValue !== undefined)
                    elements.push(GenerateInputField(propName, propValue, diagram, genPropetyFunc))
            })
        }
    }

    while (detailsPanel.firstChild) {
        detailsPanel.removeChild(detailsPanel.lastChild)
    }
    elements.forEach((elem) => detailsPanel.appendChild(elem))
}

function GetDiagramIdByElement(elem) {
    for (var i = 0; i < workspaceDocument.Diagrams.length; i++) {
        if (workspaceDocument.Diagrams[i].Element == elem) {
            return i
        }
    }
}

function GetDiagramByElement(elem) {
    return workspaceDocument.Diagrams[GetDiagramIdByElement(elem)]
}

function GetDiagramById(id) {
    return workspaceDocument.Diagrams[id]
}

let currentSelectedDiagramIndex = -1
function GenerateDetailsPanelById(id) {
    if (GenerateDetailsPanelById === -1) GenerateDetailsPanel(Object())
    if (id !== currentSelectedDiagramIndex) {
        currentSelectedDiagramIndex = id
        GenerateDetailsPanel(GetDiagramById(id))
    }
}

function GenerateDetailsPanelByElement(elem) {
    GenerateDetailsPanelById(GetDiagramIdByElement(elem))
}

function RegenerateDetailsPanel() {
    GenerateDetailsPanel(GetDiagramById(currentSelectedDiagramIndex))
}


// JSON Viewer

let jsonDocumentViewer = document.getElementById("json-document-viewer")
function UpateJsonDocumentViewer() {
    jsonDocumentViewer.value = JSON.stringify(workspaceDocument, IgnoreWorkspacePrivateFields, 4)
}
jsonDocumentViewer.oninput = () => {
    try {
        workspaceDocument = JSON.parse(jsonDocumentViewer.value)
        RegenerateDiagrams()
    } catch (e) { }
}

RegenerateDiagrams()
UpateJsonDocumentViewer()

function UpdateAllDiagrams() {
    RegenerateDetailsPanel()
    RegenerateDiagrams()
    UpateJsonDocumentViewer()
}

function UpdateCurrentDiagram() {
    RegenerateDetailsPanel()
    RegenerateDiagram(currentSelectedDiagramIndex)
    UpateJsonDocumentViewer()
}


// Serialize inputs fields

function GetAllInputFieldsAsJson() {
    let settingsAsJson = '{'
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')

        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substring("input-".length)
            let inputValue
            if (inputs[j].type === "checkbox") {
                inputValue = inputs[j].checked
            }
            else if (inputs[j].type === "text") {
                inputValue = `"${inputs[j].value}"`
            }
            else if (inputs[j].type === "select-one") {
                inputValue = inputs[j].selectedIndex
            }
            settingsAsJson += `"${inputName}":${inputValue}`
            if (j < inputs.length - 1) settingsAsJson += ','
        }
        if (i < settingsPages.length - 1) settingsAsJson += ','
    }
    settingsAsJson += '}'
    return settingsAsJson
}

function SetAllInputFieldsFromJson(jsonSettings) {
    let settings = JSON.parse(jsonSettings)
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')
        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substring("input-".length)
            let inputValue = settings[inputName]

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
    connection.invoke("Sink", GetAllInputFieldsAsJson(), JSON.stringify(workspaceDocument, IgnoreWorkspacePrivateFields))
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
            GetWorkspaceUsers()
            InitChat()
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

function GetWorkspaceUsers() {
    connection.invoke("UserList")
        .then(function () {
            console.log("UserList")
        })
        .catch(function (err) {
            return console.error(err.toString())
        })
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

connection.on("Update", function (newData, jsonDocument) {
    console.log("update:" + newData)
    SetAllInputFieldsFromJson(newData)
    workspaceDocument = JSON.parse(jsonDocument)
    console.log("- doc:" + jsonDocument)

    RegenerateDiagrams()
    UpateJsonDocumentViewer()
    RegenerateDetailsPanel()
})

connection.on("UserListResult", function (userlist) {
    console.log("UserListResult:" + userlist)
    workspaceUsers = JSON.parse(userlist)
    GenerateUserList()
})

connection.start().then(function () {
    console.log("start")
    console.log("Auto connect to id: " + autoConnectWorkspaceId)
    if (typeof autoConnectWorkspaceId !== undefined)
        JoinToWorkspace(autoConnectWorkspaceId.toString())

}).catch(function (err) {
    return console.error(err.toString())
})
