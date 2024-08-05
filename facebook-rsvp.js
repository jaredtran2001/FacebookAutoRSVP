const puppeteer = require('puppeteer');

(async () => {
    console.log("BOT STARTING ...")
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.facebook.com');

    const email = process.env.FB_EMAIL;
    const password = process.env.FB_PASSWORD;

    await page.type('#email', email);
    await page.type('#pass', password);
    await page.click('[name="login"]');

    await page.waitForNavigation();

    // Navigate to the events page
    await page.goto('https://www.facebook.com/events/invites');

    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds

    // Find the first event invitation that contains the text "invited you" and navigate to it
    const invitedYouLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.find(link => link.textContent.includes('invited you'))?.href;
    });

    if (invitedYouLink) {
        await page.goto(invitedYouLink);
    } else {
        console.log('No event invitations found.');
        await browser.close();
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.mouse.click(100, 200); 


    const h1Text = await page.evaluate(() => {
        const h1Element = document.querySelector('h1');
        return h1Element ? h1Element.textContent : null;
    });
    const url = page.url();
    console.log("Event found");
    if(h1Text && h1Text.includes("WVBA Wednesday")) {
        // Get the event id
        const regex = /events\/(\d+)\//;
        const match = url.match(regex);
        let eventId =""
        if (match && match[1]) {
            eventId = match[1];
            console.log('Event ID:', eventId);
        } else {
            console.log('Event ID not found in the URL.');
        }    

        await page.goto(`https://www.facebook.com/events/${eventId}/?active_tab=discussion`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
        await page.mouse.click(100, 200); 

        //Click Going so event won't show up anymore
        await page.click('div[aria-label="Going"]');

        // Get the post modal 
        await page.waitForSelector('div[aria-label="Add a Post"]');
        await page.click('div[aria-label="Add a Post"]');

        // Post a message in the event discussion
        const message = 'Spot plss!';
        await page.waitForSelector('div[aria-label="Write something..."]');
        await page.type('div[aria-label="Write something..."]', message);
        // await page.click('div[aria-label="Post"]');

    }

    await browser.close();
})();
