async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}
function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
}

async function createFile() {
    let text = await getTitle();
    text = text.split("/")[4].replaceAll("-", "_");
    const title = text;
    const tab = await getCurrentTab();
    const tabId = tab[0].id;

    const response = await browser.tabs.sendMessage(tabId, { command: "send_examples" });
    if (response.type === "examples") {
        text += "\n" + response.data;
        console.log(response.data);
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

