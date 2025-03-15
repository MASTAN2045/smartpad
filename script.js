document.addEventListener('DOMContentLoaded', () => {
    const noteArea = document.getElementById('noteArea');
    const saveBtn = document.getElementById('saveBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const newBtn = document.getElementById('newBtn');
    const micBtn = document.getElementById('micBtn');
    const fontSize = document.getElementById('fontSize');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const saveStatus = document.getElementById('saveStatus');
    const themeToggle = document.getElementById('themeToggle');
    const speechStatus = document.getElementById('speechStatus');
    const shareDropdown = document.getElementById('shareDropdown');
    const whatsappShare = document.getElementById('whatsappShare');
    const emailShare = document.getElementById('emailShare');
    const copyLink = document.getElementById('copyLink');
    const savedNotesBtn = document.getElementById('savedNotesBtn');
    const savedNotesModal = document.getElementById('savedNotesModal');
    const notesList = document.getElementById('notesList');

    // Theme Management
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    updateTheme();

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        updateTheme();
    });

    function updateTheme() {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Speech Recognition Setup with auto-stop
    let recognition = null;
    let silenceTimer = null;
    const SILENCE_TIMEOUT = 5000; // 5 seconds of silence before auto-stop

    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            // Reset silence timer when voice is detected
            resetSilenceTimer();

            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            const cursorPosition = noteArea.selectionStart;
            const textBeforeCursor = noteArea.value.substring(0, cursorPosition);
            const textAfterCursor = noteArea.value.substring(cursorPosition);
            noteArea.value = textBeforeCursor + transcript + textAfterCursor;
            updateCounts();
        };

        recognition.onstart = () => {
            isListening = true;
            speechStatus.style.display = 'flex';
            speechStatus.innerHTML = '<i class="fas fa-microphone-alt"></i><span>Listening...</span>';
            micBtn.style.backgroundColor = 'var(--primary-color)';
            resetSilenceTimer();
        };

        recognition.onend = () => {
            isListening = false;
            speechStatus.style.display = 'none';
            micBtn.style.backgroundColor = '';
            clearTimeout(silenceTimer);
        };

        // Add audioend event to detect when user stops speaking
        recognition.onaudioend = () => {
            resetSilenceTimer();
        };

        // Add nomatch event to handle silence
        recognition.onnomatch = () => {
            resetSilenceTimer();
        };

        // Add error handling
        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                resetSilenceTimer();
            }
        };
    }

    function resetSilenceTimer() {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            if (isListening) {
                showNotification('No voice detected, stopping recording...', 'info');
                stopRecording();
            }
        }, SILENCE_TIMEOUT);
    }

    function stopRecording() {
        if (recognition && isListening) {
            recognition.stop();
            isListening = false;
            speechStatus.style.display = 'none';
            micBtn.style.backgroundColor = '';
            clearTimeout(silenceTimer);
        }
    }

    // Speech to Text Toggle with enhanced feedback
    let isListening = false;
    micBtn.addEventListener('click', () => {
        if (!recognition) {
            showNotification('Speech recognition is not supported in your browser', 'error');
            return;
        }

        if (isListening) {
            stopRecording();
            showNotification('Voice recording stopped', 'info');
        } else {
            try {
                recognition.start();
                showNotification('Voice recording started', 'success');
            } catch (error) {
                showNotification('Error starting voice recognition. Please try again.', 'error');
            }
        }
    });

    // Load saved note
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteArea.value = savedNote;
        updateCounts();
    }

    // Auto-save functionality
    let saveTimeout;
    noteArea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveStatus.innerHTML = '<i class="fas fa-sync-alt"></i> Saving...';
        saveTimeout = setTimeout(() => {
            localStorage.setItem('note', noteArea.value);
            showNotification('Auto-saved successfully!');
            saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> All changes saved';
        }, 1000);
        updateCounts();
    });

    // Update word and character counts
    function updateCounts() {
        const text = noteArea.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        wordCount.innerHTML = `<i class="fas fa-words"></i> Words: ${words}`;
        charCount.innerHTML = `<i class="fas fa-text-width"></i> Characters: ${chars}`;
    }

    // New note
    newBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to create a new note? This will clear the current note.')) {
            noteArea.value = '';
            localStorage.removeItem('note');
            updateCounts();
        }
    });

    // Save functionality
    saveBtn.addEventListener('click', () => {
        localStorage.setItem('note', noteArea.value);
        showNotification('Note saved successfully!');
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(noteArea.value);
            showNotification('Copied to clipboard!');
        } catch (err) {
            showNotification('Failed to copy text!', 'error');
        }
    });

    // Download functionality
    const downloadDropdown = document.getElementById('downloadDropdown');
    const downloadTxt = document.getElementById('downloadTxt');
    const downloadPdf = document.getElementById('downloadPdf');

    // Toggle download dropdown
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!downloadDropdown.contains(e.target) && !downloadBtn.contains(e.target)) {
            downloadDropdown.classList.remove('show');
        }
    });

    // Custom filename prompt modal HTML - add this dynamically
    const modalHTML = `
        <div id="filenameModal" class="filename-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Save File</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="filename-input-group">
                        <input type="text" id="filenameInput" placeholder="Enter file name">
                        <span id="fileExtension"></span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancelDownload" class="modal-btn cancel-btn">Cancel</button>
                    <button id="confirmDownload" class="modal-btn confirm-btn">Download</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const filenameModal = document.getElementById('filenameModal');
    const filenameInput = document.getElementById('filenameInput');
    const fileExtension = document.getElementById('fileExtension');
    const confirmDownload = document.getElementById('confirmDownload');
    const cancelDownload = document.getElementById('cancelDownload');
    const closeModal = document.querySelector('.close-modal');

    // Download functions
    async function handleDownload(type) {
        const content = noteArea.value;
        if (!content.trim()) {
            showNotification('Nothing to download!', 'error');
            return;
        }

        // Show modal and set file extension
        filenameModal.style.display = 'flex';
        fileExtension.textContent = `.${type}`;
        filenameInput.value = `my-note`; // Default filename
        filenameInput.focus();
        filenameInput.select();

        // Return a promise that resolves when user confirms or cancels
        return new Promise((resolve, reject) => {
            const handleConfirm = async () => {
                const filename = filenameInput.value.trim() || 'my-note';
                filenameModal.style.display = 'none';
                resolve(filename);
            };

            const handleCancel = () => {
                filenameModal.style.display = 'none';
                reject('Download cancelled');
            };

            confirmDownload.onclick = handleConfirm;
            cancelDownload.onclick = handleCancel;
            closeModal.onclick = handleCancel;

            // Handle Enter key
            filenameInput.onkeyup = (e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') handleCancel();
            };

            // Close modal when clicking outside
            window.onclick = (e) => {
                if (e.target === filenameModal) handleCancel();
            };
        });
    }

    // Download as TXT
    downloadTxt.addEventListener('click', async () => {
        try {
            const filename = await handleDownload('txt');
            const content = noteArea.value;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            downloadDropdown.classList.remove('show');
            showNotification('Downloaded as TXT!', 'success');
        } catch (error) {
            if (error !== 'Download cancelled') {
                showNotification('Failed to download file!', 'error');
            }
        }
    });

    // Download as PDF
    downloadPdf.addEventListener('click', async () => {
        try {
            const filename = await handleDownload('pdf');
            const content = noteArea.value;
            const container = document.createElement('div');
            container.innerHTML = content;
            container.style.padding = '20px';
            
            const opt = {
                margin: 1,
                filename: `${filename}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
            downloadDropdown.classList.remove('show');
            showNotification('Downloaded as PDF!', 'success');
        } catch (error) {
            if (error !== 'Download cancelled') {
                showNotification('Failed to generate PDF!', 'error');
            }
        }
    });

    // Share functionality
    // Toggle share dropdown
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!shareDropdown.contains(e.target) && !shareBtn.contains(e.target)) {
            shareDropdown.classList.remove('show');
        }
    });

    // WhatsApp Share
    whatsappShare.addEventListener('click', () => {
        const text = noteArea.value;
        if (text.trim() === '') {
            showNotification('Please add some text to share', 'error');
            return;
        }

        // Encode the text for URL
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;

        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        shareDropdown.classList.remove('show');
        showNotification('Opening WhatsApp...', 'success');
    });

    // Email Share
    emailShare.addEventListener('click', () => {
        const text = noteArea.value;
        if (text.trim() === '') {
            showNotification('Please add some text to share', 'error');
            return;
        }

        // Create mailto link
        const subject = encodeURIComponent('Shared Note');
        const body = encodeURIComponent(text);
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

        // Open default email client
        window.location.href = mailtoLink;
        shareDropdown.classList.remove('show');
        showNotification('Opening email client...', 'success');
    });

    // Copy to clipboard
    copyLink.addEventListener('click', async () => {
        const text = noteArea.value;
        if (text.trim() === '') {
            showNotification('Please add some text to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            shareDropdown.classList.remove('show');
            showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy text!', 'error');
        }
    });

    // Font size change
    fontSize.addEventListener('change', (e) => {
        noteArea.style.fontSize = `${e.target.value}px`;
    });

    // Enhanced notification system with icons
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        let icon;
        
        switch(type) {
            case 'success':
                icon = 'check-circle';
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                icon = 'exclamation-circle';
                notification.style.backgroundColor = '#f44336';
                break;
            case 'info':
                icon = 'info-circle';
                notification.style.backgroundColor = '#2196F3';
                break;
        }

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Text Selection Functionality
    const selectionToolbar = document.getElementById('selectionToolbar');
    let selectedText = '';

    // Show toolbar on text selection
    noteArea.addEventListener('mouseup', handleSelection);
    noteArea.addEventListener('keyup', handleSelection);

    function handleSelection(e) {
        const selection = window.getSelection();
        selectedText = selection.toString().trim();

        if (selectedText) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Position the toolbar above the selection
            selectionToolbar.style.top = `${rect.top - 50 + window.scrollY}px`;
            selectionToolbar.style.left = `${rect.left + (rect.width / 2) - (selectionToolbar.offsetWidth / 2)}px`;
            selectionToolbar.classList.add('show');
        } else {
            selectionToolbar.classList.remove('show');
        }
    }

    // Hide toolbar when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!selectionToolbar.contains(e.target) && e.target !== noteArea) {
            selectionToolbar.classList.remove('show');
        }
    });

    // Handle toolbar actions
    selectionToolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.selection-tool');
        if (!button) return;

        const action = button.dataset.action;
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        switch (action) {
            case 'bold':
                wrapSelection('**');
                break;
            case 'italic':
                wrapSelection('*');
                break;
            case 'underline':
                wrapSelection('__');
                break;
            case 'copy':
                copySelectedText();
                break;
            case 'highlight':
                highlightSelection();
                break;
            case 'speak':
                speakSelectedText();
                break;
        }
    });

    function wrapSelection(wrapper) {
        const start = noteArea.selectionStart;
        const end = noteArea.selectionEnd;
        const selectedText = noteArea.value.substring(start, end);
        const newText = wrapper + selectedText + wrapper;
        
        noteArea.value = noteArea.value.substring(0, start) + newText + noteArea.value.substring(end);
        noteArea.focus();
        showNotification('Text formatted', 'success');
    }

    function copySelectedText() {
        navigator.clipboard.writeText(selectedText).then(() => {
            showNotification('Text copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy text', 'error');
        });
    }

    function highlightSelection() {
        const start = noteArea.selectionStart;
        const end = noteArea.selectionEnd;
        const selectedText = noteArea.value.substring(start, end);
        const highlightedText = `<mark>${selectedText}</mark>`;
        
        noteArea.value = noteArea.value.substring(0, start) + highlightedText + noteArea.value.substring(end);
        noteArea.focus();
        showNotification('Text highlighted', 'success');
    }

    function speakSelectedText() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(selectedText);
            speechSynthesis.speak(utterance);
            showNotification('Speaking selected text', 'info');
        } else {
            showNotification('Speech synthesis not supported', 'error');
        }
    }

    // Enhanced notification for selection actions
    function showSelectionNotification(action) {
        showNotification(`Text ${action} successfully!`, 'success');
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (selectionToolbar.classList.contains('show')) {
            handleSelection();
        }
    });

    // Handle scroll
    noteArea.addEventListener('scroll', () => {
        selectionToolbar.classList.remove('show');
    });

    // Text Formatting Controls
    const fontFamily = document.getElementById('fontFamily');
    const fontSizeInput = document.getElementById('fontSize');
    const decreaseFont = document.getElementById('decreaseFont');
    const increaseFont = document.getElementById('increaseFont');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const alignLeft = document.getElementById('alignLeft');
    const alignCenter = document.getElementById('alignCenter');
    const alignRight = document.getElementById('alignRight');

    // Font Family
    fontFamily.addEventListener('change', (e) => {
        noteArea.style.fontFamily = e.target.value;
        saveSettings();
    });

    // Font Size Controls
    function updateFontSize(size) {
        size = Math.min(Math.max(size, 8), 80); // Limit between 8 and 80
        fontSizeInput.value = size;
        noteArea.style.fontSize = `${size}px`;
        saveSettings();
    }

    fontSizeInput.addEventListener('change', (e) => {
        updateFontSize(parseInt(e.target.value));
    });

    decreaseFont.addEventListener('click', () => {
        updateFontSize(parseInt(fontSizeInput.value) - 1);
    });

    increaseFont.addEventListener('click', () => {
        updateFontSize(parseInt(fontSizeInput.value) + 1);
    });

    // Text Formatting
    boldBtn.addEventListener('click', () => {
        toggleStyle(boldBtn, 'fontWeight', 'bold', 'normal');
    });

    italicBtn.addEventListener('click', () => {
        toggleStyle(italicBtn, 'fontStyle', 'italic', 'normal');
    });

    underlineBtn.addEventListener('click', () => {
        toggleStyle(underlineBtn, 'textDecoration', 'underline', 'none');
    });

    strikeBtn.addEventListener('click', () => {
        toggleStyle(strikeBtn, 'textDecoration', 'line-through', 'none');
    });

    // Text Alignment
    alignLeft.addEventListener('click', () => {
        setAlignment('left');
    });

    alignCenter.addEventListener('click', () => {
        setAlignment('center');
    });

    alignRight.addEventListener('click', () => {
        setAlignment('right');
    });

    function toggleStyle(button, style, value1, value2) {
        button.classList.toggle('active');
        noteArea.style[style] = button.classList.contains('active') ? value1 : value2;
        saveSettings();
    }

    function setAlignment(alignment) {
        [alignLeft, alignCenter, alignRight].forEach(btn => btn.classList.remove('active'));
        noteArea.style.textAlign = alignment;
        document.getElementById(`align${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`).classList.add('active');
        saveSettings();
    }

    // Save and Load Settings
    function saveSettings() {
        const settings = {
            fontFamily: noteArea.style.fontFamily,
            fontSize: noteArea.style.fontSize,
            fontWeight: noteArea.style.fontWeight,
            fontStyle: noteArea.style.fontStyle,
            textDecoration: noteArea.style.textDecoration,
            textAlign: noteArea.style.textAlign
        };
        localStorage.setItem('notepadSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('notepadSettings'));
        if (settings) {
            noteArea.style.fontFamily = settings.fontFamily;
            noteArea.style.fontSize = settings.fontSize;
            noteArea.style.fontWeight = settings.fontWeight;
            noteArea.style.fontStyle = settings.fontStyle;
            noteArea.style.textDecoration = settings.textDecoration;
            noteArea.style.textAlign = settings.textAlign;

            // Update controls to match loaded settings
            fontFamily.value = settings.fontFamily;
            fontSizeInput.value = parseInt(settings.fontSize);
            boldBtn.classList.toggle('active', settings.fontWeight === 'bold');
            italicBtn.classList.toggle('active', settings.fontStyle === 'italic');
            underlineBtn.classList.toggle('active', settings.textDecoration === 'underline');
            strikeBtn.classList.toggle('active', settings.textDecoration === 'line-through');
            
            const alignment = settings.textAlign || 'left';
            document.getElementById(`align${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`).classList.add('active');
        }
    }

    // Initialize settings
    loadSettings();

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    boldBtn.click();
                    break;
                case 'i':
                    e.preventDefault();
                    italicBtn.click();
                    break;
                case 'u':
                    e.preventDefault();
                    underlineBtn.click();
                    break;
            }
        }
    });

    // Save note with title
    function saveNote(title = null) {
        const content = noteArea.value;
        const date = new Date().toISOString();
        
        // Get existing notes or initialize empty array
        const notes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
        
        if (!title) {
            title = `Note ${notes.length + 1}`;
        }

        // Add new note
        notes.push({
            id: Date.now(),
            title,
            content,
            date,
            lastModified: date
        });

        // Save to localStorage
        localStorage.setItem('savedNotes', JSON.stringify(notes));
        showNotification('Note saved successfully!', 'success');
    }

    // Load saved notes
    function loadSavedNotes() {
        const notes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
        notesList.innerHTML = '';

        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-folder-open"></i>
                    <p>No saved notes found</p>
                </div>
            `;
            return;
        }

        notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-info">
                    <div class="note-title">${note.title}</div>
                    <div class="note-date">Last modified: ${new Date(note.lastModified).toLocaleString()}</div>
                </div>
                <div class="note-actions">
                    <button class="note-action-btn open" data-id="${note.id}">
                        <i class="fas fa-folder-open"></i> Open
                    </button>
                    <button class="note-action-btn delete" data-id="${note.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            notesList.appendChild(noteElement);
        });
    }

    // Open saved note
    function openNote(id) {
        const notes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
        const note = notes.find(n => n.id === id);
        
        if (note) {
            noteArea.value = note.content;
            savedNotesModal.style.display = 'none';
            showNotification(`Opened: ${note.title}`, 'success');
        }
    }

    // Delete saved note
    function deleteNote(id) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        const notes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
        const updatedNotes = notes.filter(n => n.id !== id);
        localStorage.setItem('savedNotes', JSON.stringify(updatedNotes));
        
        loadSavedNotes();
        showNotification('Note deleted successfully!', 'success');
    }

    // Event Listeners
    savedNotesBtn.addEventListener('click', () => {
        savedNotesModal.style.display = 'flex';
        loadSavedNotes();
    });

    // Close modal when clicking outside
    savedNotesModal.addEventListener('click', (e) => {
        if (e.target === savedNotesModal) {
            savedNotesModal.style.display = 'none';
        }
    });

    // Handle note actions
    notesList.addEventListener('click', (e) => {
        const button = e.target.closest('.note-action-btn');
        if (!button) return;

        const id = parseInt(button.dataset.id);
        
        if (button.classList.contains('open')) {
            openNote(id);
        } else if (button.classList.contains('delete')) {
            deleteNote(id);
        }
    });

    // Save note with custom title
    function promptAndSave() {
        const title = prompt('Enter a title for your note:', '');
        if (title !== null) {
            saveNote(title);
            loadSavedNotes();
        }
    }

    // Add save button event listener
    document.getElementById('saveBtn').addEventListener('click', promptAndSave);
}); 