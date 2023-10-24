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
        if (dragElem.className === "draggable-header") startDragMove(e, dragElem.closest('.draggable'))
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

function getTranslateXY(elem) {
    const style = window.getComputedStyle(elem)
    const matrix = new DOMMatrixReadOnly(style.transform)
    return {
        x: matrix.m41,
        y: matrix.m42
    }
}

function moveOnGrid(elem, pos) {
    let gridSnap = 10;
    setElementPosition(elem, Math.round(pos.x / gridSnap) * gridSnap, Math.round(pos.y / gridSnap) * gridSnap)
}

function setElementPosition(elem, x, y) {
    elem.style.transform = `translate(${x}px, ${y}px)`;
}

function startDragMove(e, elem) {
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

        moveOnGrid(elem, elemPos)
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

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
