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
    const description = content.slice(0, descriptionEndIndex).trim().replaceAll("\n\n", "\n");
    return description;
}
let editor = null;
let contentPromiseResolver = null;

const editorContentPromise = new Promise((resolve) => {
    contentPromiseResolver = resolve;
});

let s = document.createElement('script');
s.src = browser.runtime.getURL("./content/main_world.js");
(document.head || document.documentElement).appendChild(s);
s.onload = () => {
    s.remove();
};
document.addEventListener('editor_content', (e) => {
    editor = e.detail;
    contentPromiseResolver();
})
function sendMessageToMainWorld() {
    window.postMessage({ type: "request", message: "send_editor" }, "*");
}

async function extractFunctionPrototype() {
    sendMessageToMainWorld();
    await editorContentPromise;
    const [start, end] = [editor.indexOf("class"), editor.lastIndexOf(";") + 1];
    const functionPrototype = editor.slice(start, end);
    return functionPrototype;
}

function extractTypes(functionPrototype) {
    const startOfSolution = functionPrototype.indexOf("class Solution");
    functionPrototype = functionPrototype.slice(startOfSolution);

    const [start, end] = [functionPrototype.indexOf(":\n") + 1, functionPrototype.indexOf(") ") + 1];

    functionPrototype = functionPrototype.slice(start, end).trim();

    const types = {};
    const ouputRegex = /^[^\s]+/;
    const outputType = functionPrototype.match(ouputRegex).toString();

    types["output"] = outputType;
    types["input"] = {};
    const args = functionPrototype.slice(functionPrototype.indexOf("(") + 1, functionPrototype.indexOf(")")).split(",");
    args.forEach((arg) => {
        const [val, key] = arg.trim().split(" ");
        types["input"][key] = val.replace("&", "");
    })
    return types;
}

async function generateData() {
    const examples = extractExamples();
    const description = extractDescription();
    const functionPrototype = await extractFunctionPrototype();
    const types = extractTypes(functionPrototype);
    const data = {};
    data["description"] = description;
    data["examples"] = examples;
    data["function"] = functionPrototype;
    data["types"] = types;
    console.log(data);
    return {type: "data", data: data};
}

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "send_data") {
        return generateData();
    }
})