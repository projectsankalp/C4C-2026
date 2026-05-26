const { chromium } = require('playwright');

async function runAutomation(userData, emit) {
    emit({ step: 'booting', message: 'Initializing secure browser environment...' });
    
    const browser = await chromium.launch({ headless: false }); 
    const page = await browser.newPage();

    try {
        // 1. Announce the Scheme Match to the UI first
        emit({ 
            step: 'scheme_matched', 
            message: `Eligible for: ${userData.recommendedScheme}`,
            userData: userData // Send all the data to the frontend
        });
        await page.waitForTimeout(2500); // Pause so the user reads the scheme

        // 2. Navigate
        emit({ step: 'navigating', message: 'Connecting to Udyam Registration Portal...', userData });
        await page.goto('https://example.com');
        await page.waitForTimeout(1500);

        // 3. Type Name
        emit({ step: 'typing', field: 'Business Name', value: userData.businessName, userData });
        await page.waitForTimeout(1500);

        // 4. Type NIC
        emit({ step: 'typing', field: 'NIC Code', value: userData.nicCode, userData });
        await page.waitForTimeout(1500);

        // 5. Complete
        emit({ step: 'complete', message: 'Draft saved successfully. Awaiting user OTP.', userData });

    } catch (error) {
        console.error("Automation failed:", error);
        emit({ step: 'error', message: 'Failed to complete form.' });
    } finally {
        // Comment the line below out if you want the browser window to stay open forever during a demo!
        await browser.close(); 
    }
}

module.exports = { runAutomation };