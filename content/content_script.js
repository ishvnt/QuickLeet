function getDescription() {
    const descriptionClassName = "elfjS";
    const description = document.body.querySelector(`div.${descriptionClassName}`)
    return description.textContent;
}

function extractExamples() {
    const description = getDescription();
    const [start, end] = [description.indexOf(" "), description.lastIndexOf(" ")];
    const examplesString = description.slice(start, end).trim();
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
    console.log(examplesArray);
    return examplesArray;
}

function sendExamples(request, sender, sendResponse) {
    console.log("sending examples....");
    const examples = extractExamples();
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