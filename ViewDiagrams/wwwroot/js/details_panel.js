﻿'use strict'

let uniqueInputFieldId = 0
function GenerateTextField(fieldName, fieldValue, sourceObject, onChange = () => {
    RegenerateCurrentDiagram()
    UpateJsonDocumentViewer()
}) {
    const container = document.createElement('div')
    container.classList.add('col-md', 'mt-1')

    const formContainer = document.createElement('div')
    formContainer.classList.add('form-floating')

    const inputId = `input-u${++uniqueInputFieldId}`

    const input = document.createElement('input')
    input.classList.add('form-control')
    input.id = inputId
    input.value = fieldValue.toString()
    input.oninput = function () {
        sourceObject[fieldName] = input.value
        onChange()
    }

    const label = document.createElement('label')
    label.htmlFor = inputId
    label.innerText = fieldName

    container.appendChild(formContainer)
    formContainer.appendChild(input)
    formContainer.appendChild(label)
    return container
}

// List

function GenerateListHeader(name, items, genPropetyFunc, onAddFunc = UpdateCurrentDiagram) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')

    const p = document.createElement('p')
    p.classList.add('mb-0')
    p.innerText = name
    li.appendChild(p)

    const addButton = document.createElement('button')
    addButton.classList.add('btn', 'p-0', 'ms-auto')
    addButton.onclick = function () {
        let newProp = genPropetyFunc(name)
        if (newProp !== undefined) {
            items.push(newProp)
            onAddFunc(newProp)
        }
    }

    const addButtonIcon = document.createElement('i')
    addButtonIcon.classList.add('bi', 'bi-plus-circle', 'fs-5')
    addButton.appendChild(addButtonIcon)

    li.appendChild(addButton)

    ul.appendChild(li)
    return ul
}

function GenerateListItem(itemElem, items, index, onRemoveFunc = UpdateCurrentDiagram) {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'flex-row')

    const removeButton = document.createElement('button')
    removeButton.classList.add('btn', 'p-0', 'border-0', 'mt-2', 'align-self-start')
    removeButton.onclick = function () {
        items.splice(index, 1)
        onRemoveFunc(index)
    }

    const removeButtonIcon = document.createElement('i')
    removeButtonIcon.classList.add('bi', 'bi-x', 'fs-5')
    removeButton.appendChild(removeButtonIcon)

    li.appendChild(itemElem)
    li.appendChild(removeButton)
    return li
}

function GenerateListItems(name, items, genPropetyFunc) {
    let list = GenerateListHeader(name, items, genPropetyFunc)
    for (var i = 0; i < items.length; i++) {
        list.appendChild(GenerateListItem(GenerateInputField(i, items[i], items, genPropetyFunc), items, i,))
    }
    return list
}

// Group

function GenerateGroup(name, object, genPropetyFunc) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const liHeader = document.createElement('li')
    liHeader.classList.add('list-group-item')
    liHeader.innerText = name
    ul.appendChild(liHeader)

    let propNames = Object.getOwnPropertyNames(object)
    propNames.forEach((propName) => {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.appendChild(GenerateInputField(propName, object[propName], object, genPropetyFunc))
        ul.appendChild(li)
    })
    return ul
}

function GenerateInputField(name, value, sourceObject, genPropetyFunc) {
    if (typeof value === "string" || typeof value === "number") {
        return GenerateTextField(name, value, sourceObject)
    }
    else if (Array.isArray(value)) {
        return GenerateListItems(name, value, genPropetyFunc)
    }
    else if (typeof value === "object") {
        return GenerateGroup(name, value, genPropetyFunc)
    }
    return document.createElement('div')
}

let parametersPanel = document.getElementById("diagram-parameters")
function GenerateParametersPanel(diagram) {
    let elements = []
    if (diagram !== undefined) {
        let properties = Object.getOwnPropertyNames(diagram)
        if (properties.includes('Type')) {
            let genPropetyFunc = GetGeneratePropertyFunc(diagram['Type'])
            properties.forEach((propName) => {
                if (propName === 'Type') return

                let propValue = IgnoreWorkspacePrivateFields(propName, diagram[propName])
                if (propValue !== undefined)
                    elements.push(GenerateInputField(propName, propValue, diagram, genPropetyFunc))
            })
        }
    }

    while (parametersPanel.firstChild) {
        parametersPanel.removeChild(parametersPanel.lastChild)
    }
    elements.forEach((elem) => parametersPanel.appendChild(elem))
}

function GenerateRelationshipListItem(name, object) {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'mt-2')

    const liHeader = document.createElement('li')
    liHeader.classList.add('list-group-item')
    liHeader.innerText = name
    ul.appendChild(liHeader)

    let propNames = Object.getOwnPropertyNames(object)
    propNames.forEach((propName) => {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.appendChild(GenerateTextField(propName, object[propName], object, () => { RegenerateCurrentDiagramConnectors() }))
        ul.appendChild(li)
    })
    return ul
}

function GenerateRelationshipPanelListItems(diagram) {
    let relations = workspaceDocument.Connectors
    const propGenFunc = () => {
        return {
            "Type": "Aggregation",
            "From": diagram.Name,
            "To": "None"
        }
    }
    let list = GenerateListHeader("Relationship", relations, propGenFunc, (newProp) => {
        UpdateCurrentDiagram()
    })
    for (var i = 0; i < relations.length; i++) {
        if (diagram.Name === relations[i].From || diagram.Name === relations[i].To)
            list.appendChild(GenerateListItem(GenerateRelationshipListItem(i, relations[i]), relations, i))
    }
    return list
}

let relationshipPanel = document.getElementById("diagram-relationship")
function GenerateRelationshipPanel(diagram) {
    let elements = []
    if (diagram !== undefined) {
        elements.push(GenerateRelationshipPanelListItems(diagram))
    }

    while (relationshipPanel.firstChild) {
        relationshipPanel.removeChild(relationshipPanel.lastChild)
    }
    elements.forEach((elem) => relationshipPanel.appendChild(elem))
}

function GenerateDetailsPanel(diagram) {
    GenerateRelationshipPanel(diagram)
    GenerateParametersPanel(diagram)
}

let currentSelectedDiagramIndex = -1
function GenerateDetailsPanelById(id) {
    if (GenerateDetailsPanelById === -1) GenerateDetailsPanel(Object())
    if (id !== currentSelectedDiagramIndex) {
        currentSelectedDiagramIndex = id
        GenerateDetailsPanel(GetDiagramById(id))
    }
}

function GenerateDetailsPanelByElement(elem) {
    GenerateDetailsPanelById(GetDiagramIdByElement(elem))
}

function RegenerateDetailsPanel() {
    GenerateDetailsPanel(GetDiagramById(currentSelectedDiagramIndex))
}

document.getElementById("remove-diagram-btn").onclick = () => {
    RemoveSelectedDiagram()
}
