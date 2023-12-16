'use strict'

let workspaceDocument = {
    "Diagrams": [

    ],
    "Connectors": [

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
                        "Type": "int",
                        "AccessModifier": "Public"
                    },
                    {
                        "Name": "Prop 2",
                        "Type": "string",
                        "AccessModifier": "Public"
                    }
                ],
                "Methods": [
                    {
                        "AccessModifier": "Public",
                        "ReturnType": "string",
                        "Name": "Method 1",
                        "Arguments": [],
                    },
                ],
                "Attributes": [
                    "Attribute 1",
                    "Attribute 2"
                ],
                "TemplateArguments": [
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
                        "Type": "string",
                        "AccessModifier": "Public"
                    },
                    {
                        "Name": "Prop 4",
                        "Type": "float",
                        "AccessModifier": "Public"
                    }
                ],
                "Methods": [
                    {
                        "AccessModifier": "Public",
                        "ReturnType": "string",
                        "Name": "Method 2",
                        "Arguments": [{
                            "Type": "string",
                            "Name": "name"
                        }]
                    },
                ],
                "Attributes": [
                ],
                "TemplateArguments": [
                ],

                "Position": { "X": "1030", "Y": "1020" },

                "Element": null
            }
        ],
        "Connectors": [
            {
                "Type": "Aggregation",
                "From": "Class_1",
                "To": "Class_2"
            }
        ]
    }
    RegenerateDiagrams()
}

function AddDiagram(diagram) {
    workspaceDocument.Diagrams.push(diagram)
    UpdateAllDiagrams()
}

function RemoveDiagramByIndex(index) {
    workspaceDocument.Diagrams.splice(index, 1)
    UpdateAllDiagrams()
}

function RemoveSelectedDiagram() {
    if (currentSelectedDiagramIndex !== -1) {
        const diagramIndexToDel = currentSelectedDiagramIndex
        currentSelectedDiagramIndex = -1
        RemoveDiagramByIndex(diagramIndexToDel)
    }
}

let diagramsSvgContainer = undefined
let connectorsSvgContainer = undefined
function CreateWorkspaceSvgContainer() {
    const xmlns = "http://www.w3.org/2000/svg";
    let workspaceSvgContainer = document.createElementNS(xmlns, "svg")
    workspaceSvgContainer.setAttributeNS(null, "width", "100%")
    workspaceSvgContainer.setAttributeNS(null, "height", "100%")
    workspaceSvgContainer.classList.add("svg-container")

    diagramsSvgContainer = document.createElementNS(xmlns, "g")
    diagramsSvgContainer.setAttributeNS(null, "width", "100%")
    diagramsSvgContainer.setAttributeNS(null, "height", "100%")
    workspaceSvgContainer.appendChild(diagramsSvgContainer)

    connectorsSvgContainer = document.createElementNS(xmlns, "g")
    connectorsSvgContainer.setAttributeNS(null, "width", "100%")
    connectorsSvgContainer.setAttributeNS(null, "height", "100%")
    workspaceSvgContainer.appendChild(connectorsSvgContainer)

    workspace.appendChild(workspaceSvgContainer)
}
CreateWorkspaceSvgContainer()

function UpdateAllDiagrams() {
    RegenerateDetailsPanel()
    RegenerateDiagrams()
    GenerateDiagramsConnectors()
    UpateJsonDocumentViewer()
}

function UpdateCurrentDiagram() {
    RegenerateDetailsPanel()
    RegenerateDiagram(currentSelectedDiagramIndex)
    RegenerateDiagramConnectors(currentSelectedDiagramIndex)
    UpateJsonDocumentViewer()
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

connection.on("Update", function (newData, jsonDocument) {
    console.log("update:" + newData)
    SetAllInputFieldsFromJson(newData)
    workspaceDocument = JSON.parse(jsonDocument)
    UpdateAllDiagrams()
})

connection.start().then(function () {
    console.log("start")
    console.log("Auto connect to id: " + autoConnectWorkspaceId)
    if (typeof autoConnectWorkspaceId !== undefined)
        JoinToWorkspace(autoConnectWorkspaceId.toString())

}).catch(function (err) {
    return console.error(err.toString())
})

// Message on close page
if (!isGuest) {
    window.onbeforeunload = function (event) {
        event.preventDefault()
        event.returnValue = ''
    }
}

document.onkeydown = (e) => {
    //console.log(e.code)
    if (e.code === 'Delete')
        RemoveSelectedDiagram()
    else {
        let needUpdate = false
        switch (e.code) {
            case 'ArrowUp':
                GetDiagramById(currentSelectedDiagramIndex).Position.Y -= gridSnap
                needUpdate = true
                break
            case 'ArrowDown':
                GetDiagramById(currentSelectedDiagramIndex).Position.Y += gridSnap
                needUpdate = true
                break
            case 'ArrowLeft':
                GetDiagramById(currentSelectedDiagramIndex).Position.X -= gridSnap
                needUpdate = true
                break
            case 'ArrowRight':
                GetDiagramById(currentSelectedDiagramIndex).Position.X += gridSnap
                needUpdate = true
                break
            default:
        }
        if (needUpdate) {
            UpdateCurrentDiagram()
            e.preventDefault()
        }
    }
}
