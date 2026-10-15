document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('notepad-textarea');
    const status = document.getElementById('status');
    const downloadBtn = document.getElementById('download-btn');

    const STORAGE_KEY = 'gobbos_standalone_notes';

    // Default text on first load
    const defaultText = `Things to do:\n1. Finish website\n2. Listen to more ambient music\n3. Drink water\n4. Upgrade the minesweeper`;

    // 1. Load saved notes from LocalStorage
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes !== null) {
        textarea.value = savedNotes;
    } else {
        textarea.value = defaultText;
        localStorage.setItem(STORAGE_KEY, defaultText);
    }

    // 2. Auto-save on input
    let saveTimeout;
    textarea.addEventListener('input', () => {
        status.textContent = 'Saving...';
        localStorage.setItem(STORAGE_KEY, textarea.value);

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            status.textContent = 'Saved';
        }, 600);
    });

    // 3. Download text as a file
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([textarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.txt';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        status.textContent = 'Exported!';
        setTimeout(() => { status.textContent = 'Saved'; }, 2000);
    });
});