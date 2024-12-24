function getContent() {
    const contentClassName = "elfjS";
    const content = document.body.querySelector(`div.${contentClassName}`);
    return content.textContent;
}

function extractExamples() {
    const content = getContent();
    const [start, end] = [content.indexOf(" "), content.lastIndexOf(" ")];
    const examplesString = content.slice(start, end).trim();
    let examples = examplesString.split("Example ");
    let examplesArray = []

    for (let i = 1; i < examples.length; i++) {
        const inputRegex = / .*/
        const outputRegex = /Output: .*/
        const input = examples[i].match(inputRegex).toString().trim();
        const output = examples[i].match(outputRegex).toString().trim();

        let inputString = input.split(", ");
        let outputString = output.split(": ");

        let inputs = [];
        let outputs = [];

        const outputObject = {};
        outputObject[outputString[0]] = outputString[1];
        outputs.push(outputObject);

        inputString.forEach((element) => {
            const elements = element.split(" = ");
            const inputObject = {};
            inputObject[elements[0]] = elements[1];
            inputs.push(inputObject);
        })

        const example = {};
        example[`input`] = inputs;
        example[`output`] = outputObject;
        examplesArray.push(example);
    }
    return examplesArray;
}

function extractDescription() {
    const content = getContent();
    const descriptionEndIndex = content.indexOf("Example");
    const description = content.slice(0,descriptionEndIndex).trim().replaceAll("\n\n", "\n");
    return description;
}

function extractFunctionPrototype() {
    const editorClassName = "view-lines";
    const editor = document.querySelector(`div.${editorClassName}`);
    return editor.innerText.replaceAll(" ", " ");
}

function sendData(request, sender, sendResponse) {
    console.log("sending data....")
    const examples = extractExamples();
    const description = extractDescription();
    const functionPrototype = extractFunctionPrototype();
    const data = {};
    data["description"] = description;
    data["examples"] = examples;
    data["function"] = functionPrototype;
    console.log(data);
    sendResponse({
        type: "data",
        data: data
    })
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "send_data") {
        sendData(message, sender, sendResponse);
    }
})