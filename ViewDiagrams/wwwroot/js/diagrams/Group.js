'use strict'

DiagramObjectTemplates.set("Group", {
    "Width": 1000,
    "Height": 500,
    "Name": "Group"
})

GenerateDiagramsFunctionsList.set("Group", GenerateGroupDiagram)
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
