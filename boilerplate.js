// (() => {
//     function downloadFile() {
//         const text = "Hello World";

//         // Create a Blob with the text content
//         const blob = new Blob([text], { type: 'text/plain' });

//         const fileurl = URL.createObjectURL(blob);
//         const filename = "Hello_World.cpp"
//         const downloading = browser.downloads.download({
//             url: fileurl,
//             filename: filename,
//             saveAs: true
//         })
//         downloading.then((id)=>{console.log(id)}, (error)=>{console.log(error)})
//         // Create an anchor element for the download
//         // const link = document.createElement('a');
//         // link.href = URL.createObjectURL(blob);
//         // link.download = "hello_world.cpp";

//         // Programmatically click the link to start the download
//         // link.click();
//     }
//     browser.runtime.onMessage.addListener((message)=>{
//         if(message.command === "generate")
//         {
//             downloadFile();
//         }
//     })
// })()
