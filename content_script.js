function getExamples() {
    const descriptionClassName = "elfjS";
    const description = document.body.querySelector(`div.${descriptionClassName}`)
    console.log(description.textContent);
    return description.textContent;
}
function sendExamples(request, sender, sendResponse) {
    console.log("sending examples....");
    const examples = getExamples();
    sendResponse({
        type: "examples",
        data: examples
    })
}
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.command === "send_examples") {
        sendExamples(message, sender, sendResponse);
    }
})