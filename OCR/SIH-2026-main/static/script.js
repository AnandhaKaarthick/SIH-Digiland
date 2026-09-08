// ===== PaddleOCR Web UI — Client Logic =====

const DOM = {
    uploadZone: () => document.getElementById('upload-zone'),
    fileInput: () => document.getElementById('file-input'),
    imagePreview: () => document.getElementById('image-preview'),
    previewImg: () => document.getElementById('preview-img'),
    removeBtn: () => document.getElementById('remove-btn'),
    ocrBtn: () => document.getElementById('ocr-btn'),
    ocrBtnText: () => document.getElementById('ocr-btn-text'),
    ocrBtnSpinner: () => document.getElementById('ocr-btn-spinner'),
    langSelect: () => document.getElementById('lang-select'),
    annotatedContainer: () => document.getElementById('annotated-container'),
    annotatedImg: () => document.getElementById('annotated-img'),
    statsBar: () => document.getElementById('stats-bar'),
    statLines: () => document.getElementById('stat-lines'),
    statAvgConf: () => document.getElementById('stat-avg-conf'),
    statTime: () => document.getElementById('stat-time'),
    copyAllBtn: () => document.getElementById('copy-all-btn'),
    textResults: () => document.getElementById('text-results'),
    resultsEmpty: () => document.getElementById('results-empty'),
    loadingOverlay: () => document.getElementById('loading-overlay'),
    toast: () => document.getElementById('toast'),
};

let selectedFile = null;

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    setupUploadZone();
    setupButtons();
});

// ===== Upload Zone =====
function setupUploadZone() {
    const zone = DOM.uploadZone();
    const input = DOM.fileInput();

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => handleFiles(e.target.files));

    // Drag and drop
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        showToast('Please upload an image file (JPG, PNG, BMP, etc.)', 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.previewImg().src = e.target.result;
        DOM.imagePreview().classList.add('active');
        DOM.ocrBtn().classList.add('visible');
        DOM.uploadZone().style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Clear previous results
    clearResults();
}

function setupButtons() {
    DOM.removeBtn().addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage();
    });

    DOM.ocrBtn().addEventListener('click', () => {
        if (selectedFile) runOCR();
    });

    DOM.copyAllBtn().addEventListener('click', copyAllText);
}

function removeImage() {
    selectedFile = null;
    DOM.fileInput().value = '';
    DOM.imagePreview().classList.remove('active');
    DOM.ocrBtn().classList.remove('visible');
    DOM.uploadZone().style.display = '';
    clearResults();
}

function clearResults() {
    DOM.annotatedContainer().classList.remove('active');
    DOM.statsBar().classList.remove('active');
    DOM.copyAllBtn().classList.remove('active');
    DOM.textResults().classList.remove('active');
    DOM.textResults().innerHTML = '';
    DOM.resultsEmpty().style.display = '';
}

// ===== OCR Processing =====
async function runOCR() {
    if (!selectedFile) return;

    const btn = DOM.ocrBtn();
    const btnText = DOM.ocrBtnText();
    const spinner = DOM.ocrBtnSpinner();
    const overlay = DOM.loadingOverlay();

    // Loading state
    btn.disabled = true;
    btnText.textContent = 'Processing...';
    spinner.classList.add('active');
    overlay.classList.add('active');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('lang', DOM.langSelect().value);

    try {
        const startTime = performance.now();
        const response = await fetch('/ocr', {
            method: 'POST',
            body: formData,
        });

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data, elapsed);
        showToast(`Detected ${data.results.length} text regions`, 'success');
    } catch (err) {
        console.error('OCR error:', err);
        showToast(`OCR failed: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Extract Text';
        spinner.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// ===== Display Results =====
function displayResults(data, elapsed) {
    const results = data.results || [];

    // Hide empty state
    DOM.resultsEmpty().style.display = 'none';

    // Annotated image
    if (data.annotated_image) {
        DOM.annotatedImg().src = 'data:image/png;base64,' + data.annotated_image;
        DOM.annotatedContainer().classList.add('active');
    }

    // Stats
    const avgConf = results.length > 0
        ? (results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100).toFixed(1)
        : 0;
    DOM.statLines().textContent = results.length;
    DOM.statAvgConf().textContent = avgConf + '%';
    DOM.statTime().textContent = elapsed + 's';
    DOM.statsBar().classList.add('active');

    // Copy button
    DOM.copyAllBtn().classList.add('active');

    // Text results
    const container = DOM.textResults();
    container.innerHTML = '';
    results.forEach((r, i) => {
        const conf = (r.confidence * 100).toFixed(1);
        const confClass = conf >= 90 ? 'high' : conf >= 70 ? 'medium' : 'low';
        const item = document.createElement('div');
        item.className = 'text-result-item';
        item.style.animationDelay = `${i * 0.06}s`;
        item.innerHTML = `
            <div class="result-text">${escapeHTML(r.text)}</div>
            <div class="result-meta">
                <span>${conf}%</span>
                <div class="confidence-bar">
                    <div class="fill ${confClass}" style="width: ${conf}%"></div>
                </div>
                <span>#${i + 1}</span>
            </div>
        `;
        container.appendChild(item);
    });
    container.classList.add('active');
}

// ===== Utilities =====
function copyAllText() {
    const items = document.querySelectorAll('.text-result-item .result-text');
    const text = Array.from(items).map(el => el.textContent).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        showToast('All text copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy text', 'error');
    });
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

let toastTimeout;
function showToast(message, type = 'success') {
    const toast = DOM.toast();
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
