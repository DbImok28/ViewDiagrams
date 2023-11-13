'use strict'

document.addEventListener('DOMContentLoaded', function () {
    let work_spaces = document.getElementsByClassName("work-space")
    for (let i = 0; i < work_spaces.length; i++) {
        makeWorkSpace(work_spaces[i])
    }
})

// Workspace
function makeWorkSpace(work_space) {
    work_space.onmousedown = onClick
    let work_space_view = work_space.closest('.work-space-view')
    setScrollAtCenter(work_space_view, work_space)

    function onClick(e) {
        let dragElem = e.target
        if (dragElem.className === "draggable-header") {
            let diagramId = GetDiagramIdByElement(dragElem.closest('.diagram'))
            GenerateDetailsPanelById(diagramId)
            startDragMove(e, dragElem.closest('.draggable'), (elem, pos) => {
                setElementPosition(elem, getPosOnGrid(pos))
            },
                (elem, pos) => {
                    let diagram = GetDiagramById(diagramId)
                    let gridPos = getPosOnGrid(pos)
                    if (diagram.Position.X !== gridPos.x || diagram.Position.Y !== gridPos.y) {
                        diagram.Position.X = pos.x
                        diagram.Position.Y = pos.y
                        UpateJsonDocumentViewer()
                        RegenerateDetailsPanel()
                    }
                },
            )
        }
        else if (!dragElem.closest('.draggable')) startDragScroll(e, work_space_view)
    }
}

function setScrollAtCenter(work_space_view, work_space) {
    let compStyles = getComputedStyle(work_space)
    let width = parseInt(compStyles.getPropertyValue('--work-space-width'));
    let height = parseInt(compStyles.getPropertyValue('--work-space-height'));

    let clientWidth = work_space_view.clientWidth;
    let clientHeight = work_space_view.clientHeight;

    work_space_view.scrollTo(width / 2 - clientWidth / 2, height / 2 - clientHeight / 2)
}

let gridSnap = 10;
function getPosOnGrid(pos) {
    //setElementPosition(elem, Math.round(pos.x / gridSnap) * gridSnap, Math.round(pos.y / gridSnap) * gridSnap)
    return {
        x: Math.round(pos.x / gridSnap) * gridSnap,
        y: Math.round(pos.y / gridSnap) * gridSnap
    }
}

function setElementPosition(elem, pos) {
    elem.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}

// Drag move

function getTranslateXY(elem) {
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

    let elemPos = getTranslateXY(elem)

    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag

    function elementDrag(e) {
        e.preventDefault()

        const dx = curPos.x - e.clientX
        const dy = curPos.y - e.clientY

        curPos.x = e.clientX
        curPos.y = e.clientY

        elemPos.x = elemPos.x - dx;
        elemPos.y = elemPos.y - dy;

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
