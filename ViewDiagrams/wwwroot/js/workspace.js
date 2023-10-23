function SaveWorkSpace() {
    let settings = GetAllInputFieldsAsJson()
    fetch("https://localhost:32768/WorkSpace/SaveSettings", {
        method: 'post',
        body: settings,
        headers: {
            'Content-Type': 'application/json'
        }
        //}).then(() => {
        //    return;
    }).then((res) => {
        if (res.status === 201) {
            console.log("Post successfully created!")
        }
    }).catch((error) => {
        console.log(error)
    })
}

function GetAllInputFieldsAsJson() {
    let settingsAsJson = '{'
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let pageName = settingsPages[i].id.substr("settings-".length)

        settingsAsJson += `"${pageName}":{`
        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')

        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substr("input-".length)
            let inputValue;
            if (inputs[j].type === "checkbox") {
                inputValue = inputs[j].checked;
            }
            else if (inputs[j].type === "text") {
                inputValue = `"${inputs[j].value}"`;
            }
            else if (inputs[j].type === "select-one") {
                inputValue = inputs[j].selectedIndex;
            }
            settingsAsJson += `"${inputName}":${inputValue}`
            if (j < inputs.length - 1) settingsAsJson += ','
        }
        settingsAsJson += '}'
        if (i < settingsPages.length - 1) settingsAsJson += ','
    }
    settingsAsJson += '}'
    return settingsAsJson
}

function SetAllInputFieldsAsJson(jsonSettings) {
    let settings = JSON.parse(jsonSettings)
    let settingsPages = document.querySelectorAll('div[id^="settings-"]')
    for (let i = 0; i < settingsPages.length; i++) {
        let pageName = settingsPages[i].id.substr("settings-".length)
        let settingsPage = settings[pageName]

        let inputs = settingsPages[i].querySelectorAll('*[id^="input-"]')
        for (let j = 0; j < inputs.length; j++) {
            let inputName = inputs[j].id.substr("input-".length)
            let inputValue = settingsPage[inputName]

            if (inputs[j].type === "checkbox") {
                inputs[j].checked = inputValue
            }
            else if (inputs[j].type === "text") {
                inputs[j].value = inputValue
            }
            else if (inputs[j].type === "select-one") {
                inputs[j].selectedIndex = inputValue
            }
        }
    }
}