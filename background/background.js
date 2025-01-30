import { handleLinkedList, handleTree } from "./utils.js" // LinkedList and Tree class definitions and helper functions
/**
 * get current tab title
 * @returns (string)
 */
async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}
/**
 *  get active tabs
 * @returns (Promise<browser.tabs.Tab[]>)
 */
function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
}
/**
 * converts data received from the content script (description, examples, function prototype, and input and output types) into a C++ file.
 * @param {Object} data   
 * @returns (string)
 */
function generateCppFile(data) {
    const description = data.description;
    const functionPrototype = data.function;
    const functionName = functionPrototype.match(/(?<=\s)([^(\s]+)(?=\()/)[0]; // from the functionPrototype, get the functionName e.g. from int sum_func(int a, int b) extract 'sum_func'
    let text = `#include <bits/stdc++.h>\nusing namespace std;\n`;             // include STL
    text += "\n" + "/*" + description + "*/\n\n";                              // add question description to the file
    const [LLClassDefinition, arrayToListNode, printLinkedList] = handleLinkedList();  
    const [TreeClassDefinition, arrayToTree, printTree] = handleTree();
    if (functionPrototype.search("ListNode*") !== -1) {                        // if it's a Linked List question add the Linked List class definition and other helper functions to the file
        text += LLClassDefinition + "\n";
        text += arrayToListNode + "\n";
        text += printLinkedList + "\n";
    }
    else if (functionPrototype.search("TreeNode*") !== -1) {                   // if it's a Tree question add the Tree class definition and other helper functions to the file
        text += TreeClassDefinition + "\n";
        text += arrayToTree + "\n";
        text += printTree + "\n";
    }
    text += "\n" + functionPrototype + "\n";                                   // add the function prototype to the file
    text += "\nint main() {\n\tSolution sol;\n"                                // start of main function
    let j = 1;
    data.examples.forEach((example) => {                                       // process each example and add to file
        let inputsArr = []
        for (let i = 0; i < example.input.length; i++) {
            const key = Object.keys(example.input[i]).toString();              // get name of input of given example
            const inputType = data.types["input"][key];                        // get type of that input
            const inputVector = example.input[i][key].replaceAll("[", "{").replaceAll("]", "}").replaceAll("null", "NULL"); // replace all square brackets with curly brackets and null with NULL
            if (inputType === "ListNode*") {                                   // if it's a Linked List, convert the vector to a Linked List using the arrayToListNode function
                example.input[i][key] = `arrayToListNode(${inputVector})`;
            }
            if (inputType === "TreeNode*") {                                   // if it's a Tree, convert the vector to a Tree using the arrayToTree function
                example.input[i][key] = `arrayToTree(${inputVector})`;
            }
            else {
                example.input[i][key] = inputVector;
            }
            text += `\t${inputType} ${key}${j} = ${example.input[i][key]};\n`; // add the example input to file e.g. vector<int> ans1 = {1,2,3,4,5};
            inputsArr.push(`${key}${j}`);                                      // push the inputs to inputsArr e.g. nums1, queries1
        }
        // we have dealt with the inputs for the given example, now we will process the outputs
        const outputType = data.types["output"];
        const outputVector = example.output["Output"].replaceAll("[", "{").replaceAll("]", "}").replaceAll("null", "NULL");
        if (outputType === "ListNode*") {                                      // if the output is a LinkedList, convert the outputVector to a LinkedList
            example.output["Output"] = `arrayToListNode(${outputVector})`;
        }
        if (outputType === "TreeNode*") {                                      // if the output is a Tree, convert the outputVector to a Tree
            example.output["Output"] = `arrayToTree(${outputVector})`;
        }
        text += `\t${outputType} output${j} = ${example.output["Output"].replaceAll("[", "{").replaceAll("]", "}")};\n`; // correct output line e.g. ListNode* output1 = arrayToListNode({1,2,3,4,});
        text += `\tauto ans${j} = sol.${functionName}(${inputsArr});\n`;                                                 // your output line e.g. auto ans1 = sol.sum_fun(int a, int b);
        if (outputType === "TreeNode*") {                                      // if the output is a Tree, print both correct tree and your output
            text += `\tcout<<"correct answer test case ${j}:\\n";printTree(output${j});\n\tcout<<"your answer test case ${j}:\\n";printTree(ans${j});\n\n`;
        }
        else if(outputType === "ListNode*") {                                  // if the output is a LinkedList, print both correct LinkedList and your output
            text += `\tcout<<"correct answer test case ${j}:\\n";printLinkedList(output${j});\n\tcout<<"your answer test case ${j}:\\n";printLinkedList(ans${j});\n\n`;
        }
        else {                                                                 // else just print test case passed or failes
            text += `\tif(ans${j}==output${j}) cout<<"test${j} passed\\n";\n\telse cout<<"test${j} failed\\n";\n\n`;
        }
        j++;
    })
    // processed all examples
    text += "\treturn 0;\n}\n\n";
    return text;
}
/**
 * requests the data from content script and calls generateCppFile to turn that data into a string and add the boilerplate code
 * finally converts all that into an object that can be downloaded
 * @returns (Promise<file>)
 */
async function createFile() {
    let title = await getTitle();
    title = title.split("/")[4].replaceAll("-", "_");           // get the problem title from the url
    const tab = await getCurrentTab();
    const tabId = tab[0].id;
    let text = "";
    const response = await browser.tabs.sendMessage(tabId, { command: "send_data" }); // send message to content script to request data
    if (response && response.type === "data") {
        text = generateCppFile(response.data);                  // add the data and boilerplate code to file content
    }
    const blob = new Blob([text], { type: 'text/plain' });      // make a new blob from the text content
    const fileurl = URL.createObjectURL(blob);                  // generate url for that blob
    const filename = `${title}.cpp`;                            // filename is the name of the problem

    const file = {                                              // pack everything into an object
        url: fileurl,
        filename: filename,
        saveAs: true,
        conflictAction: "uniquify"
    };
    return file;
}
/**
 * gets the file from createFile() and downloads it
 */
async function downloadFile() {
    const file = await createFile();
    const downloading = browser.downloads.download(file);
    downloading.then((id) => { console.log(id); }, (error) => { console.log(error); });
}
/**
 * listens for message from popup
 * starts the file creation and download process once it receives message from popup
 */
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "generate") {
        downloadFile();
    }
}
)