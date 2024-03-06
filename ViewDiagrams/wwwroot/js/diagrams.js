'use strict'

function ClearDiagramsSvgContainer() {
    while (diagramsSvgContainer.firstChild)
        diagramsSvgContainer.removeChild(diagramsSvgContainer.lastChild)
}

let workspace = document.getElementsByClassName("work-space")[0]
function RegenerateAllDiagram() {
    let elements = []
    let page = GetPage()
    for (var i = 0; i < page.Diagrams.length; i++) {
        let elem = GenerateDiagram(page.Diagrams[i])
        page.Diagrams[i].Element = elem
        elements.push(elem)
    }
    ClearDiagramsSvgContainer()
    elements.forEach((elem) => diagramsSvgContainer.appendChild(elem))
}

function RegenerateDiagram(index = -1) {
    if (index === -1) index = currentSelectedDiagramIndex

    let page = GetPage()
    let elem = GenerateDiagram(page.Diagrams[index])
    diagramsSvgContainer.replaceChild(elem, page.Diagrams[index].Element)
    page.Diagrams[index].Element = elem

    RegenerateDiagramConnectors(index)
}

function GetDiagramIdByElement(elem) {
    let page = GetPage()
    for (var i = 0; i < page.Diagrams.length; i++) {
        if (page.Diagrams[i].Element == elem) {
            return i
        }
    }
}

function GetDiagramByElement(elem) {
    return GetPage().Diagrams[GetDiagramIdByElement(elem)]
}

function GetDiagramById(id) {
    return GetPage().Diagrams[id]
}




function PageSelectorSwapPage(index) {
    SwapPage(index)
    UpdateAllDiagrams()
}

function GeneratePageSelectorItem(elem, index, name) {
    return elem.insertAdjacentHTML('beforeend', `<button class="btn p-2 h-100 border border-2 ${selectedPageIndex === index ? "selected-page" : "uselected-page"}" onclick="PageSelectorSwapPage(${index})">${name}</button>`)
}
function RegeneratePageSelector() {
    let elem = document.getElementById("page-selector")
    while (elem.firstChild) elem.removeChild(elem.lastChild)
    workspaceDocument.Pages.forEach((page, index) => { GeneratePageSelectorItem(elem, index, page.PageName) })
}

function PageSelectorGeneratePage() {
    const index = workspaceDocument.Pages.length + 1
    const pageName = `Page ${index}`
    AddPage(pageName)
    const elem = document.getElementById("page-selector")
    GeneratePageSelectorItem(elem, index, pageName)
}

