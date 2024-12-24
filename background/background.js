async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}
function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
}

async function createFile() {
    let title = await getTitle();
    title = title.split("/")[4].replaceAll("-", "_");
    const tab = await getCurrentTab();
    const tabId = tab[0].id;

    let text = `#include <bits/stdc++.h>\nusing namespace std;\n`;

    const response = await browser.tabs.sendMessage(tabId, { command: "send_data" });
    if (response.type === "data") {
        const description = response.data.description;
        text += "\n" + "/*" + description + "*/";
        text += "\nint main() {\n"
        let j = 1;
        response.data.examples.forEach((example)=>{
            for(let i=0;i<example.input.length;i++) {
                // console.log(example.input[i]);
                const key = Object.keys(example.input[i]).toString();
                text += "\t" + key + j + " = " + example.input[i][key].replaceAll("[", "{").replaceAll("]", "}") + ";\n";
            }
            console.log(example.output);
            text += `\toutput${j} = ${example.output["Output"].replaceAll("[", "{").replaceAll("]", "}")};\n\n`
            j++;
        })
        text += "\treturn 0;\n}";
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

