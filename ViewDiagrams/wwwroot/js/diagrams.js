'use strict'

function IgnoreWorkspacePrivateFields(key, value) {
    if (key == "Element") return undefined
    else return value
}

function CreateDiagram(type, pos) {
    switch (type) {
        case "ClassDiagram": return {
            "Type": "ClassDiagram",
            "Name": "NewClass",
            "Comments": [],
            "TemplateArguments": [],
            "Attributes": [],
            "Properties": [
                {
                    "Name": "New Property",
                    "Type": "int",
                    "AccessModifier": "Public"
                },
            ],
            "Methods": [
                {
                    "AccessModifier": "Public",
                    "ReturnType": "string",
                    "Name": "Method 1",
                    "Arguments": [{
                        "Type": "string",
                        "Name": "name"
                    }]
                },
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
    switch (propName) {
        case "Properties":
            return {
                "Name": "New property",
                "AccessModifier": "Public"
            }
        case "Methods":
            return {
                "AccessModifier": "Public",
                "ReturnType": "string",
                "Name": "Method 1",
                "Arguments": []
            }
        case "Arguments":
            return {
                "Type": "string",
                "Name": "name"
            }
        case "Attributes":
            return {
                "Name": "Attribute 1",
                "Arguments": []
            }
        case "TemplateArguments":
            return {
                "Name": "T",
                "Arguments": []
            }
        case "Comments":
            return "Comment"
        default:
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
    CreateWorkspaceSvgContainer()
}

function RegenerateDiagram(index) {
    let elem = GenerateDiagram(workspaceDocument.Diagrams[index])
    workspace.replaceChild(elem, workspaceDocument.Diagrams[index].Element)
    workspaceDocument.Diagrams[index].Element = elem
}

function RegenerateCurrentDiagram() {
    RegenerateDiagram(currentSelectedDiagramIndex)
    RegenerateCurrentDiagramConnectors()
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