async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}
async function createFile()
{
    let text = await getTitle();
    text = text.split("/")[4];
    const blob = new Blob([text], { type: 'text/plain' });
    const fileurl = URL.createObjectURL(blob);
    const filename = `${text}.cpp`;

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
    downloading.then((id) => { console.log(id) }, (error) => { console.log(error) });
}
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "generate") {
        downloadFile();
    }
})

