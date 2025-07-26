document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('labelForm');
    const previewBtn = document.getElementById('previewBtn');
    const preview = document.getElementById('preview');
    const labelSizeSelect = document.getElementById('labelSize');
    const labelPreview = document.querySelector('.label-preview');
    
    // Set today's date as default for roast date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('roastDate').value = today;
    
    // Set storage date to 39 days from today as default
    const storageDefault = new Date();
    storageDefault.setDate(storageDefault.getDate() + 39);
    document.getElementById('storageDate').value = storageDefault.toISOString().split('T')[0];
    
    // Handle weight input combination
    function updateWeightValue() {
        const amount = document.getElementById('weightAmount').value;
        const unit = document.getElementById('weightUnit').value;
        document.querySelector('input[name="weight"]')?.remove();
        
        if (amount) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'weight';
            hiddenInput.value = `${amount}${unit}`;
            form.appendChild(hiddenInput);
        }
    }
    
    // Handle altitude input combination
    function updateAltitudeValue() {
        const amount = document.getElementById('altitudeAmount').value;
        const unit = document.getElementById('altitudeUnit').value;
        document.querySelector('input[name="altitude"]')?.remove();
        
        if (amount) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'altitude';
            hiddenInput.value = `${amount} ${unit}`;
            form.appendChild(hiddenInput);
        }
    }
    
    document.getElementById('weightAmount').addEventListener('input', updateWeightValue);
    document.getElementById('weightUnit').addEventListener('change', updateWeightValue);
    document.getElementById('altitudeAmount').addEventListener('input', updateAltitudeValue);
    document.getElementById('altitudeUnit').addEventListener('change', updateAltitudeValue);
    
    // Initialize preview with default label size
    updateLabelPreviewSize();
    
    // Handle label size changes
    labelSizeSelect.addEventListener('change', function() {
        updateLabelPreviewSize();
        if (preview.style.display !== 'none') {
            updatePreview();
        }
    });
    
    // Preview functionality
    previewBtn.addEventListener('click', function() {
        updatePreview();
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth' });
    });
    
    function updateLabelPreviewSize() {
        const selectedSize = labelSizeSelect.value;
        
        // Remove existing size classes
        labelPreview.classList.remove('standard', 'large', 'small');
        
        // Add the selected size class
        labelPreview.classList.add(selectedSize);
    }
    
    function updatePreview() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Format dates to match your label format
        const roastDate = new Date(data.roastDate);
        const storageDate = new Date(data.storageDate);
        const roastFormatted = `${roastDate.getMonth() + 1}/${roastDate.getDate()}/${roastDate.getFullYear()}`;
        const storageFormatted = `${storageDate.getMonth() + 1}/${storageDate.getDate()}/${storageDate.getFullYear()}`;
        
        // Update preview elements
        document.querySelector('.label-brand').textContent = data.roaster || 'Ilse';
        document.querySelector('.label-origin').textContent = data.origin || '';
        document.querySelector('.label-flavor-notes').textContent = data.flavorNotes || '';
        document.querySelector('.label-processing').textContent = data.processing || '';
        document.querySelector('.label-region').textContent = data.region || '';
        document.querySelector('.label-varietal').textContent = data.varietal || '';
        document.querySelector('.label-roast-date').textContent = roastFormatted || '';
        document.querySelector('.label-storage-date').textContent = storageFormatted || '';
        
        const weight = `${data.weightAmount || ''}${data.weightUnit || 'G'}`;
        document.querySelector('.label-weight').textContent = weight;
        
        const altitude = data.altitudeAmount ? `${data.altitudeAmount} ${data.altitudeUnit || 'masl'}` : '';
        document.querySelector('.label-altitude').textContent = altitude;
        
        // QR Code preview
        const qrElement = document.querySelector('.label-qr');
        if (data.qrUrl) {
            qrElement.textContent = 'QR';
            qrElement.title = `QR Code: ${data.qrUrl}`;
        } else {
            qrElement.textContent = '';
            qrElement.title = '';
        }
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        // Update weight and altitude before submission
        updateWeightValue();
        updateAltitudeValue();
        
        // Let the form submit normally to generate PDF
        // The server will handle the PDF generation and download
    });
    
    // Auto-update preview when form changes
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (preview.style.display !== 'none') {
                updatePreview();
            }
        });
    });
    
    // Auto-update storage date when roast date changes
    const roastDateInput = document.getElementById('roastDate');
    const storageDateInput = document.getElementById('storageDate');
    
    roastDateInput.addEventListener('change', function() {
        if (roastDateInput.value) {
            const roast = new Date(roastDateInput.value);
            const storage = new Date(roast);
            storage.setDate(storage.getDate() + 39); // Default 39 days
            storageDateInput.value = storage.toISOString().split('T')[0];
        }
    });
    
    // Form validation
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '#e1e1e1';
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
});