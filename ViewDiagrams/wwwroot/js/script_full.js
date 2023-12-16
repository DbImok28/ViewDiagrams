'use strict'

function setScrollAtCenter(workspace_view, workspace) {
    let compStyles = getComputedStyle(workspace)
    let width = parseInt(compStyles.getPropertyValue('--work-space-width'))
    let height = parseInt(compStyles.getPropertyValue('--work-space-height'))

    let clientWidth = workspace_view.clientWidth
    let clientHeight = workspace_view.clientHeight

    workspace_view.scrollTo(width / 2 - clientWidth / 2, height / 2 - clientHeight / 2)
}

let gridSnap = 10
function getPosOnGrid(pos) {
    return {
        x: Math.round(pos.x / gridSnap) * gridSnap,
        y: Math.round(pos.y / gridSnap) * gridSnap
    }
}

function setElementPosition(elem, pos) {
    elem.style.transform = `translate(${pos.x}px, ${pos.y}px)`
}

function getPositionInWorkspaceByEvent(workspace, e) {
    var rect = workspace.getBoundingClientRect()
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }
}

// Drag move

function GetTranslateXY(elem) {
    const style = window.getComputedStyle(elem)
    const matrix = new DOMMatrixReadOnly(style.transform)
    return {
        x: matrix.m41,
        y: matrix.m42
    }
}

function startDragMove(e, elem, onMoveFunc, onEndMove) {
    e.preventDefault()

    let curPos = {
        x: e.clientX,
        y: e.clientY
    }

    let elemPos = GetTranslateXY(elem)

    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag

    function elementDrag(e) {
        e.preventDefault()

        const dx = curPos.x - e.clientX
        const dy = curPos.y - e.clientY

        curPos.x = e.clientX
        curPos.y = e.clientY

        elemPos.x = elemPos.x - dx
        elemPos.y = elemPos.y - dy

        onMoveFunc(elem, elemPos)
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
        onEndMove(elem, elemPos)
    }
}

// Drag scroll

function startDragScroll(e, elem) {
    elem.style.cursor = 'grabbing'
    elem.style.userSelect = 'none'

    let pos = {
        left: elem.scrollLeft,
        top: elem.scrollTop,

        x: e.clientX,
        y: e.clientY,
    }

    document.onmouseup = mouseUpHandler
    document.onmousemove = mouseMoveHandler

    function mouseMoveHandler(e) {
        const dx = e.clientX - pos.x
        const dy = e.clientY - pos.y

        elem.scrollTop = pos.top - dy
        elem.scrollLeft = pos.left - dx
    }

    function mouseUpHandler() {
        elem.style.cursor = 'grab'
        elem.style.removeProperty('user-select')

        document.onmouseup = null
        document.onmousemove = null
    }
}

let dragDiagramType = ""
let prevDiagramElem = undefined
// Workspace
function makeWorkSpace(workspace) {
    workspace.onmousedown = onClick
    workspace.ondrop = onDrop
    workspace.ondragover = onDragOver
    workspace.ondragleave = onDragLeave
    let workspace_view = workspace.closest('.work-space-view')
    setScrollAtCenter(workspace_view, workspace)

    function onClick(e) {
        let dragElem = e.target
        if (dragElem.getAttribute("class") === "draggable-header") {
            let diagramElem = dragElem.closest('.diagram')
            if (diagramElem !== null) {
                let diagramId = GetDiagramIdByElement(dragElem.closest('.diagram'))
                if (isGuest) {
                    GenerateDetailsPanelById(diagramId)
                    return
                }

                GenerateDetailsPanelById(diagramId)
                startDragMove(e, dragElem.closest('.draggable'),
                    (elem, pos) => {
                        setElementPosition(elem, getPosOnGrid(pos))
                        RegenerateDiagramConnectors(diagramId)
                    },
                    (elem, pos) => {
                        let diagram = GetDiagramById(diagramId)
                        let gridPos = getPosOnGrid(pos)
                        if (diagram.Position.X !== gridPos.x || diagram.Position.Y !== gridPos.y) {
                            diagram.Position.X = gridPos.x
                            diagram.Position.Y = gridPos.y
                            UpateJsonDocumentViewer()
                            RegenerateDetailsPanel()
                            RegenerateDiagramConnectors(diagramId)
                        }
                    },
                )
            }
            else {
                startDragMove(e, dragElem.closest('.draggable'),
                    (elem, pos) => {
                        setElementPosition(elem, getPosOnGrid(pos))
                    },
                    (elem, pos) => { },
                )
            }
        }
        else if (!dragElem.closest('.draggable')) {
            GenerateDetailsPanelById(-1)
            startDragScroll(e, workspace_view)
        }
    }

    function onDrop(e) {
        if (dragDiagramType === "") return
        e.preventDefault()

        if (prevDiagramElem !== undefined) {
            prevDiagramElem.remove()
            prevDiagramElem = undefined
        }

        AddDiagram(CreateDiagram(dragDiagramType, getPosOnGrid(getPositionInWorkspaceByEvent(workspace, e))))
        dragDiagramType = ""
    }

    function onDragOver(e) {
        if (dragDiagramType === "") return
        e.preventDefault()

        if (prevDiagramElem === undefined) {
            prevDiagramElem = GenerateDiagram(CreateDiagram(dragDiagramType, { x: 0, y: 0 }))
            diagramsSvgContainer.appendChild(prevDiagramElem)
        }
        let pos = getPosOnGrid(getPositionInWorkspaceByEvent(workspace, e))
        pos.x = pos.x + 5
        pos.y = pos.y + 5
        setElementPosition(prevDiagramElem, pos)
    }

    function onDragLeave(e) {
        if (dragDiagramType === "") return
        e.preventDefault()

        if (prevDiagramElem !== undefined) {
            prevDiagramElem.remove()
            prevDiagramElem = undefined
        }
    }
}

function startDragDiagram(e) {
    dragDiagramType = e.target.id

    e.dataTransfer.setDragImage(new Image(), 0, 0);
}

document.addEventListener('DOMContentLoaded', function () {
    let diagList = document.getElementsByClassName("add-diag")
    for (let i = 0; i < diagList.length; i++) {
        diagList[i].setAttribute("draggable", "true")
        diagList[i].ondragstart = startDragDiagram
    }

    let work_spaces = document.getElementsByClassName("work-space")
    for (let i = 0; i < work_spaces.length; i++) {
        makeWorkSpace(work_spaces[i])
    }
})


/* global bootstrap: false */

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl)
})

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
'use strict'

function IgnoreWorkspacePrivateFields(key, value) {
    if (key == "Element") return undefined
    else return value
}

let uniqueSvgDefId = 0

function MakeMultiLineText(rowsCount, rowLen, content, posX, posY) {
    const xmlns = "http://www.w3.org/2000/svg";

    const group = document.createElementNS(xmlns, 'g')

    let def = document.createElementNS(xmlns, "defs")
    let path = document.createElementNS(xmlns, "path")
    const pathId = `path-${++uniqueSvgDefId}`

    const rowOffset = 15
    let pathPos = ''
    for (var i = 0; i < rowsCount; i++) {
        pathPos += `M${posX},${posY + i * rowOffset} H${rowLen} `
    }
    path.setAttributeNS(null, "id", pathId)
    path.setAttributeNS(null, "d", pathPos)
    def.appendChild(path)

    let text = document.createElementNS(xmlns, "text")
    text.setAttributeNS(null, "font-size", 14)

    let textPath = document.createElementNS(xmlns, "textPath")
    textPath.setAttributeNS(null, "href", `#${pathId}`)
    textPath.textContent = content
    text.appendChild(textPath)

    group.appendChild(def)
    group.appendChild(text)

    return group
}

function AccessModifierToChar(accessModifier) {
    switch (accessModifier) {
        case "Public": return '+'
        case "Private": return '-'
        case "Protected": return '#'
        default: return '-'
    }
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
                    "Type": "int",
                    "Name": "New Property",
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
        case "Comment": return {
            "Type": "Comment",
            "RowCount": 5,
            "Content": "...",
            "Position": { "X": pos.x, "Y": pos.y },

            "Element": null
        }
        case "Group": return {
            "Type": "Group",
            "Width": 1000,
            "Height": 500,
            "Name": "Group",
            "Position": { "X": pos.x, "Y": pos.y },

            "Element": null
        }
        default:
    }
}


// Generate new arrays property
function GetGeneratePropertyFunc(diagramType) {
    switch (diagramType) {
        case "ClassDiagram": return GenerateClassDiagramProperty
        case "Comment": return () => { }
        case "Group": return () => { }
        default:
    }
}

function GenerateClassDiagramProperty(propName) {
    switch (propName) {
        case "Properties":
            return {
                "Type": "int",
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
                "Type": "typename"
            }
        case "Comments":
            return "Comment"
        default:
    }
    return undefined
}

// Generate diagram SVG Element
function GenerateDiagram(params) {
    switch (params.Type) {
        case "ClassDiagram": return GenerateClassDiagram(params)
        case "Comment": return GenerateCommentDiagram(params)
        case "Group": return GenerateGroupDiagram(params)
        default:
    }
}

function GenerateGroupDiagram(params) {
    const width = params.Width
    const height = params.Height
    const headerHeight = 40

    const xmlns = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(xmlns, 'g')
    group.setAttributeNS(null, "class", "draggable diagram")
    group.style.transform = `translate(${params.Position.X}px, ${params.Position.Y}px)`

    let headerRect = document.createElementNS(xmlns, "rect")
    headerRect.setAttributeNS(null, "class", "draggable-header")
    headerRect.setAttributeNS(null, "x", 0)
    headerRect.setAttributeNS(null, "y", 0)
    headerRect.setAttributeNS(null, "width", width)
    headerRect.setAttributeNS(null, "height", headerHeight)
    headerRect.setAttributeNS(null, "stroke", "#000")
    headerRect.setAttributeNS(null, "stroke-width", 1)
    headerRect.setAttributeNS(null, "fill", "white")
    group.appendChild(headerRect)

    let headerText = document.createElementNS(xmlns, "text")
    headerText.setAttributeNS(null, "x", width / 2)
    headerText.setAttributeNS(null, "y", headerHeight / 2 + 5)
    headerText.setAttributeNS(null, "text-anchor", "middle")
    headerText.setAttributeNS(null, "fill", "black")
    headerText.setAttributeNS(null, "font-weight", "bold")
    headerText.textContent = params.Name
    group.appendChild(headerText)

    let bodyRect = document.createElementNS(xmlns, "rect")
    bodyRect.setAttributeNS(null, "x", 0)
    bodyRect.setAttributeNS(null, "y", headerHeight)
    bodyRect.setAttributeNS(null, "width", width)
    bodyRect.setAttributeNS(null, "height", height)
    bodyRect.setAttributeNS(null, "stroke", "#000")
    bodyRect.setAttributeNS(null, "stroke-width", 1)
    bodyRect.setAttributeNS(null, "fill", "none")
    group.appendChild(bodyRect)
    return group
}

function GenerateClassDiagram(params) {
    const width = 180
    const headerHeight = 40

    const xmlns = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(xmlns, 'g')
    group.setAttributeNS(null, "class", "draggable diagram")
    group.style.transform = `translate(${params.Position.X}px, ${params.Position.Y}px)`

    let headerRect = document.createElementNS(xmlns, "rect")
    headerRect.setAttributeNS(null, "class", "draggable-header")
    headerRect.setAttributeNS(null, "x", 0)
    headerRect.setAttributeNS(null, "y", 0)
    headerRect.setAttributeNS(null, "width", width)
    headerRect.setAttributeNS(null, "height", headerHeight)
    headerRect.setAttributeNS(null, "stroke", "#000")
    headerRect.setAttributeNS(null, "stroke-width", 1)
    headerRect.setAttributeNS(null, "fill", "white")
    group.appendChild(headerRect)

    let headerText = document.createElementNS(xmlns, "text")
    headerText.setAttributeNS(null, "x", width / 2)
    headerText.setAttributeNS(null, "y", headerHeight / 2 + 5)
    headerText.setAttributeNS(null, "text-anchor", "middle")
    headerText.setAttributeNS(null, "fill", "black")
    headerText.setAttributeNS(null, "font-weight", "bold")
    headerText.textContent = params.Name
    group.appendChild(headerText)

    const textXOffset = 7
    let yOffset = headerHeight + 20

    params.Properties.forEach((item) => {
        let propertyText = document.createElementNS(xmlns, "text")
        propertyText.setAttributeNS(null, "x", textXOffset)
        propertyText.setAttributeNS(null, "y", yOffset)
        propertyText.setAttributeNS(null, "fill", "black")
        propertyText.textContent = `${AccessModifierToChar(item.AccessModifier)} ${item.Name}: ${item.Type}`
        group.appendChild(propertyText)
        yOffset += 20
    })

    yOffset -= 10
    let separateLine = document.createElementNS(xmlns, "line")
    separateLine.setAttributeNS(null, "x1", 0)
    separateLine.setAttributeNS(null, "y1", yOffset)
    separateLine.setAttributeNS(null, "x2", width)
    separateLine.setAttributeNS(null, "y2", yOffset)
    separateLine.setAttributeNS(null, "stroke", "#000")
    separateLine.setAttributeNS(null, "stroke-width", 1)
    group.appendChild(separateLine)

    yOffset += 20
    params.Methods.forEach((item) => {
        let methodText = document.createElementNS(xmlns, "text")
        methodText.setAttributeNS(null, "x", textXOffset)
        methodText.setAttributeNS(null, "y", yOffset)
        methodText.setAttributeNS(null, "fill", "black")

        let paramsStr = ""
        let isFirstParam = true
        item.Arguments.forEach((param) => {
            if (!isFirstParam) paramsStr += ', '
            isFirstParam = false
            paramsStr += `${param.Name}: ${param.Type}`
        })

        methodText.textContent = `${AccessModifierToChar(item.AccessModifier)} ${item.Name}(${paramsStr}): ${item.ReturnType}`
        group.appendChild(methodText)
        yOffset += 20
    })

    yOffset -= headerHeight + 10
    let bodyRect = document.createElementNS(xmlns, "rect")
    bodyRect.setAttributeNS(null, "x", 0)
    bodyRect.setAttributeNS(null, "y", headerHeight)
    bodyRect.setAttributeNS(null, "width", width)
    bodyRect.setAttributeNS(null, "height", yOffset)
    bodyRect.setAttributeNS(null, "stroke", "#000")
    bodyRect.setAttributeNS(null, "stroke-width", 1)
    bodyRect.setAttributeNS(null, "fill", "none")
    group.appendChild(bodyRect)

    if (params.TemplateArguments.length > 0) {
        const templateRectWidth = 100
        const templateRectHeight = params.TemplateArguments.length * 20 + 4 //24
        const templateRectX = width - templateRectWidth / 2
        const templateRectY = -templateRectHeight / 2
        let templateRect = document.createElementNS(xmlns, "rect")
        templateRect.setAttributeNS(null, "x", templateRectX)
        templateRect.setAttributeNS(null, "y", templateRectY)
        templateRect.setAttributeNS(null, "width", templateRectWidth)
        templateRect.setAttributeNS(null, "height", templateRectHeight)
        templateRect.setAttributeNS(null, "stroke", "#000")
        templateRect.setAttributeNS(null, "stroke-width", 1)
        templateRect.setAttributeNS(null, "fill", "white")
        templateRect.setAttributeNS(null, "stroke-dasharray", dottedLine)
        group.appendChild(templateRect)

        yOffset = 4
        params.TemplateArguments.forEach((item) => {
            let templateArgText = document.createElementNS(xmlns, "text")
            templateArgText.setAttributeNS(null, "x", templateRectX + textXOffset)
            templateArgText.setAttributeNS(null, "y", yOffset)
            templateArgText.setAttributeNS(null, "fill", "black")

            templateArgText.textContent = `${item.Name}: ${item.Type}`
            group.appendChild(templateArgText)
            yOffset += 20
        })
    }
    return group
}

function GenerateCommentDiagram(params) {
    const width = 200
    const rowsCount = params.RowCount

    const stickSize = 20
    const height = rowsCount * 14 + stickSize + 18

    const xmlns = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(xmlns, 'g')
    group.setAttributeNS(null, "class", "draggable diagram")
    group.style.transform = `translate(${params.Position.X}px, ${params.Position.Y}px)`

    let commentBackground = document.createElementNS(xmlns, "polygon")
    commentBackground.setAttributeNS(null, "class", "draggable-header")
    commentBackground.setAttributeNS(null, "points", `0,0 ${width - stickSize},0 ${width},${stickSize} ${width},${height} 0,${height}`)
    commentBackground.setAttributeNS(null, "stroke", "#000")
    commentBackground.setAttributeNS(null, "stroke-width", 1)
    commentBackground.setAttributeNS(null, "fill", "white")
    group.appendChild(commentBackground)

    let stick = document.createElementNS(xmlns, "polygon")
    stick.setAttributeNS(null, "points", `${width - stickSize},0 ${width},${stickSize} ${width - stickSize},${stickSize}`)
    stick.setAttributeNS(null, "stroke", "#000")
    stick.setAttributeNS(null, "stroke-width", 1)
    stick.setAttributeNS(null, "fill", "none")
    group.appendChild(stick)

    group.appendChild(MakeMultiLineText(rowsCount, width - 10, params.Content, 8, stickSize + 12))

    return group
}
'use strict'

const dottedLine = "5,5"
const dashedLine = "10,10"
const dashDottedLine = "20,10,5,10"
const dashedLineWithTwoDots = "20,10,5,5,5,10"

function GetConnectorStyle(type) {
    switch (type) {
        case "Association":
            return {
                "MarkerEnd": "arrow-end"
            }
        case "Dependence":
            return {
                "Dashes": dashedLine,
                "MarkerEnd": "arrow-end"
            }
        case "Aggregation":
            return {
                "MarkerStart": "elongated-romb-nofill-start"
            }
        case "Composition":
            return {
                "MarkerStart": "elongated-romb-start"
            }
        case "Implementation":
            return {
                "Dashes": dashedLine,
                "MarkerEnd": "triangle-nofill-end"
            }
        case "Generalization":
        case "Inheritance":
            return {
                "MarkerEnd": "triangle-nofill-end"
            }
        default:
            return {
                "MarkerEnd": "arrow-end"
            }
    }
}

function ClearConnectorsSvgContainer() {
    while (connectorsSvgContainer.firstChild)
        connectorsSvgContainer.removeChild(connectorsSvgContainer.lastChild)
}

function AddConnector(fromPos, toPos, type) {
    const connectorStyle = GetConnectorStyle(type)

    const xmlns = "http://www.w3.org/2000/svg";
    let line = document.createElementNS(xmlns, "line")
    line.setAttributeNS(null, "x1", fromPos.x)
    line.setAttributeNS(null, "y1", fromPos.y)
    line.setAttributeNS(null, "x2", toPos.x)
    line.setAttributeNS(null, "y2", toPos.y)
    line.setAttributeNS(null, "stroke", "#000")
    line.setAttributeNS(null, "stroke-width", 2)

    if (connectorStyle.Dashes !== undefined)
        line.setAttributeNS(null, "stroke-dasharray", connectorStyle.Dashes)
    if (connectorStyle.MarkerStart !== undefined)
        line.setAttributeNS(null, "marker-start", `url(#${connectorStyle.MarkerStart})`)
    if (connectorStyle.MarkerEnd !== undefined)
        line.setAttributeNS(null, "marker-end", `url(#${connectorStyle.MarkerEnd})`)

    connectorsSvgContainer.appendChild(line)
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

function CreateDiagramConnector(diagramFrom, diagramTo, type) {
    let diagramFromPos = GetTranslateXY(diagramFrom.Element)
    let diagramFromClientRect = diagramFrom.Element.getBoundingClientRect()
    let diagramFromRect = ClientRectToArrRect(diagramFromPos, diagramFromClientRect)
    let diagramFromHeaderClientRect = diagramFrom.Element.getElementsByClassName('draggable-header')[0].getBoundingClientRect()
    let diagramFromRectCenter = PosToRectCenter(diagramFromPos, diagramFromHeaderClientRect)


    let diagramToPos = GetTranslateXY(diagramTo.Element)
    let diagramToClientRect = diagramTo.Element.getBoundingClientRect()
    let diagramToRect = ClientRectToArrRect(diagramToPos, diagramToClientRect)
    let diagramToHeaderClientRect = diagramTo.Element.getElementsByClassName('draggable-header')[0].getBoundingClientRect()
    let diagramToRectCenter = PosToRectCenter(diagramToPos, diagramToHeaderClientRect)


    let fromPos = FindIntersectionPoint(diagramFromRectCenter, diagramToRectCenter, diagramFromRect)
    let toPos = FindIntersectionPoint(diagramFromRectCenter, diagramToRectCenter, diagramToRect)

    if (fromPos !== null && toPos !== null)
        AddConnector(getPosOnGrid(fromPos), getPosOnGrid(toPos), type)
}

function GenerateDiagramsConnectors() {
    ClearConnectorsSvgContainer()
    workspaceDocument.Connectors.forEach((connector) => {
        let diagramFrom = workspaceDocument.Diagrams.find((x) => x.Name === connector.From)
        let diagramTo = workspaceDocument.Diagrams.find((x) => x.Name === connector.To)
        if (diagramFrom !== undefined && diagramTo !== undefined)
            CreateDiagramConnector(diagramFrom, diagramTo, connector.Type)
    })
}

function RegenerateDiagramConnectors(index) {
    // TODO:Update by index
    GenerateDiagramsConnectors()
}

function RegenerateCurrentDiagramConnectors() {
    RegenerateDiagramConnectors(currentSelectedDiagramIndex)
}
'use strict'

function GenerateInputHints(inputName) {
    if (inputName == "Type" || inputName == "ReturnType") {
        return ["string", "object", "int", "float", "double", "Array", "List", "Map", "Dictionary", "Set"]
    }
    else if (inputName == "AccessModifier") {
        return ["Public", "Private", "Protected"]
    }
    return null
}

function GetRelationInputHints(inputName) {
    if (inputName == "Type") {
        return ["Association", "Dependence", "Aggregation", "Composition", "Implementation", "Generalization"]
    } else if (inputName == "From" || inputName == "To") {
        return workspaceDocument.Diagrams.map(x => x.Name)
    }
    return null
}

function GenerateHints(hints, hintsId) {
    const datalist = document.createElement('datalist')
    datalist.id = hintsId

    hints.forEach((hint) => {
        if (hint !== undefined) {
            const option = document.createElement('option')
            option.value = hint
            datalist.appendChild(option)
        }
    })
    return datalist
}

let uniqueInputFieldId = 0
function GenerateTextField(fieldName, fieldValue, sourceObject, onChange = () => {
    RegenerateCurrentDiagram()
    UpateJsonDocumentViewer()
}) {
    const container = document.createElement('div')
    container.classList.add('col-md', 'mt-1')

    const formContainer = document.createElement('div')
    formContainer.classList.add('form-floating')

    const id = ++uniqueInputFieldId
    const inputId = `input-u${id}`

    const input = document.createElement('input')
    input.classList.add('form-control')
    input.id = inputId
    input.value = fieldValue.toString()
    input.oninput = function () {
        sourceObject[fieldName] = input.value
        onChange()
    }
    if (isGuest) {
        input.setAttribute("readonly", true)
    }
    formContainer.appendChild(input)

    const hints = GenerateInputHints(fieldName)
    if (hints !== null) {
        const hintsId = `hint-u${id}`
        formContainer.appendChild(GenerateHints(hints, hintsId))
        input.setAttribute("list", hintsId)
    }

    const label = document.createElement('label')
    label.htmlFor = inputId
    label.innerText = fieldName
    formContainer.appendChild(label)

    container.appendChild(formContainer)
    return container
}

// List

function GenerateListHeader(name, items, genPropetyFunc, useAddButton, onAddFunc = UpdateCurrentDiagram) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')

    const p = document.createElement('p')
    p.classList.add('mb-0')
    p.innerText = name
    li.appendChild(p)

    if (useAddButton) {
        const addButton = document.createElement('button')
        addButton.classList.add('btn', 'p-0', 'ms-auto')
        addButton.onclick = function () {
            let newProp = genPropetyFunc(name)
            if (newProp !== undefined) {
                items.push(newProp)
                onAddFunc(newProp)
            }
        }

        const addButtonIcon = document.createElement('i')
        addButtonIcon.classList.add('bi', 'bi-plus-circle', 'fs-5')
        addButton.appendChild(addButtonIcon)
        li.appendChild(addButton)
    }

    ul.appendChild(li)
    return ul
}

function GenerateListItem(itemElem, items, index, useRemoveButton, onRemoveFunc = UpdateCurrentDiagram) {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')

    li.appendChild(itemElem)

    if (useRemoveButton) {
        const removeButton = document.createElement('button')
        removeButton.classList.add('btn', 'p-0', 'border-0', 'mt-2', 'align-self-start')
        removeButton.onclick = function () {
            items.splice(index, 1)
            onRemoveFunc(index)
        }

        const removeButtonIcon = document.createElement('i')
        removeButtonIcon.classList.add('bi', 'bi-x', 'fs-5')
        removeButton.appendChild(removeButtonIcon)

        li.appendChild(removeButton)
    }
    return li
}

function GenerateListItems(name, items, genPropetyFunc) {
    let canAdd = genPropetyFunc(name) !== undefined
    let list = GenerateListHeader(name, items, genPropetyFunc, canAdd)
    for (var i = 0; i < items.length; i++) {
        list.appendChild(GenerateListItem(GenerateInputField(i, items[i], items, genPropetyFunc), items, i, canAdd))
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
        return GenerateGroup(name, value, genPropetyFunc)
    }
    return document.createElement('div')
}

let parametersPanel = document.getElementById("diagram-parameters")
function GenerateParametersPanel(diagram) {
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

    while (parametersPanel.firstChild) {
        parametersPanel.removeChild(parametersPanel.lastChild)
    }
    elements.forEach((elem) => parametersPanel.appendChild(elem))
}




function GenerateRelationshipTextField(fieldName, fieldValue, sourceObject, onChange = () => {
    RegenerateCurrentDiagram()
    UpateJsonDocumentViewer()
}) {
    const container = document.createElement('div')
    container.classList.add('col-md', 'mt-1')

    const formContainer = document.createElement('div')
    formContainer.classList.add('form-floating')

    const id = ++uniqueInputFieldId
    const inputId = `input-u${id}`

    const input = document.createElement('input')
    input.classList.add('form-control')
    input.id = inputId
    input.value = fieldValue.toString()
    input.oninput = function () {
        sourceObject[fieldName] = input.value
        onChange()
    }
    if (isGuest) {
        input.setAttribute("readonly", true)
    }
    formContainer.appendChild(input)

    const hints = GetRelationInputHints(fieldName)
    if (hints !== null) {
        const hintsId = `hint-u${id}`
        formContainer.appendChild(GenerateHints(hints, hintsId))
        input.setAttribute("list", hintsId)
    }

    const label = document.createElement('label')
    label.htmlFor = inputId
    label.innerText = fieldName
    formContainer.appendChild(label)

    container.appendChild(formContainer)
    return container
}

function GenerateRelationshipListItem(name, object) {
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
        li.appendChild(GenerateRelationshipTextField(propName, object[propName], object, () => { RegenerateCurrentDiagramConnectors() }))
        ul.appendChild(li)
    })
    return ul
}

function GenerateRelationshipPanelListItems(diagram) {
    let relations = workspaceDocument.Connectors
    const propGenFunc = () => {
        return {
            "Type": "Aggregation",
            "From": diagram.Name,
            "To": "None"
        }
    }
    let list = GenerateListHeader("Relationship", relations, propGenFunc, true, (newProp) => {
        UpdateCurrentDiagram()
    })
    for (var i = 0; i < relations.length; i++) {
        if (diagram.Name === relations[i].From || diagram.Name === relations[i].To)
            list.appendChild(GenerateListItem(GenerateRelationshipListItem(i, relations[i]), relations, i, true))
    }
    return list
}

let relationshipPanel = document.getElementById("diagram-relationship")
function GenerateRelationshipPanel(diagram) {
    let elements = []
    if (diagram !== undefined) {
        elements.push(GenerateRelationshipPanelListItems(diagram))
    }

    while (relationshipPanel.firstChild) {
        relationshipPanel.removeChild(relationshipPanel.lastChild)
    }
    elements.forEach((elem) => relationshipPanel.appendChild(elem))
}

function GenerateDetailsPanel(diagram) {
    GenerateRelationshipPanel(diagram)
    GenerateParametersPanel(diagram)
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

document.getElementById("remove-diagram-btn").onclick = () => {
    RemoveSelectedDiagram()
}
'use strict'

let jsonDocumentViewer = document.getElementById("json-document-viewer")
if (isGuest) {
    jsonDocumentViewer.setAttribute("readonly", true)
}
function UpateJsonDocumentViewer() {
    jsonDocumentViewer.value = JSON.stringify(workspaceDocument, IgnoreWorkspacePrivateFields, 4)
}
jsonDocumentViewer.oninput = () => {
    try {
        workspaceDocument = JSON.parse(jsonDocumentViewer.value)
        RegenerateDiagrams()
        GenerateDiagramsConnectors()
    } catch (e) { }
}
'use strict'

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
} 'use strict'

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
    if (isGuest) return
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