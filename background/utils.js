export function handleLinkedList() {
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
}`;
    const printLinkedList = `void printLinkedList(ListNode* head) {
    while (head) {
        cout<<head->val;
        if (head->next) {
            cout<<"->";
        }
        head = head->next;
    }
    cout<<"->null"<<"\\n";
}`
  return [classDefinition, arrayToListNode, printLinkedList];
}

export function handleTree() {
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
}\n`;
    const printTree = `void printTree(TreeNode* root) {
    if (!root) {
        cout<<"Tree is empty."<<endl;
        return;
    }

    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* currentNode = q.front();
        q.pop();
        
        if (currentNode) {
            cout<<currentNode->val<<" ";
            q.push(currentNode->left);
            q.push(currentNode->right);
        } else {
            cout<<"null ";
        }
    }
    cout<<"\\n";
}\n`
    return [classDefinition, arrayToTree, printTree];
}