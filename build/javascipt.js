document.addEventListener("DOMContentLoaded", () => {
    const noteInput = document.getElementById("noteInput");
    const saveNoteButton = document.getElementById("saveNote");
    const notesContainer = document.getElementById("notesContainer");

    // Load saved notes from localStorage
    function loadNotes() {
        notesContainer.innerHTML = "";
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach((note, index) => {
            createNoteElement(note, index);
        });
    }

    // Create a note element
    function createNoteElement(text, index) {
        let noteDiv = document.createElement("div");
        noteDiv.classList.add("note");
        noteDiv.innerHTML = `
            <p contenteditable="true" oninput="editNote(${index}, this.innerText)">${text}</p>
            <button onclick="deleteNote(${index})">X</button>
        `;
        notesContainer.appendChild(noteDiv);
    }

    // Save a new note
    saveNoteButton.addEventListener("click", () => {
        let noteText = noteInput.value.trim();
        if (noteText !== "") {
            let notes = JSON.parse(localStorage.getItem("notes")) || [];
            notes.push(noteText);
            localStorage.setItem("notes", JSON.stringify(notes));
            noteInput.value = "";
            loadNotes();
        }
    });

    // Edit an existing note
    window.editNote = function(index, newText) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes[index] = newText;
        localStorage.setItem("notes", JSON.stringify(notes));
    };

    // Delete a note
    window.deleteNote = function(index) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        loadNotes();
    };

    // Load existing notes on page load
    loadNotes();

    // Check if there's any saved note when the page loads
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        document.getElementById('noteArea').value = savedNote;
    }
});

// Function to clear the notepad
function clearNote() {
    if (confirm('Are you sure you want to clear the notepad?')) {
        document.getElementById('noteArea').value = '';
        localStorage.removeItem('note');
    }
}

// Function to save the note
function saveNote() {
    const noteContent = document.getElementById('noteArea').value;
    localStorage.setItem('note', noteContent);
    alert('Note saved successfully!');
}

// Auto-save functionality (saves every 30 seconds)
setInterval(() => {
    const noteContent = document.getElementById('noteArea').value;
    localStorage.setItem('note', noteContent);
}, 30000);
