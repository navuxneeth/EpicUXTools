class TextAnalyzer {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.fileInput = document.getElementById('fileInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.fileName = document.getElementById('fileName');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Set up PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    setupEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.analyze());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Allow Enter key in textarea
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.analyze();
            }
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.fileName.textContent = `Loading: ${file.name}`;
        
        try {
            let text = '';
            const fileType = file.name.split('.').pop().toLowerCase();
            
            if (fileType === 'txt') {
                text = await this.readTextFile(file);
            } else if (fileType === 'pdf') {
                text = await this.readPDFFile(file);
            } else if (fileType === 'doc' || fileType === 'docx') {
                text = await this.readDocFile(file);
            }
            
            this.textInput.value = text;
            this.fileName.textContent = `Loaded: ${file.name}`;
            
            // Auto-analyze after loading
            setTimeout(() => this.analyze(), 300);
        } catch (error) {
            this.fileName.textContent = `Error loading file: ${error.message}`;
            console.error('File reading error:', error);
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async readPDFFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n';
            }
            
            return text;
        } catch (error) {
            throw new Error('Failed to read PDF file');
        }
    }

    async readDocFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            return result.value;
        } catch (error) {
            throw new Error('Failed to read DOC/DOCX file');
        }
    }

    clear() {
        this.textInput.value = '';
        this.fileName.textContent = '';
        this.resultsSection.style.display = 'none';
        this.fileInput.value = '';
    }

    analyze() {
        const text = this.textInput.value;
        
        if (!text.trim()) {
            alert('Please enter some text to analyze!');
            return;
        }

        const stats = this.calculateStats(text);
        this.displayResults(stats);
        this.resultsSection.style.display = 'grid';
        
        // Smooth scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    calculateStats(text) {
        const stats = {};
        
        // Basic counts
        stats.charCount = text.length;
        stats.charNoSpaceCount = text.replace(/\s/g, '').length;
        stats.lineCount = text.split('\n').length;
        
        // Paragraph count (non-empty paragraphs)
        stats.paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim()).length;
        
        // Word processing
        const words = text.match(/\b[\w']+\b/g) || [];
        stats.wordCount = words.length;
        
        // Unique words
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        stats.uniqueWordCount = uniqueWords.size;
        
        // Sentence count
        const sentences = text.match(/[.!?]+/g) || [];
        stats.sentenceCount = Math.max(sentences.length, 1);
        
        // Average word length
        if (words.length > 0) {
            const totalLength = words.reduce((sum, word) => sum + word.length, 0);
            stats.avgWordLength = (totalLength / words.length).toFixed(2);
        } else {
            stats.avgWordLength = 0;
        }
        
        // Average sentence length (words per sentence)
        stats.avgSentenceLength = words.length > 0 
            ? (words.length / stats.sentenceCount).toFixed(2) 
            : 0;
        
        // Longest and shortest words
        if (words.length > 0) {
            stats.longestWord = words.reduce((a, b) => a.length > b.length ? a : b);
            stats.shortestWord = words.reduce((a, b) => a.length < b.length ? a : b);
        } else {
            stats.longestWord = '-';
            stats.shortestWord = '-';
        }
        
        // Syllable count (approximate)
        stats.syllableCount = this.countSyllables(words);
        
        // Token count (approximate - using GPT-style estimation)
        stats.tokenCount = Math.ceil(stats.charCount / 4);
        
        // Reading time (200 words per minute)
        const readingMinutes = words.length / 200;
        stats.readingTime = this.formatTime(readingMinutes);
        
        // Speaking time (150 words per minute)
        const speakingMinutes = words.length / 150;
        stats.speakingTime = this.formatTime(speakingMinutes);
        
        // Flesch Reading Ease
        if (words.length > 0 && stats.sentenceCount > 0) {
            stats.fleschReading = this.calculateFleschReading(
                words.length, 
                stats.sentenceCount, 
                stats.syllableCount
            );
            
            // Flesch-Kincaid Grade Level
            stats.fleschGrade = this.calculateFleschGrade(
                words.length, 
                stats.sentenceCount, 
                stats.syllableCount
            );
        } else {
            stats.fleschReading = 0;
            stats.fleschGrade = 0;
        }
        
        // Character type counts
        stats.whitespaceCount = (text.match(/\s/g) || []).length;
        stats.punctuationCount = (text.match(/[.,;:!?'"()\-]/g) || []).length;
        stats.uppercaseCount = (text.match(/[A-Z]/g) || []).length;
        stats.lowercaseCount = (text.match(/[a-z]/g) || []).length;
        stats.numberCount = (text.match(/\d/g) || []).length;
        
        // Most common words (top 10, excluding common stop words)
        stats.topWords = this.getTopWords(words, 10);
        
        // Letter frequency
        stats.letterFreq = this.getLetterFrequency(text);
        
        return stats;
    }

    countSyllables(words) {
        let count = 0;
        words.forEach(word => {
            word = word.toLowerCase();
            if (word.length <= 3) {
                count++;
                return;
            }
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const syllables = word.match(/[aeiouy]{1,2}/g);
            count += syllables ? syllables.length : 1;
        });
        return count;
    }

    calculateFleschReading(words, sentences, syllables) {
        const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
        return Math.max(0, Math.min(100, score)).toFixed(1);
    }

    calculateFleschGrade(words, sentences, syllables) {
        const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
        return Math.max(0, grade).toFixed(1);
    }

    formatTime(minutes) {
        if (minutes < 1) {
            return `${Math.ceil(minutes * 60)}s`;
        } else if (minutes < 60) {
            const mins = Math.floor(minutes);
            const secs = Math.ceil((minutes - mins) * 60);
            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.ceil(minutes % 60);
            return `${hours}h ${mins}m`;
        }
    }

    getTopWords(words, count) {
        const stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
        ]);
        
        const wordFreq = {};
        words.forEach(word => {
            const lower = word.toLowerCase();
            if (!stopWords.has(lower) && lower.length > 2) {
                wordFreq[lower] = (wordFreq[lower] || 0) + 1;
            }
        });
        
        return Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
    }

    getLetterFrequency(text) {
        const freq = {};
        const letters = text.toLowerCase().match(/[a-z]/g) || [];
        
        letters.forEach(letter => {
            freq[letter] = (freq[letter] || 0) + 1;
        });
        
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1]);
    }

    displayResults(stats) {
        // Basic stats
        document.getElementById('wordCount').textContent = stats.wordCount.toLocaleString();
        document.getElementById('charCount').textContent = stats.charCount.toLocaleString();
        document.getElementById('charNoSpaceCount').textContent = stats.charNoSpaceCount.toLocaleString();
        document.getElementById('lineCount').textContent = stats.lineCount.toLocaleString();
        document.getElementById('paragraphCount').textContent = stats.paragraphCount.toLocaleString();
        document.getElementById('sentenceCount').textContent = stats.sentenceCount.toLocaleString();
        
        // Advanced stats
        document.getElementById('uniqueWordCount').textContent = stats.uniqueWordCount.toLocaleString();
        document.getElementById('avgWordLength').textContent = stats.avgWordLength;
        document.getElementById('avgSentenceLength').textContent = stats.avgSentenceLength;
        document.getElementById('longestWord').textContent = stats.longestWord;
        document.getElementById('shortestWord').textContent = stats.shortestWord;
        document.getElementById('syllableCount').textContent = stats.syllableCount.toLocaleString();
        
        // Tokens & time
        document.getElementById('tokenCount').textContent = stats.tokenCount.toLocaleString();
        document.getElementById('readingTime').textContent = stats.readingTime;
        document.getElementById('speakingTime').textContent = stats.speakingTime;
        
        // Readability
        document.getElementById('fleschReading').textContent = stats.fleschReading;
        document.getElementById('fleschGrade').textContent = stats.fleschGrade;
        
        // Character analysis
        document.getElementById('whitespaceCount').textContent = stats.whitespaceCount.toLocaleString();
        document.getElementById('punctuationCount').textContent = stats.punctuationCount.toLocaleString();
        document.getElementById('uppercaseCount').textContent = stats.uppercaseCount.toLocaleString();
        document.getElementById('lowercaseCount').textContent = stats.lowercaseCount.toLocaleString();
        document.getElementById('numberCount').textContent = stats.numberCount.toLocaleString();
        
        // Top words
        this.displayTopWords(stats.topWords);
        
        // Letter frequency
        this.displayLetterFrequency(stats.letterFreq);
    }

    displayTopWords(topWords) {
        const container = document.getElementById('topWords');
        container.innerHTML = '';
        
        if (topWords.length === 0) {
            container.innerHTML = '<div class="stat-item"><span class="stat-value">No words found</span></div>';
            return;
        }
        
        const maxCount = topWords[0][1];
        
        topWords.forEach(([word, count]) => {
            const item = document.createElement('div');
            item.className = 'word-item';
            
            const percentage = (count / maxCount) * 100;
            
            item.innerHTML = `
                <span class="word-text">${word}</span>
                <div class="word-bar">
                    <div class="word-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="word-count">${count}</span>
            `;
            
            container.appendChild(item);
        });
    }

    displayLetterFrequency(letterFreq) {
        const container = document.getElementById('letterFreq');
        container.innerHTML = '';
        
        if (letterFreq.length === 0) {
            container.innerHTML = '<div class="stat-item"><span class="stat-value">No letters found</span></div>';
            return;
        }
        
        letterFreq.forEach(([letter, count]) => {
            const item = document.createElement('div');
            item.className = 'letter-item';
            item.innerHTML = `
                <span class="letter-char">${letter.toUpperCase()}</span>
                <span class="letter-count">${count}</span>
            `;
            container.appendChild(item);
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TextAnalyzer();
});

// Console message
console.log('╔═══════════════════════════════════════╗');
console.log('║   RETRO TEXT ANALYZER v1.0           ║');
console.log('║   Keyboard Shortcuts:                ║');
console.log('║   Ctrl+Enter - Analyze text          ║');
console.log('╚═══════════════════════════════════════╝');
