/**
 * gets the content of the problem (everything on the left side of the page, problem description, examples)
 * @returns string
 */
function getContent() {
    const contentClassName = "elfjS";                                       // can change anytime
    const content = document.body.querySelector(`div.${contentClassName}`);
    return content.textContent;
}
/**
 * extracts examples from the main content
 * @returns (Object[])
 */
function extractExamples() {
    const content = getContent();
    const [start, end] = [content.indexOf(" "), content.lastIndexOf(" ")];  // indices of start and end of example block
    const examplesString = content.slice(start, end).trim();
    let examples = examplesString.split("Example ").splice(1);              // split the example block into separate examples, remove 1st element since it's just empty string
    let examplesArray = []                                                  // create empty exampleArray to store example objects

    for (const example of examples) {
        console.log(example);                                               // Log the current example for debugging
        const inputRegex = / .*/                                            // Regular expression for extracting input
        const outputRegex = /Output: .*/                                    // Regular expression for extracting output
        const input = example.match(inputRegex).toString().trim();          // Extract and clean input
        const output = example.match(outputRegex).toString().trim();        // Extract and clean output

        let inputString = input.split(", ");                                // Split input string by commas
        let outputString = output.split(": ");                              // Split output string by commas

        let inputs = [];                                                    // Array to store input objects
        let outputs = [];                                                   // Array to store output objects

        const outputObject = {};
        outputObject[outputString[0]] = outputString[1];                    // Add output type and name in the form of key value pair
        outputs.push(outputObject);

        inputString.forEach((element) => {                                  // Process inputs
            const elements = element.split(" = ");
            const inputObject = {};
            inputObject[elements[0]] = elements[1];
            inputs.push(inputObject);
        })

        const currentExample = {};
        currentExample[`input`] = inputs;
        currentExample[`output`] = outputObject;
        examplesArray.push(currentExample);
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
    return {type: "data", data: data};
}

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "send_data") {
        return generateData();
    }
})