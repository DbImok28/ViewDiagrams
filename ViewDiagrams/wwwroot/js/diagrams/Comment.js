'use strict'

DiagramObjectTemplates.set("Comment", {
    "RowCount": 5,
    "Content": "..."
})

GenerateDiagramsFunctionsList.set("Comment", GenerateCommentDiagram)
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
