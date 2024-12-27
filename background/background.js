async function getTitle() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].url;
}

function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true });
}

function handleLinkedList() {
    const classDefinition = `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};\n`;
    const arrayToListNode = `ListNode* arrayToListNode(const vector<int>& arr) {
    if (arr.empty()) {
        return nullptr;
    }

    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
  
    for (size_t i = 1; i < arr.size(); ++i) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }

    return head;
}`
  return [classDefinition, arrayToListNode];
}

function handleTree() {
    const classDefinition = `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};\n`;
    const arrayToTree = `TreeNode* arrayToTree(const vector<int>& nums) {
    if (nums.empty()) return nullptr;

    TreeNode* root = new TreeNode(nums[0]);
    queue<TreeNode*> q;
    q.push(root);
    
    int i = 1;
    while (i < nums.size()) {
        TreeNode* current = q.front();
        q.pop();
        if (i < nums.size() && nums[i] != NULL) {
            current->left = new TreeNode(nums[i]);
            q.push(current->left);
        }
        i++;
        if (i < nums.size() && nums[i] != NULL) {
            current->right = new TreeNode(nums[i]);
            q.push(current->right);
        }
        i++;
    }
    return root;
}\n`
    return [classDefinition, arrayToTree];
}

function generateCppFile(data) {
    const description = data.description;
    const functionPrototype = data.function;
    const functionName = functionPrototype.match(/(?<=\s)([^(\s]+)(?=\()/)[0];
    console.log(functionName);
    console.log(functionPrototype);
    console.log("i'm here :D");
    let text = `#include <bits/stdc++.h>\nusing namespace std;\n`;
    text += "\n" + "/*" + description + "*/\n";
    const [ll, tree] = [false, false];
    if (functionPrototype.search("ListNode*") !== -1) {
        ll = true;
        const [classDefinition, arrayToListNode] = handleLinkedList();
        text += classDefinition;
    }
    else if (functionPrototype.search("TreeNode*") !== -1) {
        tree = true;
        const [classDefinition, arrayToTree] = handleTree();
        text += classDefinition;
    }
    text += "\n" + functionPrototype + "\n";
    text += "\nint main() {\n\tSolution sol;\n"
    let j = 1;
    data.examples.forEach((example) => {
        let inputsArr = []
        for (let i = 0; i < example.input.length; i++) {
            const key = Object.keys(example.input[i]).toString();
            const inputType = data.types["input"][key];
            if(inputType === "ListNode*") {
                const vector = example.input[i][key].replaceAll("[", "{").replaceAll("]", "}");
                example.input[i][key] = `arrayToListNode(${vector})`;
            }
            text += `\t${inputType} ${key}${j} = ${example.input[i][key].replaceAll("[", "{").replaceAll("]", "}")};\n`;
            inputsArr.push(`${key}${j}`);
        }
        const outputType = data.types["output"];
        if(outputType === "ListNode*") {
            const vector = example.output["Output"].replaceAll("[", "{").replaceAll("]", "}");
            example.output["Output"] = `arrayToListNode(${vector})`;
        }
        text += `\t${outputType} output${j} = ${example.output["Output"].replaceAll("[", "{").replaceAll("]", "}")};\n`;
        text += `\tauto ans${j} = sol.${functionName}(${inputsArr});\n`;
        text += `\tif(ans${j}==output${j}) cout<<"test${j} passed";\n\telse cout<<"test${j} failed";\n\n`;
        j++;
    })
    text += "\treturn 0;\n}\n\n";
    if(ll) {text += arrayToListNode;}
    else if(tree) {text += arrayToTree;}
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