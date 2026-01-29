document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeSpinner = document.getElementById('analyze-spinner');
    const btnText = document.getElementById('btn-text');
    const langSelect = document.getElementById('language-select');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const formatBadge = document.getElementById('format-badge');

    // ==================================================
    // 1. EDITOR LOGIC (Line Numbers & Scroll Sync)
    // ==================================================
    
    // Function to update line numbers based on text lines
    const updateLineNumbers = () => {
        if (!codeInput || !lineNumbers) return;
        
        const lines = codeInput.value.split('\n').length;
        // Generate an array of numbers [1, 2, 3...] and join them with line breaks
        lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
    };

    // Sync scrolling: When you scroll the code, line numbers scroll with it
    if (codeInput && lineNumbers) {
        codeInput.addEventListener('scroll', () => {
            lineNumbers.scrollTop = codeInput.scrollTop;
        });

        // Update lines whenever user types
        codeInput.addEventListener('input', updateLineNumbers);
        
        // Initial call to set line "1"
        updateLineNumbers();
    }

    // ==================================================
    // 2. SMART PASTE HANDLER (The "Copy-Paste Fixer")
    // ==================================================
    if (codeInput) {
        codeInput.addEventListener('paste', (e) => {
            // Prevent default paste (which might carry rich text/formatting)
            e.preventDefault();

            // Get plain text from clipboard
            let text = (e.clipboardData || window.clipboardData).getData('text');

            // --- SMART CLEANUP LOGIC ---
            // 1. Normalize line endings to simple \n
            text = text.replace(/\r\n/g, "\n");
            
            // 2. Remove excessive blank lines (more than 2 empty lines becomes 2)
            text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
            
            // 3. Fix weird indentation (optional: trim trailing spaces)
            text = text.split('\n').map(line => line.trimEnd()).join('\n');

            // Insert the cleaned text at the cursor position
            const start = codeInput.selectionStart;
            const end = codeInput.selectionEnd;
            const currentText = codeInput.value;
            
            codeInput.value = currentText.substring(0, start) + text + currentText.substring(end);
            
            // Restore cursor position after the pasted text
            codeInput.selectionStart = codeInput.selectionEnd = start + text.length;

            // Update UI
            updateLineNumbers();
            
            // Show the "Formatted" badge for a cool effect
            if(formatBadge) {
                formatBadge.classList.remove('hidden');
                setTimeout(() => formatBadge.classList.add('hidden'), 3000);
            }
        });
    }

    // ==================================================
    // 3. FILE UPLOAD LOGIC
    // ==================================================
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Auto-select language based on extension
            const ext = file.name.split('.').pop().toLowerCase();
            const langMap = {
                'py': 'python', 'js': 'javascript', 'ts': 'javascript',
                'java': 'java', 'c': 'cpp', 'cpp': 'cpp', 'h': 'cpp'
            };
            if (langMap[ext]) langSelect.value = langMap[ext];

            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                codeInput.value = e.target.result;
                updateLineNumbers();
                // Show badge
                if(formatBadge) {
                    formatBadge.textContent = "File Loaded";
                    formatBadge.classList.remove('hidden');
                    setTimeout(() => formatBadge.classList.add('hidden'), 3000);
                }
            };
            reader.readAsText(file);
        });
    }

    // ==================================================
    // 4. API & NAVIGATION LOGIC
    // ==================================================
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const code = codeInput.value;
            
            // Validation
            if (!code.trim()) {
                alert("Please enter some code to analyze.");
                codeInput.focus();
                return;
            }

            // UI State: Loading
            analyzeBtn.disabled = true;
            btnText.textContent = "Analyzing Logic...";
            analyzeSpinner.classList.remove('hidden');

            try {
                // Send to Backend
                const response = await fetch('http://127.0.0.1:8000/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code,
                        language: langSelect.value
                    })
                });

                if (!response.ok) {
                    throw new Error("Analysis failed. Is the backend running?");
                }

                const result = await response.json();

                // Save result to LocalStorage (to pass it to the Report Page)
                localStorage.setItem('bugSenseResults', JSON.stringify(result));

                // Navigate to Report Page
                // Small delay to let the user see the spinner (UX best practice)
                setTimeout(() => {
                    window.location.href = 'report.html';
                }, 500);

            } catch (error) {
                console.error(error);
                alert("Connection Error: Make sure your backend (main.py) is running!");
                
                // Reset UI
                analyzeBtn.disabled = false;
                btnText.textContent = "Run Prediction Agent";
                analyzeSpinner.classList.add('hidden');
            }
        });
    }
});