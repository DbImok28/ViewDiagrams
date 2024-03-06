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

let DiagramObjectTemplates = new Map()
function CreateDiagram(type, pos) {
    let diagram = DiagramObjectTemplates.get(type)
    diagram.Type = type
    diagram.Position = { "X": pos.x, "Y": pos.y }
    diagram.Element = null
    return diagram
}


let DiagramPropertyTemplates = new Map()
function GetGeneratePropertyFunc(diagramType) {
    return DiagramPropertyTemplates.get(diagramType)
}



let GenerateDiagramsFunctionsList = new Map()
function GenerateDiagram(params) {
    let func = GenerateDiagramsFunctionsList.get(params.Type)
    if (func !== undefined) return func(params)
    return undefined;
}
