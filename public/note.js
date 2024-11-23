document.getElementById("copyNote").addEventListener("click", function() {
    const noteUrlContent = document.getElementById("noteUrl").textContent;
    navigator.clipboard.writeText(noteUrlContent).then(() => {
      const copiedMessage = document.getElementById("copiedMessage");
      copiedMessage.style.display = "block";
      copiedMessage.style.opacity = 1; 
      setTimeout(() => {
        copiedMessage.style.opacity = 0;
        setTimeout(() => {
          copiedMessage.style.display = "none";
        }, 1000); 
      }, 3000);
    }).catch(err => console.error("Failed to copy: ", err));
});