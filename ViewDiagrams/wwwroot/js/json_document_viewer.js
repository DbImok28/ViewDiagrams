'use strict'

let jsonDocumentViewer = document.getElementById("json-document-viewer")
let showFullDocument = false
if (isGuest) {
    jsonDocumentViewer.setAttribute("readonly", true)
}
function UpateJsonDocumentViewer() {
    let content
    if (showFullDocument) content = workspaceDocument
    else content = GetPage()
    jsonDocumentViewer.value = JSON.stringify(content, IgnoreWorkspacePrivateFields, 4)
}
jsonDocumentViewer.oninput = () => {
    try {
        let data = JSON.parse(jsonDocumentViewer.value)

        if (showFullDocument) workspaceDocument = data
        else GetPage() = data

        RegenerateDiagrams()
        GenerateDiagramsConnectors()
    } catch (e) { }
}

document.getElementById("input-ShowFullDocument").onchange = (e) => {
    console.log(e.target.checked)
    showFullDocument = e.target.checked
    UpateJsonDocumentViewer()
}
console.log(document.getElementById("input-ShowFullDocument").onchange)