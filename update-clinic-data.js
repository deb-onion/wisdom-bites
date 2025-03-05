/**
 * Update Clinic Data Script
 * 
 * This script updates all HTML files with the clinic data from index.html.
 * It adds the clinic-data script tag to all files and ensures the utility is loaded.
 */

const fs = require('fs');
const path = require('path');

// Define clinic data from index.html
const CLINIC_DATA = {
    name: "Wisdom Bites Dental Clinic",
    address: "1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata, West Bengal 700032, India",
    phone: "+91 123 456 7890",
    placeId: "ChIJEZw2uCNxAjoRrPHJvp1VC2g",
    position: {
        lat: 22.496391851463255,
        lng: 88.36915472944189
    },
    hours: [
        "Monday: 9:00 AM – 8:00 PM",
        "Tuesday: 9:00 AM – 8:00 PM",
        "Wednesday: 9:00 AM – 8:00 PM",
        "Thursday: 9:00 AM – 8:00 PM",
        "Friday: 9:00 AM – 8:00 PM",
        "Saturday: 9:00 AM – 6:00 PM",
        "Sunday: Closed"
    ],
    services: [
        "General Dentistry",
        "Cosmetic Dentistry",
        "Emergency Dental Care",
        "Dental Implants",
        "Root Canal Treatment",
        "Teeth Whitening"
    ]
};

// Format clinic data as JSON string
const clinicDataJson = JSON.stringify(CLINIC_DATA, null, 4);

// Clinic data script tag to add
const clinicDataScriptTag = `
    <!-- Clinic Data -->
    <script id="clinic-data" type="application/json">
    ${clinicDataJson}
    </script>
`;

// Clinic data utility script tag
const clinicDataUtilityScriptTag = `<script src="assets/js/utils/clinic-data.js"></script>`;
const clinicDataUtilityScriptTagServices = `<script src="../assets/js/utils/clinic-data.js"></script>`;

// Process all HTML files
function processHtmlFiles() {
    // Main directory HTML files
    const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
        updateHtmlFile(file, false);
    });

    // Services directory HTML files
    const servicesDir = './services';
    if (fs.existsSync(servicesDir)) {
        const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.html'));
        serviceFiles.forEach(file => {
            updateHtmlFile(path.join('services', file), true);
        });
    }

    console.log('All HTML files updated successfully!');
}

// Update a single HTML file
function updateHtmlFile(filePath, isServicePage) {
    console.log(`Processing ${filePath}...`);
    
    // Read file
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Skip index.html for clinic data script (already has it)
    if (filePath !== 'index.html') {
        // Add clinic data script tag if not already present
        if (!html.includes('id="clinic-data"')) {
            // Find position after Google Fonts and before the first style tag
            const insertPosition = html.indexOf('</head>');
            if (insertPosition !== -1) {
                html = html.slice(0, insertPosition) + clinicDataScriptTag + html.slice(insertPosition);
            }
        }
    }
    
    // Add clinic data utility script tag if not already present
    const utilityScriptTag = isServicePage ? clinicDataUtilityScriptTagServices : clinicDataUtilityScriptTag;
    if (!html.includes('utils/clinic-data.js')) {
        // Find first script tag reference
        const firstScriptPos = html.lastIndexOf('</body>');
        if (firstScriptPos !== -1) {
            html = html.slice(0, firstScriptPos) + '    ' + utilityScriptTag + '\n    ' + html.slice(firstScriptPos);
        }
    }
    
    // Update phone links
    html = html.replace(/href="tel:[^"]*"/g, `href="tel:${CLINIC_DATA.phone.replace(/\s+/g, '')}" data-clinic-phone`);
    
    // Update address spans
    html = html.replace(
        /(<span[^>]*>)\s*(\d+[^<]+(?:Road|Street|Avenue|Ave)[^<]+)<\/span>/gi, 
        `$1<span data-clinic-address>${CLINIC_DATA.address}</span>`
    );
    
    // Write file
    fs.writeFileSync(filePath, html);
    console.log(`Updated ${filePath}`);
}

// Create directories if they don't exist
function ensureDirectories() {
    const utilsDir = './assets/js/utils';
    
    if (!fs.existsSync('./assets/js/utils')) {
        fs.mkdirSync(utilsDir, { recursive: true });
        console.log('Created utils directory');
    }
}

// Main execution
try {
    ensureDirectories();
    processHtmlFiles();
} catch (error) {
    console.error('Error:', error.message);
} 