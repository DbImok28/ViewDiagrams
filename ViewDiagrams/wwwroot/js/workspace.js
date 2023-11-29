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

let workspaceSvgContainer = undefined
function CreateWorkspaceSvgContainer() {
    const xmlns = "http://www.w3.org/2000/svg";
    workspaceSvgContainer = document.createElementNS(xmlns, "svg")
    workspaceSvgContainer.classList.add("connector")
    workspace.appendChild(workspaceSvgContainer)
}

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
    console.log("- doc:" + jsonDocument)

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
