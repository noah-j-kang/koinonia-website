// Imports removed for file:// compatibility

class Terminal {
    constructor() {
        this.currentPath = []; // Array of directory names, empty = root
        this.history = [];
        this.historyIndex = -1;
        this.output = document.getElementById('output');
        this.input = document.getElementById('cmd-input');
        this.promptLabel = document.getElementById('prompt-label');

        this.init();
    }

    init() {
        this.printWelcome();
        this.updatePrompt();

        // Focus input anywhere on click
        document.body.addEventListener('click', () => {
            this.input.focus();
        });

        // Handle Enter key
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value;
                this.handleCommand(cmd);
                this.input.value = '';
            }
        });

        // Mobile auto-focus
        this.input.focus();
    }

    printWelcome() {
        this.printLine("Initializing Koinonia OS v1.0...", "comment");
        this.printLine("Loading kernel... OK", "comment");
        this.printLine("Mounting file system... OK", "comment");
        this.printLine("--------------------------------------------------");
        this.printLine("Welcome to Koinonia Cooperative House.", "terminal-text");
        this.printLine("Type 'help' for a list of commands.", "terminal-text");
        this.printLine("--------------------------------------------------\n");
    }

    updatePrompt() {
        const pathStr = this.currentPath.length === 0 ? '~' : '~/' + this.currentPath.join('/');
        this.promptLabel.textContent = `guest@koinonia:${pathStr}$`;
    }

    printLine(text, className = "terminal-text") {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        this.output.appendChild(div);
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById('terminal-container').scrollTo(0, document.getElementById('terminal-container').scrollHeight);
    }

    handleCommand(cmdStr) {
        const cleanCmd = cmdStr.trim();
        if (!cleanCmd) return;

        // Echos the command
        this.printLine(`guest@koinonia:${this.currentPath.length === 0 ? '~' : '~/' + this.currentPath.join('/')}$ ${cleanCmd}`, "command");

        const args = cleanCmd.split(/\s+/);
        const cmd = args[0].toLowerCase();
        const arg = args[1];

        this.history.push(cleanCmd);

        switch (cmd) {
            case 'help':
                this.printLine("AVAILABLE COMMANDS:");
                this.printLine("  ls           List files and directories");
                this.printLine("  cd [dir]     Change directory (e.g. 'cd ministries')");
                this.printLine("  cd ..        Go up one level");
                this.printLine("  cat [file]   Read a file (e.g. 'cat about.txt')");
                this.printLine("  clear        Clear the screen");
                break;

            case 'clear':
                this.output.innerHTML = '';
                break;

            case 'ls':
                this.listDir();
                break;

            case 'cd':
                this.changeDir(arg);
                break;

            case 'cat':
                this.readFile(arg);
                break;

            case './mystery':
            case 'mystery':
                this.playEasterEgg();
                break;

            default:
                this.printLine(`Command not found: ${cmd}. Type 'help' for instructions.`, "error");
        }
    }

    async playEasterEgg() {
        const frames = window.mysteryFrames;
        if (!frames || frames.length === 0) {
            this.printLine("Error: Mystery data corrupt.", "error");
            return;
        }

        this.input.disabled = true;
        this.output.innerHTML = ''; // Clear screen properly

        // Audio Logic
        const audioUrl = "https://theusaf.github.io/Rick%20Astley%20-%20Never%20Gonna%20Give%20You%20Up%20(Video).m4a";
        const audio = new Audio(audioUrl);
        audio.loop = true; // Loop music while animation plays

        try {
            await audio.play();
        } catch (e) {
            console.error("Audio playback failed (likely browser policy):", e);
            // We proceed with animation even if audio fails
        }

        let stopAnimation = false;
        const abortController = new AbortController();

        // Listen for 'r' key to stop
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                stopAnimation = true;
            }
        }, { signal: abortController.signal });

        // Loop 20 times as requested (or until stopped)
        for (let i = 0; i < 20; i++) {
            if (stopAnimation) break;

            for (const frame of frames) {
                if (stopAnimation) break;

                this.output.innerHTML = `
                    <div class="ascii-art" style="color: #00FF41;">${frame}</div>
                    <div class="system-msg" style="color: #00FF41; margin-top: 20px; text-align: center;">[ Press 'r' to exit ]</div>
                 `;
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(r => setTimeout(r, 150));
            }
        }

        // Cleanup
        audio.pause();
        audio.currentTime = 0;
        abortController.abort(); // Remove event listener
        this.output.innerHTML = '';
        this.printWelcome(); // Restore welcome message
        this.updatePrompt();
        this.input.disabled = false;
        this.input.focus();
    }

    getCurrentDirObj() {
        let current = window.fileSystem.root;
        for (const dir of this.currentPath) {
            if (current[dir] && current[dir].type === 'directory') {
                current = current[dir].children;
            } else {
                return null; // Error state
            }
        }
        return current;
    }

    listDir() {
        const currentObj = this.getCurrentDirObj();
        if (!currentObj) {
            this.printLine("Error: Current directory corrupt.", "error");
            return;
        }

        const keys = Object.keys(currentObj);
        const dirs = keys.filter(k => currentObj[k].type === 'directory').map(k => k + '/').join('  ');
        const files = keys.filter(k => currentObj[k].type === 'file').join('  ');

        if (dirs) this.printLine(dirs, "command"); // Blue or distinct color for dirs usually, keeping bold for now
        if (files) this.printLine(files, "terminal-text");
    }

    changeDir(target) {
        if (!target) {
            this.currentPath = [];
            this.updatePrompt();
            return;
        }

        if (target === '..') {
            if (this.currentPath.length > 0) {
                this.currentPath.pop();
            }
            this.updatePrompt();
            return;
        }

        if (target === '~') {
            this.currentPath = [];
            this.updatePrompt();
            return;
        }

        const currentObj = this.getCurrentDirObj();
        if (currentObj[target] && currentObj[target].type === 'directory') {
            this.currentPath.push(target);
            this.updatePrompt();
        } else {
            this.printLine(`cd: ${target}: No such directory`, "error");
        }
    }

    readFile(filename) {
        if (!filename) {
            this.printLine("usage: cat [file]", "error");
            return;
        }

        const currentObj = this.getCurrentDirObj();
        const file = currentObj[filename];

        if (file && file.type === 'file') {
            this.printLine(file.content);
        } else if (file && file.type === 'directory') {
            this.printLine(`cat: ${filename}: Is a directory`, "error");
        } else {
            this.printLine(`cat: ${filename}: No such file`, "error");
        }
    }
}

// Start
window.onload = () => {
    new Terminal();
};
