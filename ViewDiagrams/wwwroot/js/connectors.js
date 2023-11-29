'use strict'

function ClearConnectors() {
    while (workspaceSvgContainer.firstChild)
        workspaceSvgContainer.removeChild(workspaceSvgContainer.lastChild)
}

function AddConnector(fromPos, toPos) {
    const xmlns = "http://www.w3.org/2000/svg";
    let line = document.createElementNS(xmlns, "line")
    line.setAttributeNS(null, "x1", fromPos.x)
    line.setAttributeNS(null, "y1", fromPos.y)
    line.setAttributeNS(null, "x2", toPos.x)
    line.setAttributeNS(null, "y2", toPos.y)
    line.setAttributeNS(null, "stroke", "#000")
    line.setAttributeNS(null, "stroke-width", 2)
    line.setAttributeNS(null, "marker-end", "url(#arrowhead-end)")
    line.setAttributeNS(null, "marker-start", "url(#arrowhead-start)")

    workspaceSvgContainer.appendChild(line)
}

function FindIntersectionPoint(p1, p2, rect) {
    let line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }

    for (let i = 0; i < rect.length; i++) {
        let p3 = rect[i]
        let p4 = rect[(i + 1) % rect.length]

        let result = GetIntersection(line, { x1: p3.x, y1: p3.y, x2: p4.x, y2: p4.y })

        if (result.onSegment1 && result.onSegment2) {
            return { x: result.x, y: result.y }
        }
    }

    return null;
}

function GetIntersection(line1, line2) {
    let denominator = (line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1)
    let ua = ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) - (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) / denominator
    let ub = ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) - (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) / denominator

    let onSegment1 = ua >= 0 && ua <= 1
    let onSegment2 = ub >= 0 && ub <= 1

    let x = line1.x1 + ua * (line1.x2 - line1.x1)
    let y = line1.y1 + ua * (line1.y2 - line1.y1)

    return { x, y, onSegment1, onSegment2 }
}

function ClientRectToArrRect(pos, clientRect) {
    return [
        pos,
        { x: pos.x + clientRect.width, y: pos.y },
        { x: pos.x + clientRect.width, y: pos.y + clientRect.height },
        { x: pos.x, y: pos.y + clientRect.height }
    ]
}

function PosToRectCenter(pos, clientRect) {
    return { x: pos.x + clientRect.width / 2, y: pos.y + clientRect.height / 2 }
}

function CreateDiagramConnector(diagramFrom, diagramTo) {
    let diagramFromPos = GetTranslateXY(diagramFrom.Element)
    let diagramFromClientRect = diagramFrom.Element.getBoundingClientRect()
    let diagramFromRect = ClientRectToArrRect(diagramFromPos, diagramFromClientRect)
    let diagramFromRectCenter = PosToRectCenter(diagramFromPos, diagramFromClientRect)

    let diagramToPos = GetTranslateXY(diagramTo.Element)
    let diagramToClientRect = diagramTo.Element.getBoundingClientRect()
    let diagramToRect = ClientRectToArrRect(diagramToPos, diagramToClientRect)
    let diagramToRectCenter = PosToRectCenter(diagramToPos, diagramToClientRect)

    let fromPos = FindIntersectionPoint(diagramFromRectCenter, diagramToRectCenter, diagramFromRect)
    let toPos = FindIntersectionPoint(diagramFromRectCenter, diagramToRectCenter, diagramToRect)

    if (fromPos !== null && toPos !== null)
        AddConnector(fromPos, toPos)
}

function GenerateDiagramsConnectors() {
    ClearConnectors()
    workspaceDocument.Connectors.forEach((connector) => {
        let diagramFrom = workspaceDocument.Diagrams.find((x) => x.Name === connector.From)
        let diagramTo = workspaceDocument.Diagrams.find((x) => x.Name === connector.To)
        if (diagramFrom !== undefined && diagramTo !== undefined)
            CreateDiagramConnector(diagramFrom, diagramTo)
    })
}

function RegenerateDiagramConnectors(index) {
    // TODO:Update by index
    GenerateDiagramsConnectors()
}

function RegenerateCurrentDiagramConnectors() {
    RegenerateDiagramConnectors(currentSelectedDiagramIndex)
}