document.addEventListener('DOMContentLoaded', () => {
    const viewTestsButton = document.getElementById("view-tests");
    
    if (viewTestsButton) {
        viewTestsButton.addEventListener("click", () => {
            chrome.runtime.sendMessage({
                action: "listTests"
            }, response => {
                if (response && response.success) {
                    displayTests(response.tests);
                }
            });
        });
    } else {
        console.warn("Element with ID 'view-tests' not found");
    }
});
