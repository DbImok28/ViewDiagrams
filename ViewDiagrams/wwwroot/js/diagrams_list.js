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
DiagramObjectTemplates.set("ClassDiagram", {
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
    ]
})
DiagramObjectTemplates.set("Comment", {
    "RowCount": 5,
    "Content": "..."
})
DiagramObjectTemplates.set("Group", {
    "Width": 1000,
    "Height": 500,
    "Name": "Group"
})

function CreateDiagram(type, pos) {
    let diagram = DiagramObjectTemplates.get(type)
    diagram.Type = type
    diagram.Position = { "X": pos.x, "Y": pos.y }
    diagram.Element = null
    return diagram
}


let DiagramPropertyTemplates = new Map()
DiagramPropertyTemplates.set("ClassDiagram", new Map([
    [
        "Properties",
        {
            "Type": "int",
            "Name": "New property",
            "AccessModifier": "Public"
        }],
    [
        "Methods",
        {
            "AccessModifier": "Public",
            "ReturnType": "string",
            "Name": "Method 1",
            "Arguments": []
        }],
    [
        "Arguments",
        {
            "Type": "string",
            "Name": "name"
        }],
    [
        "Attributes",
        {
            "Name": "Attribute 1",
            "Arguments": []
        }],
    [
        "TemplateArguments",
        {
            "Name": "T",
            "Type": "typename"
        }],
    [
        "Comments", "Comment"
    ]
]))
function GetGeneratePropertyFunc(diagramType) {
    return DiagramPropertyTemplates.get(diagramType)
}



let GenerateDiagramsFunctionsList = new Map()
GenerateDiagramsFunctionsList.set("ClassDiagram", GenerateClassDiagram)
GenerateDiagramsFunctionsList.set("Comment", GenerateCommentDiagram)
GenerateDiagramsFunctionsList.set("Group", GenerateGroupDiagram)

function GenerateDiagram(params) {
    let func = GenerateDiagramsFunctionsList.get(params.Type)
    if (func !== undefined) return func(params)
    return undefined;
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
