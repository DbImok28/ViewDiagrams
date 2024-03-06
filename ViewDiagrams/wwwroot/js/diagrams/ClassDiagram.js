'use strict'

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

GenerateDiagramsFunctionsList.set("ClassDiagram", GenerateClassDiagram)
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
