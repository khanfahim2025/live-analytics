// Cleanup script to remove test data
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'siteCounts.json');

// Read current data
let siteCounts = {};
try {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        if (data.trim()) {
            siteCounts = JSON.parse(data);
        }
    }
} catch (error) {
    console.error('Error reading data file:', error);
}

// Remove test websites
const testGtmIds = [
    'GTM-HOMESFY-VALIDATION-TEST',
    'GTM-VALIDATION-FAILURE-TEST', 
    'GTM-INTERNATIONAL-TEST',
    'GTM-THANKYOU-TEST',
    'GTM-LEAD-DETECTION-TEST',
    'GTM-VALIDATION-TEST',
    'GTM-TEST-LEAD'
];

console.log('Before cleanup:', Object.keys(siteCounts));

// Remove test GTM IDs
testGtmIds.forEach(gtmId => {
    if (siteCounts[gtmId]) {
        delete siteCounts[gtmId];
        console.log(`Removed test website: ${gtmId}`);
    }
});

console.log('After cleanup:', Object.keys(siteCounts));

// Write back to file
try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(siteCounts, null, 2));
    console.log('✅ Test data cleaned up successfully');
} catch (error) {
    console.error('Error writing data file:', error);
}
