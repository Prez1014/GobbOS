"use strict";

let highestZIndex = 10;
const minimizedWindows = new Set();
const click = new Audio('sfx/click.mp3');

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initWindows();
    initDesktopIcons();
    initStartMenu();
    initGuestbook();
});

/* Clock */
function initClock() {
    const clock = document.getElementById("clock");

    function updateClock() {
        clock.textContent = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* Desktop Icons */
function initDesktopIcons() {
    const icons = document.querySelectorAll(".desktop-icon");
    
    icons.forEach((icon, index) => {
        const launch = () => openWindow(icon.dataset.window);

        icon.addEventListener("dblclick", launch);

        // Keyboard accessibility
        icon.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                launch();
            }
        });

        // Set default staggered grid positions so they aren't stacked
        if (!icon.style.left && !icon.style.top) {
            const startX = 20;
            const startY = 20;
            const spacingY = 100; // Vertical distance between icons in a column
            
            // Arrange them in a vertical column on the left side of the screen
            icon.style.left = `${startX}px`;
            icon.style.top = `${startY + (index * spacingY)}px`;
        }

        // Enable dragging for this icon
        makeIconDraggable(icon);
    });
}

/* Window Management */
function initWindows() {
    document.querySelectorAll(".window").forEach(win => {
        const header = win.querySelector(".window-header");

        win.addEventListener("pointerdown", () => {
            bringToFront(win);
        });

        win.querySelector(".close-btn").addEventListener("click", event => {
            event.stopPropagation();
            closeWindow(win);
            click.play();
        });

        win.querySelector(".min-btn").addEventListener("click", event => {
            event.stopPropagation();
            minimizeWindow(win);
            click.play();
        });

        win.querySelector(".max-btn").addEventListener("click", event => {
            event.stopPropagation();
            toggleMaximize(win);
            click.play();
        });

        makeDraggable(win, header);
        makeResizable(win);
    });
}

function openWindow(id) {
    const win = document.getElementById(`window-${id}`);
    if (!win) return;

    win.classList.add("active");
    minimizedWindows.delete(id);

    if (!win.dataset.positioned) {
        const offset = document.querySelectorAll(".window.active").length;

        const maxLeft = Math.max(
            0,
            window.innerWidth - Math.min(win.offsetWidth || 360, 360) - 12
        );

        const maxTop = Math.max(0, window.innerHeight - 36 - 250);

        win.style.left = `${Math.min(80 + (offset * 24), maxLeft)}px`;
        win.style.top = `${Math.min(45 + (offset * 20), maxTop)}px`;

        win.dataset.positioned = "true";
    }

    document.getElementById("start-menu").classList.add("hidden");
    document.getElementById("start-btn").classList.remove("active");

    bringToFront(win);
}

function closeWindow(win) {
    const id = win.id.replace("window-", "");

    // If closing the music player, stop the audio playback
    if (id === "music") {
        const iframe = win.querySelector("iframe");
        if (iframe) {
            // Temporarily clearing or resetting the src instantly stops the audio element inside
            const currentSrc = iframe.src;
            iframe.src = "";
            iframe.src = currentSrc;
        }
    }

    if (id === "minesweeper") {
            //to do reset 
    }

    win.classList.remove("active", "maximized");
    minimizedWindows.delete(id);

    updateTaskbar();
}

function minimizeWindow(win) {
    const id = win.id.replace("window-", "");

    win.classList.remove("active");
    minimizedWindows.add(id);

    updateTaskbar();
}

function toggleMaximize(win) {
    if (win.classList.contains("maximized")) {
        win.classList.remove("maximized");

        win.style.left = win.dataset.oldLeft || "80px";
        win.style.top = win.dataset.oldTop || "45px";
        win.style.width = win.dataset.oldWidth || "";
        win.style.height = win.dataset.oldHeight || "";
    } else {
        win.dataset.oldLeft = win.style.left;
        win.dataset.oldTop = win.style.top;
        win.dataset.oldWidth = win.style.width;
        win.dataset.oldHeight = win.style.height;

        win.classList.add("maximized");
    }

    bringToFront(win);
}

function bringToFront(win) {
    highestZIndex++;
    win.style.zIndex = highestZIndex;

    updateTaskbar();
}

/* Window Dragging */
function makeDraggable(win, handle) {
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let dragging = false;

    handle.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        if (win.classList.contains("maximized")) return;

        dragging = true;

        startX = event.clientX;
        startY = event.clientY;

        initialX = win.offsetLeft;
        initialY = win.offsetTop;

        bringToFront(win);

        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    handle.addEventListener("pointermove", event => {
        if (!dragging) return;

        const maxX = Math.max(0, window.innerWidth - 70);
        const maxY = Math.max(0, window.innerHeight - 65);

        const newX = initialX + event.clientX - startX;
        const newY = initialY + event.clientY - startY;

        win.style.left = `${Math.max(
            -win.offsetWidth + 70,
            Math.min(newX, maxX)
        )}px`;

        win.style.top = `${Math.max(
            0,
            Math.min(newY, maxY)
        )}px`;
    });

    function stopDragging() {
        dragging = false;
    }

    handle.addEventListener("pointerup", stopDragging);
    handle.addEventListener("pointercancel", stopDragging);
}
/* Window Resizing */
function makeResizable(win) {
    const handle = win.querySelector(".resize-handle");
    if (!handle) return;

    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let resizing = false;

    handle.addEventListener("pointerdown", event => {
        if (win.classList.contains("maximized")) return;

        resizing = true;
        startX = event.clientX;
        startY = event.clientY;

        startWidth = win.offsetWidth;
        startHeight = win.offsetHeight;

        bringToFront(win);

        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    handle.addEventListener("pointermove", event => {
        if (!resizing) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        const newWidth = Math.max(220, startWidth + dx);
        const newHeight = Math.max(150, startHeight + dy);

        win.style.width = `${newWidth}px`;
        win.style.height = `${newHeight}px`;
    });

    const stopResizing = event => {
        if (!resizing) return;
        resizing = false;
        try {
            handle.releasePointerCapture(event.pointerId);
        } catch (e) {}
    };

    handle.addEventListener("pointerup", stopResizing);
    handle.addEventListener("pointercancel", stopResizing);
}

/* Icon Dragging */
function makeIconDraggable(icon) {
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let dragging = false;

    icon.addEventListener("pointerdown", event => {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;

        if (!icon.style.left) {
            icon.style.left = `${icon.offsetLeft}px`;
            icon.style.top = `${icon.offsetTop}px`;
        }

        initialX = parseInt(icon.style.left, 10) || 0;
        initialY = parseInt(icon.style.top, 10) || 0;

        icon.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    icon.addEventListener("pointermove", event => {
        if (!dragging) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        const newX = initialX + dx;
        const newY = initialY + dy;

        const maxX = window.innerWidth - icon.offsetWidth - 10;
        const maxY = window.innerHeight - 36 - icon.offsetHeight - 10;

        icon.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        icon.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    });

    const stopDragging = (event) => {
        if (!dragging) return;
        dragging = false;
        try {
            icon.releasePointerCapture(event.pointerId);
        } catch (e) {}
    };

    icon.addEventListener("pointerup", stopDragging);
    icon.addEventListener("pointercancel", stopDragging);
}

/* Start Menu */
function initStartMenu() {
    const startButton = document.getElementById("start-btn");
    const startMenu = document.getElementById("start-menu");

    startButton.addEventListener("click", event => {
        event.stopPropagation();

        const isOpening = startMenu.classList.contains("hidden");

        startMenu.classList.toggle("hidden");
        startButton.classList.toggle("active", isOpening);
    });

    document.addEventListener("click", event => {
        if (
            !startMenu.contains(event.target) &&
            !startButton.contains(event.target)
        ) {
            startMenu.classList.add("hidden");
            startButton.classList.remove("active");
        }
    });

    startMenu.querySelectorAll("li[data-window]").forEach(item => {
        item.addEventListener("click", () => {
            openWindow(item.dataset.window);
        });
    });

    document.getElementById("shutdown-btn").addEventListener("click", () => {
        startMenu.classList.add("hidden");
        startButton.classList.remove("active");

        document.getElementById("shutdown-screen").classList.remove("hidden");
    });

    document.getElementById("restart-btn").addEventListener("click", () => {
        document.getElementById("shutdown-screen").classList.add("hidden");
    });
}

/* Taskbar */
function updateTaskbar() {
    const taskbar = document.getElementById("taskbar-tasks");
    if (!taskbar) return;

    taskbar.replaceChildren();

    document.querySelectorAll(".window").forEach(win => {
        const id = win.id.replace("window-", "");

        if (
            !win.classList.contains("active") &&
            !minimizedWindows.has(id)
        ) {
            return;
        }

        const button = document.createElement("button");
        button.className = "taskbar-item";
        button.textContent = win.querySelector(".window-title").textContent;

        const isActive =
            win.classList.contains("active") &&
            Number(win.style.zIndex || 0) === highestZIndex;

        button.classList.toggle("active", isActive);

        button.addEventListener("click", () => {
            if (
                win.classList.contains("active") &&
                Number(win.style.zIndex || 0) === highestZIndex
            ) {
                minimizeWindow(win);
            } else {
                openWindow(id);
            }
        });

        taskbar.appendChild(button);
    });
}

/* Guestbook */
function initGuestbook() {
    const form = document.getElementById("guestbook-form");
    const entries = document.getElementById("guestbook-entries");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("guest-name").value.trim();
        const message = document.getElementById("guest-message").value.trim();

        if (!name || !message) return;

        const entry = document.createElement("div");
        entry.className = "entry";

        const author = document.createElement("strong");
        author.textContent = `${name}: `;

        entry.append(
            author,
            document.createTextNode(message)
        );

        entries.prepend(entry);
        form.reset();
    });
}

/* Keep Windows On Screen */
window.addEventListener("resize", () => {
    document.querySelectorAll(".window.active:not(.maximized)").forEach(win => {
        const maxLeft = Math.max(
            0,
            window.innerWidth - Math.min(win.offsetWidth, window.innerWidth)
        );

        const maxTop = Math.max(0, window.innerHeight - 36 - 60);

        win.style.left = `${Math.min(
            Math.max(0, win.offsetLeft),
            maxLeft
        )}px`;

        win.style.top = `${Math.min(
            Math.max(0, win.offsetTop),
            maxTop
        )}px`;
    });
});

/* Rat Easter Egg */
let keyBuffer = "";
const targetWord = "rat";

window.addEventListener("keydown", event => {
    // Don't trigger if the user is typing in an input, textarea, or notepad
    if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
        return;
    }

    // Append the typed character to our rolling buffer
    keyBuffer += event.key.toLowerCase();

    // Keep the buffer length equal to the target word length
    if (keyBuffer.length > targetWord.length) {
        keyBuffer = keyBuffer.slice(-targetWord.length);
    }

    // Check if the secret word is typed
    if (keyBuffer === targetWord) {
        spawnRat();
        keyBuffer = ""; // Reset buffer
    }
});

function spawnRat() {
    const rat = document.createElement("img");
    
    // Replace with your actual rat PNG path (or use an emoji '🐀' as textContent if you don't have the PNG ready yet)
    rat.src = "img/rat.gif"; 
    rat.className = "running-rat";
    rat.style.width = "200px";
    
    // Fallback just in case the PNG isn't added yet
    rat.onerror = () => {
        rat.remove();
        THEREITIS();
    };

    document.body.appendChild(rat);

    // Trigger the slide across the screen after a tiny delay
    setTimeout(() => {
        rat.style.left = "calc(100vw + 100px)";
    }, 50);

    // Clean up the DOM element after the 3-second animation finishes
    setTimeout(() => {
        rat.remove();
    }, 3100);
}

// Fallback helper if you want a text/emoji rat instantly
function THEREITIS() {
    const rat = document.createElement("div");
    rat.className = "running-rat";
    rat.style.fontSize = "100px";
    rat.textContent = "🐀";
    document.body.appendChild(rat);

    setTimeout(() => {
        rat.style.left = "calc(100vw + 100px)";
    }, 50);

    setTimeout(() => {
        rat.remove();
    }, 3100);
}