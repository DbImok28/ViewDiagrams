'use strict'

let workspaceDocument = {
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

            "Position": { "X": "10", "Y": "20" },

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

            "Position": { "X": "80", "Y": "120" },

            "Element": null
        }
    ]
}

function AddDiagram(diagram) {
    workspaceDocument.Diagrams.push(diagram)
    UpateJsonDocumentViewer()
}

function RemoveDiagram(diagram) {
    workspaceDocument.Diagrams.pop(diagram)
    UpateJsonDocumentViewer()
}

function InsertRange(range, insertFunc) {
    if (typeof range === undefined) return
    let result = ''
    for (var i = 0; i < range.length; i++) {
        result += insertFunc(range[i])
    }
    return result
}

function IgnoreWorkspacePrivateFields(key, value) {
    if (key == "Element") return undefined;
    else return value;
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

function GenerateDiagram(params) {
    switch (params.Type) {
        case "ClassDiagram": return GenerateClassDiagram(params)
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
        workspace.removeChild(workspace.lastChild);
    elements.forEach((elem) => workspace.appendChild(elem))
}

function RegenerateDiagram(index) {
    RegenerateDiagrams()

    let elem = GenerateDiagram(workspaceDocument.Diagrams[index])
    workspace.replaceChild(elem, workspaceDocument.Diagrams[index].Element)
    workspaceDocument.Diagrams[index].Element = elem
}

// Diagram properties generation

function GenerateTextField(fieldName, fieldValue, sourceObject) {
    const container = document.createElement('div')
    container.classList.add('col-md', 'mt-1')

    const formContainer = document.createElement('div')
    formContainer.classList.add('form-floating');

    const input = document.createElement('input')
    input.classList.add('form-control')
    input.id = `input-${fieldName}`
    input.value = fieldValue.toString()
    input.oninput = function () {
        sourceObject[fieldName] = input.value
        RegenerateDiagram(currentSelectedDiagramIndex)
        UpateJsonDocumentViewer()
    }

    const label = document.createElement('label')
    label.htmlFor = `input-${fieldName}`
    label.innerText = fieldName

    container.appendChild(formContainer)
    formContainer.appendChild(input)
    formContainer.appendChild(label)
    return container
}

// List

function GenerateListHeader(name) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.innerText = name
    ul.appendChild(li)
    return ul
}

function GenerateListItem(item) {
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.appendChild(item)
    return li
}

function GenerateListItems(name, items) {
    let list = GenerateListHeader(name)
    for (var i = 0; i < items.length; i++) {
        list.appendChild(GenerateListItem(GenerateInputField(i, items[i], items)))
    }
    return list;
}

// Group

function GenerateGroup(name, object) {
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
        li.appendChild(GenerateInputField(propName, object[propName], object))
        ul.appendChild(li)
    })
    return ul
}



function GenerateInputField(name, value, sourceObject) {
    if (typeof value === "string" || typeof value === "number") {
        return GenerateTextField(name, value, sourceObject)
    }
    else if (Array.isArray(value)) {
        return GenerateListItems(name, value)
    }
    else if (typeof value === "object") {
        return GenerateGroup(name, value)
    }
    return document.createElement('div')
}


let detailsPanel = document.getElementById("diagram-parameters")
function GenerateDetailsPanel(diagram) {
    let elements = []
    Object.getOwnPropertyNames(diagram).forEach((propName) => {
        if (propName === "Type") return

        let propValue = IgnoreWorkspacePrivateFields(propName, diagram[propName])
        if (propValue !== undefined)
            elements.push(GenerateInputField(propName, propValue, diagram))
    })
    while (detailsPanel.firstChild) {
        detailsPanel.removeChild(detailsPanel.lastChild);
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




// Serialize inputs fields

function GetAllInputFieldsAsJson() {
    let settingsAsJson = '{'
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
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
    console.log("Auto connect to id: " + autoConnectWorkspaceId)
    if (typeof autoConnectWorkspaceId !== undefined)
        JoinToWorkspace(autoConnectWorkspaceId.toString())

}).catch(function (err) {
    return console.error(err.toString())
})
