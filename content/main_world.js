/**
 *  gets the code editor's content
 *  it's a separate file because the main content script is "isolated" and cannot access the JS objects on the web page
 */
window.addEventListener("message", (e) => {
    if (e.data.type === "request" && e.data.message === "send_editor") {
        const editorText = window.monaco.editor.getModels()[0].getValue();
        document.dispatchEvent(new CustomEvent('editor_content', {
            detail: editorText
        }))
    }
})