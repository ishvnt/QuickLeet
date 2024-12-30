import { handleLinkedList, handleTree } from "./utils.js"

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
    const functionName = functionPrototype.match(/(?<=\s)([^(\s]+)(?=\()/)[0];
    console.log(functionName);
    console.log(functionPrototype);
    let text = `#include <bits/stdc++.h>\nusing namespace std;\n`;
    text += "\n" + "/*" + description + "*/\n\n";
    const [LLClassDefinition, arrayToListNode, printLL] = handleLinkedList();
    const [TreeClassDefinition, arrayToTree, printTree] = handleTree();
    if (functionPrototype.search("ListNode*") !== -1) {
        text += LLClassDefinition + "\n";
        text += arrayToListNode + "\n";
        text += printLL + "\n";
    }
    else if (functionPrototype.search("TreeNode*") !== -1) {
        text += TreeClassDefinition + "\n";
        text += arrayToTree + "\n";
        text += printTree + "\n";
    }
    text += "\n" + functionPrototype + "\n";
    text += "\nint main() {\n\tSolution sol;\n"
    let j = 1;
    data.examples.forEach((example) => {
        let inputsArr = []
        for (let i = 0; i < example.input.length; i++) {
            const key = Object.keys(example.input[i]).toString();
            const inputType = data.types["input"][key];
            if (inputType === "ListNode*") {
                const vector = example.input[i][key].replaceAll("[", "{").replaceAll("]", "}");
                example.input[i][key] = `arrayToListNode(${vector})`;
            }
            if (inputType === "TreeNode*") {
                const vector = example.input[i][key].replaceAll("[", "{").replaceAll("]", "}").replaceAll("null", "NULL");
                example.input[i][key] = `arrayToTree(${vector})`;
            }
            text += `\t${inputType} ${key}${j} = ${example.input[i][key].replaceAll("[", "{").replaceAll("]", "}")};\n`;
            inputsArr.push(`${key}${j}`);
        }
        const outputType = data.types["output"];
        if (outputType === "ListNode*") {
            const vector = example.output["Output"].replaceAll("[", "{").replaceAll("]", "}");
            example.output["Output"] = `arrayToListNode(${vector})`;
        }
        if (outputType === "TreeNode*") {
            const vector = example.output["Output"].replaceAll("[", "{").replaceAll("]", "}").replaceAll("null", "NULL");
            example.output["Output"] = `arrayToTree(${vector})`;
        }
        text += `\t${outputType} output${j} = ${example.output["Output"].replaceAll("[", "{").replaceAll("]", "}")};\n`;
        text += `\tauto ans${j} = sol.${functionName}(${inputsArr});\n`;
        if (outputType === "TreeNode*") {
            text += `\tcout<<"correct answer test case ${j}:\\n";printTree(output${j});\n\tcout<<"your answer test case ${j}:\\n";printTree(ans${j});\n\n`;
        }
        else if(outputType === "ListNode*") {
            text += `\tcout<<"correct answer test case ${j}:\\n";printLinkedList(output${j});\n\tcout<<"your answer test case ${j}:\\n";printLinkedList(ans${j});\n\n`;
        }
        else {
            text += `\tif(ans${j}==output${j}) cout<<"test${j} passed\\n";\n\telse cout<<"test${j} failed\\n";\n\n`;
        }
        j++;
    })
    text += "\treturn 0;\n}\n\n";
    return text;
}

async function createFile() {
    let title = await getTitle();
    title = title.split("/")[4].replaceAll("-", "_");
    const tab = await getCurrentTab();
    const tabId = tab[0].id;
    let text = "int main(){}";
    const response = await browser.tabs.sendMessage(tabId, { command: "send_data" });
    console.log(response);
    if (response && response.type === "data") {
        console.log(response.data);
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
    console.log("hellow");
    const file = await createFile();
    console.log("done");
    const downloading = browser.downloads.download(file);
    downloading.then((id) => { console.log(id); }, (error) => { console.log(error); });
}

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "generate") {
        downloadFile();
    }
}
)