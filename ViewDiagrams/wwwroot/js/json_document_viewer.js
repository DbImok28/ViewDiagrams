'use strict'

let jsonDocumentViewer = document.getElementById("json-document-viewer")
function UpateJsonDocumentViewer() {
    jsonDocumentViewer.value = JSON.stringify(workspaceDocument, IgnoreWorkspacePrivateFields, 4)
}
jsonDocumentViewer.oninput = () => {
    try {
        workspaceDocument = JSON.parse(jsonDocumentViewer.value)
        RegenerateDiagrams()
        GenerateDiagramsConnectors()
    } catch (e) { }
}
