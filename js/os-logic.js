/* Retro OS Logic */
class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 100;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.activeWindow = null;

        // Sound Effects
        this.startupSound = new Audio('https://archive.org/download/Windows95StartupSound/Windows%2095%20Startup%20Sound.mp3');
        this.startupSoundEnabled = false;

        this.initDesktop();
    }

    initDesktop() {
        // Start Menu Toggle
        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('start-btn').classList.toggle('active');
            // Logic for showing menu would go here
        });

        // Clock
        setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('clock').textContent = timeStr;
        }, 1000);

        // Icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appId = icon.dataset.app;
                const title = icon.querySelector('.icon-label').textContent;
                this.openWindow(appId, title);
            });
            // Mobile tap
            icon.addEventListener('touchend', (e) => {
                const appId = icon.dataset.app;
                const title = icon.querySelector('.icon-label').textContent;
                this.openWindow(appId, title);
            });
        });
    }

    toggleStartupSound() {
        this.startupSoundEnabled = !this.startupSoundEnabled;
        if (this.startupSoundEnabled) {
            this.startupSound.play().catch(e => console.log("Audio play failed interaction required"));
            alert("Startup Sound Enabled! Refresh to hear it on boot.");
        }
    }

    openWindow(appId, title) {
        // Check if exists
        const existing = document.getElementById(`win-${appId}`);
        if (existing) {
            this.focusWindow(existing);
            return;
        }


        const win = document.createElement('div');
        win.id = `win-${appId}`;
        win.className = 'window';
        win.style.left = '50px';
        win.style.top = '50px';
        win.style.width = '640px';
        win.style.height = '480px';
        win.style.zIndex = ++this.zIndexCounter;

        // Content lookup
        const content = this.getContent(appId);

        win.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">
                    <img src="${this.getIconUrl(appId)}" width="16" height="16" style="image-rendering: pixelated;">
                    <span>${title}</span>
                </div>
                <div class="title-bar-controls">
                    <div class="title-btn help-btn">?</div>
                    <div class="title-btn close-btn">X</div>
                </div>
            </div>
            <div class="window-body">
                ${content}
            </div>
        `;

        document.body.appendChild(win);
        this.focusWindow(win);
        this.createTaskbarItem(appId, title);

        // Events
        const titleBar = win.querySelector('.title-bar');
        const closeBtn = win.querySelector('.close-btn');

        closeBtn.addEventListener('click', () => this.closeWindow(win, appId));

        // Dragging logic
        titleBar.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.activeWindow = win;
            this.focusWindow(win);

            const rect = win.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
        });

        // Window focus on click
        win.addEventListener('mousedown', () => this.focusWindow(win));
    }

    closeWindow(win, appId) {

        win.remove();
        const taskItem = document.getElementById(`task-${appId}`);
        if (taskItem) taskItem.remove();
    }

    focusWindow(win) {
        win.style.zIndex = ++this.zIndexCounter;
        // Update styling of active vs inactive windows if desired
    }

    createTaskbarItem(appId, title) {
        const bar = document.getElementById('task-list');
        const item = document.createElement('div');
        item.id = `task-${appId}`;
        item.className = 'task-item active';
        item.innerHTML = `<img src="${this.getIconUrl(appId)}" width="16" height="16" style="margin-right:5px;"> ${title}`;
        item.addEventListener('click', () => {
            const win = document.getElementById(`win-${appId}`);
            if (win) this.focusWindow(win);
        });
        bar.appendChild(item);
    }

    getIconUrl(appId) {
        // Simple mapping
        const map = {
            'our-story': 'https://win98icons.alexmeub.com/icons/png/notepad-5.png',
            'ministries': 'https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png',
            'gatherings': 'https://win98icons.alexmeub.com/icons/png/clock-0.png',
            'contact': 'https://win98icons.alexmeub.com/icons/png/phone_dialer-3.png'
        };
        return map[appId] || 'https://win98icons.alexmeub.com/icons/png/application_hourglass_small-3.png';
    }

    getContent(appId) {
        // Load content based on ID
        if (appId === 'our-story') return this.contentOurStory();
        if (appId === 'ministries') return this.contentMinistries();
        if (appId === 'gatherings') return this.contentGatherings();
        if (appId === 'contact') return this.contentContact();
        return '<p>Content loading...</p>';
    }

    // --- Content Templates ---

    contentOurStory() {
        return `
            <h2>About Koinonia</h2>
            <p>Koinonia Cooperative House is a privately certified house at the University of Illinois (UIUC).</p>
            <p>We are a family of undergraduate men with a mission to transform lives in the name of Jesus Christ.</p>
            <hr>
            <h3>Our Mission</h3>
            <p>"To transform lives in the name of Jesus Christ, bringing people into close fellowship with God and one another."</p>
            <p><i>"... Love one another, just as I have loved you." — John 15:12</i></p>
        `;
    }

    contentMinistries() {
        return `
            <div class="explorer-view">
                <p><strong>Spiritual Growth</strong></p>
                <ul>
                    <li>📂 Yearly Theme</li>
                    <li>📂 Bible Studies</li>
                    <li>📂 Morning Prayer</li>
                    <li>📂 Accountability Groups</li>
                </ul>
                <p>The core of our house is our walk with Christ. We engage in weekly studies and daily fellowship.</p>
            </div>
        `;
    }

    contentGatherings() {
        return `
            <h3>Life at Koinonia</h3>
            <p><strong>Meals:</strong><br>
            Dinner Mon-Thu & Sun at 5:30 PM.<br>
            Breakfast & Lunch available 24/7 self-serve.</p>
            <p><strong>Events:</strong><br>
            - Barn Dance<br>
            - Fall Retreat<br>
            - Intramural Sports</p>
        `;
    }

    contentContact() {
        return `
            <h3>Contact Us</h3>
            <p><strong>Address:</strong><br>314 E. Daniel St.<br>Champaign, IL 61820</p>
            <p><strong>Resident Director:</strong><br>Dan Spitz<br><a href="mailto:dspitz@uofibaptist.org">dspitz@uofibaptist.org</a></p>
        `;
    }
}

// Global Drag Handling
const os = new WindowManager();

document.addEventListener('mousemove', (e) => {
    if (os.isDragging && os.activeWindow) {
        os.activeWindow.style.left = `${e.clientX - os.dragOffset.x}px`;
        os.activeWindow.style.top = `${e.clientY - os.dragOffset.y}px`;
    }
});

document.addEventListener('mouseup', () => {
    os.isDragging = false;
    os.activeWindow = null;
});
