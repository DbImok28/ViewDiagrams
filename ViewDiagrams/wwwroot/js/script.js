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
    //setElementPosition(elem, Math.round(pos.x / gridSnap) * gridSnap, Math.round(pos.y / gridSnap) * gridSnap)
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
        if (dragElem.className === "draggable-header") {
            let diagramElem = dragElem.closest('.diagram')
            if (diagramElem !== undefined) {
                let diagramId = GetDiagramIdByElement(dragElem.closest('.diagram'))
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
                            diagram.Position.X = pos.x
                            diagram.Position.Y = pos.y
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

        prevDiagramElem = undefined

        AddDiagram(CreateDiagram(dragDiagramType, getPosOnGrid(getPositionInWorkspaceByEvent(workspace, e))))
        dragDiagramType = ""
    }

    function onDragOver(e) {
        if (dragDiagramType === "") return
        e.preventDefault()

        if (prevDiagramElem === undefined) {
            prevDiagramElem = GenerateDiagram(CreateDiagram(dragDiagramType, { x: 0, y: 0 }))
            workspace.appendChild(prevDiagramElem)
        }
        let pos = getPosOnGrid(getPositionInWorkspaceByEvent(workspace, e))
        pos.x = pos.x + 5
        pos.y = pos.y + 5
        setElementPosition(prevDiagramElem, pos)
        //console.log("o")
    }

    function onDragLeave(e) {
        if (dragDiagramType === "") return
        e.preventDefault()

        if (prevDiagramElem !== undefined) {
            prevDiagramElem.remove()
            prevDiagramElem = undefined
        }
        //console.log("r")
    }
}

function startDragDiagram(e) {
    dragDiagramType = e.target.id

    e.dataTransfer.setDragImage(new Image(), 0, 0);
}

document.addEventListener('DOMContentLoaded', function () {
    let diagList = document.getElementsByClassName("add-diag")
    for (let i = 0; i < diagList.length; i++) {
        console.log("diag")
        diagList[i].setAttribute("draggable", "true")
        diagList[i].ondragstart = startDragDiagram
    }

    let work_spaces = document.getElementsByClassName("work-space")
    for (let i = 0; i < work_spaces.length; i++) {
        makeWorkSpace(work_spaces[i])
    }
})
