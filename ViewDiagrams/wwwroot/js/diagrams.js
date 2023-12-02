'use strict'

function ClearDiagramsSvgContainer() {
    while (diagramsSvgContainer.firstChild)
        diagramsSvgContainer.removeChild(diagramsSvgContainer.lastChild)
}

let workspace = document.getElementsByClassName("work-space")[0]
function RegenerateDiagrams() {
    let elements = []
    for (var i = 0; i < workspaceDocument.Diagrams.length; i++) {
        let elem = GenerateDiagram(workspaceDocument.Diagrams[i])
        workspaceDocument.Diagrams[i].Element = elem
        elements.push(elem)
    }
    ClearDiagramsSvgContainer()
    elements.forEach((elem) => diagramsSvgContainer.appendChild(elem))
}

function RegenerateDiagram(index) {
    let elem = GenerateDiagram(workspaceDocument.Diagrams[index])
    diagramsSvgContainer.replaceChild(elem, workspaceDocument.Diagrams[index].Element)
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
