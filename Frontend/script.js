document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. GLOBAL VARIABLES & ELEMENTS
    // ==========================================
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const languageSelect = document.getElementById('language-select');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeText = document.getElementById('analyze-text');
    const analyzeSpinner = document.getElementById('analyze-spinner');
    const resultsSection = document.getElementById('results-section');

    // ==========================================
    // 2. LINE NUMBER SYNCHRONIZATION (The "Editor" Feel)
    // ==========================================
    const updateLineNumbers = () => {
        // Count lines in the textarea
        const lines = codeInput.value.split('\n').length;
        // Generate numbers 1 to N joined by line breaks
        lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
    };

    const syncScroll = () => {
        // Sync the scroll position of numbers with code
        lineNumbers.scrollTop = codeInput.scrollTop;
    };

    if (codeInput && lineNumbers) {
        // Update on typing and other input-like events
        codeInput.addEventListener('input', updateLineNumbers);
        codeInput.addEventListener('change', updateLineNumbers);
        codeInput.addEventListener('keyup', updateLineNumbers);

        // Handle paste: normalize newlines and trim accidental leading/trailing blank lines
        codeInput.addEventListener('paste', function(e) {
            // Prefer handling paste ourselves so we can clean up extra blank lines
            try {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const cleaned = normalized.replace(/^\n+|\n+$/g, '');

                const start = codeInput.selectionStart;
                const end = codeInput.selectionEnd;
                const before = codeInput.value.slice(0, start);
                const after = codeInput.value.slice(end);
                codeInput.value = before + cleaned + after;
                const caret = start + cleaned.length;
                codeInput.setSelectionRange(caret, caret);
                updateLineNumbers();
            } catch (err) {
                // Fallback: allow default and schedule update
                setTimeout(updateLineNumbers, 0);
            }
        });

        // Cut: schedule update after DOM changes
        codeInput.addEventListener('cut', () => setTimeout(updateLineNumbers, 0));

        // Drop: insert cleaned text at drop position
        codeInput.addEventListener('drop', function(e) {
            e.preventDefault();
            const text = (e.dataTransfer && (e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text'))) || '';
            const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const cleaned = normalized.replace(/^\n+|\n+$/g, '');
            // Determine caret position from mouse (fallback to end)
            const start = codeInput.selectionStart || codeInput.value.length;
            const end = codeInput.selectionEnd || start;
            const before = codeInput.value.slice(0, start);
            const after = codeInput.value.slice(end);
            codeInput.value = before + cleaned + after;
            const caret = start + cleaned.length;
            codeInput.setSelectionRange(caret, caret);
            updateLineNumbers();
        });

        // Sync on scrolling
        codeInput.addEventListener('scroll', syncScroll);
        lineNumbers.addEventListener('scroll', () => {
            // keep two-way sync safe (avoid loops)
            if (Math.abs(lineNumbers.scrollTop - codeInput.scrollTop) > 1) {
                codeInput.scrollTop = lineNumbers.scrollTop;
            }
        });

        // Initialize
        updateLineNumbers();
    }

    // ==========================================
    // 3. FILE UPLOAD & AUTO-DETECT LANGUAGE
    // ==========================================
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // --- A. Auto-Detect Language Logic ---
            const extension = file.name.split('.').pop().toLowerCase();
            const langMap = {
                'py': 'python',
                'java': 'java',
                'js': 'javascript',
                'ts': 'javascript',
                'jsx': 'javascript',
                'c': 'cpp',
                'cpp': 'cpp',
                'h': 'cpp',
                'hpp': 'cpp'
            };

            // If extension matches, select it in the dropdown
            if (langMap[extension]) {
                languageSelect.value = langMap[extension];
                // Visual feedback (console log for debugging)
                console.log(`Auto-detected language: ${langMap[extension]}`);
            }

            // --- B. Read File Content ---
            const reader = new FileReader();
            reader.onload = function(e) {
                codeInput.value = e.target.result;
                // Update line numbers immediately after loading file
                updateLineNumbers();
            };
            reader.readAsText(file);
        });
    }

    // ==========================================
    // 4. TYPING ANIMATION (Visual Appeal)
    // ==========================================
    const placeholders = [
        "// Paste your code here...",
        "def predict_bug(code):\n    risk = model.analyze(code)\n    return risk",
        "public class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}"
    ];
    let placeholderIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typePlaceholder() {
        // Stop animation if user focuses or types
        if (document.activeElement === codeInput || codeInput.value.length > 0) return;
        
        const currentText = placeholders[placeholderIndex];
        
        if (isDeleting) {
            codeInput.setAttribute('placeholder', currentText.substring(0, charIndex - 1));
            charIndex--;
        } else {
            codeInput.setAttribute('placeholder', currentText.substring(0, charIndex + 1));
            charIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 70;

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            typeSpeed = 500; // Pause before new text
        }

        setTimeout(typePlaceholder, typeSpeed);
    }
    // Start animation after 1 second
    setTimeout(typePlaceholder, 1000);

    // ==========================================
    // 5. MAIN ANALYSIS LOGIC (Connect to Python)
    // ==========================================
    analyzeBtn.addEventListener('click', async function() {
        const code = codeInput.value.trim();
        const language = languageSelect.value;
        
        if (!code) {
            alert("Please input some code first!");
            return;
        }

        // --- UI Loading State ---
        analyzeBtn.disabled = true;
        analyzeText.textContent = "Connecting to AI Agent...";
        analyzeSpinner.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        try {
            // --- CALLING YOUR PYTHON BACKEND ---
            const response = await fetch('/analyze',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code, language: language })
            });

            if (!response.ok) {
                throw new Error("Server Error");
            }

            const results = await response.json();
            renderResults(results);
            
            // Show Success
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.warn("Backend Error:", error);
            
            // --- FALLBACK (Demo Mode) ---
            // If the user forgot to run 'python main.py', this ensures the presentation doesn't fail.
            alert("Note: Connecting to Local Demo Mode (Backend unreachable).");
            const fallbackResults = performLocalAnalysis(code);
            renderResults(fallbackResults);
            
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } finally {
            // Reset Button State
            analyzeBtn.disabled = false;
            analyzeText.textContent = "Run Prediction Agent";
            analyzeSpinner.classList.add('hidden');
            // Re-render icons
            if (typeof feather !== 'undefined') feather.replace();
        }
    });

    // ==========================================
    // 6. RENDER RESULTS TO DOM
    // ==========================================
    function renderResults(data) {
        const riskLevelEl = document.getElementById('risk-level');
        const riskPercentEl = document.getElementById('risk-percentage');
        const riskProgressEl = document.getElementById('risk-progress');
        const riskIconEl = document.getElementById('risk-icon');
        const riskBanner = document.getElementById('risk-banner');
        
        // Update Metrics
        document.getElementById('metric-loc').textContent = data.loc || 0;
        document.getElementById('metric-loops').textContent = data.loops || 0;
        document.getElementById('metric-complexity').textContent = data.complexity || 0;

        // Determine Colors & Titles based on Risk Score
        const score = data.risk_score || 0;
        let color, title, icon;

        if (score < 30) {
            color = "emerald";
            title = "Low Risk";
            icon = "check-circle";
        } else if (score < 70) {
            color = "orange";
            title = "Medium Risk";
            icon = "alert-triangle";
        } else {
            color = "red";
            title = "Critical Risk";
            icon = "slash";
        }

        // Apply Styles
        riskBanner.className = `p-8 rounded-2xl border transition-all duration-500 bg-${color}-50 dark:bg-${color}-900/10 border-${color}-200 dark:border-${color}-800`;
        riskIconEl.className = `w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 bg-${color}-100 dark:bg-${color}-800 text-${color}-600 dark:text-${color}-400`;
        riskIconEl.innerHTML = `<i data-feather="${icon}" class="w-8 h-8"></i>`;
        
        riskLevelEl.textContent = title;
        riskLevelEl.className = `text-3xl font-black italic tracking-tight text-${color}-600 dark:text-${color}-400`;
        
        riskPercentEl.textContent = score + "%";
        riskPercentEl.className = `text-5xl font-black tracking-tighter transition-all duration-1000 text-${color}-600 dark:text-${color}-400`;
        
        // Animate Bar
        riskProgressEl.className = `h-full rounded-full transition-all duration-1000 w-0 bg-${color}-500`;
        setTimeout(() => riskProgressEl.style.width = score + "%", 100);

        // Render Issues List
        const list = document.getElementById('issues-list');
        list.innerHTML = "";
        
        if (!data.issues || data.issues.length === 0) {
            list.innerHTML = `<div class="text-center p-6 opacity-60 flex flex-col items-center"><i data-feather="check" class="mb-2"></i>No critical patterns detected.</div>`;
        } else {
            data.issues.forEach(issue => {
                let badge = issue.severity === 'Critical' ? 'red' : (issue.severity === 'High' ? 'orange' : 'blue');
                const html = `
                    <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-${badge}-500/30 transition-colors">
                        <div class="mt-1 p-2 rounded-lg bg-${badge}-100 dark:bg-${badge}-900/30 text-${badge}-600 dark:text-${badge}-400">
                            <i data-feather="alert-octagon" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="flex gap-2 items-center mb-1">
                                <h5 class="font-bold text-slate-700 dark:text-slate-200">${issue.title}</h5>
                                <span class="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">Line ${issue.line}</span>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-slate-400">${issue.description}</p>
                        </div>
                    </div>
                `;
                list.insertAdjacentHTML('beforeend', html);
            });
        }
        
        // Re-init icons for the new content
        if (typeof feather !== 'undefined') feather.replace();
    }

    // ==========================================
    // 7. FALLBACK ANALYZER (Client-Side Regex)
    // ==========================================
    function performLocalAnalysis(code) {
        const issues = [];
        const lines = code.split('\n');
        
        // Simple client-side regex check
        if (code.includes('eval(')) issues.push({ title: 'Unsafe Eval', severity: 'High', description: 'Avoid using eval() due to security risks.', line: code.indexOf('eval(') > -1 ? '?' : 0 });
        if (code.includes('innerHTML')) issues.push({ title: 'XSS Risk', severity: 'Medium', description: 'Direct innerHTML assignment.', line: '?' });
        
        return {
            loc: lines.length,
            loops: (code.match(/for|while|foreach/g) || []).length,
            complexity: 5 + Math.floor(Math.random() * 10),
            risk_score: issues.length > 0 ? 65 : 10,
            issues: issues
        };
    }
});