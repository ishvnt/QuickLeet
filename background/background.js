async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}

function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
}

function generateCppFile(data) {
    const description = data.description;
    const functionPrototype = data.function;
    let text = `#include <bits/stdc++.h>\nusing namespace std;\n`;
    text += "\n" + "/*" + description + "*/\n";
    text += "\n" + functionPrototype + "\n";
    text += "\nint main() {\n"
    let j = 1;
    data.examples.forEach((example) => {
        for (let i = 0; i < example.input.length; i++) {
            const key = Object.keys(example.input[i]).toString();
            text += `\t${key}${j} = ${example.input[i][key].replaceAll("[", "{").replaceAll("]", "}")};\n`;
        }
        console.log(example.output);
        text += `\toutput${j} = ${example.output["Output"].replaceAll("[", "{").replaceAll("]", "}")};\n\n`;
        j++;
    })
    text += "\treturn 0;\n}";
    return text;
}

async function createFile() {
    let title = await getTitle();
    title = title.split("/")[4].replaceAll("-", "_");
    const tab = await getCurrentTab();
    const tabId = tab[0].id;
    let text = "";
    const response = await browser.tabs.sendMessage(tabId, { command: "send_data" });
    if (response.type === "data") {
        text = generateCppFile(response.data);
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const fileurl = URL.createObjectURL(blob);
    const filename = `${title}.cpp`;

    const file = {
        url: fileurl,
        filename: filename,
        saveAs: true,
        conflictAction: "uniquify"
    };
    return file;
}

async function downloadFile() {
    const file = await createFile();
    const downloading = browser.downloads.download(file);
    downloading.then((id) => { console.log(id); }, (error) => { console.log(error); });
}

browser.runtime.onMessage.addListener(
    (message) => {
        if (message.command === "generate") {
            downloadFile();
        }
    }
)

