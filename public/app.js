// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to upload section
function scrollToUpload() {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
        uploadSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const processingStatus = document.getElementById('processingStatus');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('drag-over');
    }, false);
});

// Handle dropped files
uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        handleFiles(files);
    }
});

// Handle file input change
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});

// Handle file selection
function handleFiles(files) {
    const file = files[0];

    if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
    }

    // Display file information
    fileName.textContent = file.name;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.style.display = 'block';

    // Store file for processing
    window.selectedFile = file;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Process video (simulated)
function processVideo() {
    if (!window.selectedFile) {
        alert('Please select a file first');
        return;
    }

    // Hide file info and show processing status
    fileInfo.style.display = 'none';
    processingStatus.style.display = 'block';

    // Simulate video processing
    setTimeout(() => {
        processingStatus.innerHTML = `
            <div class="success-icon" style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h3>Processing Complete!</h3>
            <p>Your video has been processed successfully.</p>
            <button class="btn btn-primary" onclick="resetUpload()" style="margin-top: 1rem;">
                Process Another Video
            </button>
        `;
    }, 3000);
}

// Reset upload form
function resetUpload() {
    fileInfo.style.display = 'none';
    processingStatus.style.display = 'none';
    fileInput.value = '';
    window.selectedFile = null;

    processingStatus.innerHTML = `
        <div class="loader"></div>
        <p>Processing your video...</p>
    `;
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards and pricing cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.feature-card, .pricing-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Server status:', data);
    } catch (error) {
        console.error('Error checking server health:', error);
    }
}

// Check server health on load
checkServerHealth();
