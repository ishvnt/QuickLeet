    window.addEventListener("message", (e) => {
        if (e.data.type === "request" && e.data.message === "send_editor") {
            const editorText = window.monaco.editor.getModels()[0].getValue();
            document.dispatchEvent(new CustomEvent('editor_content', {
                detail: editorText
            }))
        }
    })