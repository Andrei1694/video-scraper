const puppeteer = require("puppeteer");

const URL = "https://weightlessbe.substack.com/p/06-managementul-energiei";
const SCREENSHOT_PATH = "screenshot.png";

async function takeScreenshot(page, path) {
    await page.screenshot({ path, fullPage: true });
}

async function searchForText(page, text) {
    return await page.evaluate((text) => {
        const bodyText = document.body.textContent.toLowerCase();
        return bodyText.includes(text.toLowerCase());
    }, text);
}

async function login(page, cookie) {
    await page.setCookie(cookie);
    await page.goto(URL, { waitUntil: "domcontentloaded" });
}

async function playVideo(page) {
    await page.evaluate(async () => {
        const video = document.querySelector("video");
        if (video) {
            await video.requestFullscreen();
            await video.play();
        }
    });
}

async function startRecording(page, outputPath, duration) {
    console.log("Creating video");
    const recorder = await page.screencast({ path: "recording.webm" });
    // Wait for 3 seconds (adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await recorder.stop()
}

async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const COOKIE = {
        name: "substack.sid",
        value: "s:LK-2AEf_YdwMb8VxFz4zYvkugFMj2Tno.PCnYHBt6oqz4P9xacKpfWHWXEDnBvwnVkViUDN8PCYI",
        domain: "",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    };

    try {
        await page.goto(URL, { waitUntil: "domcontentloaded" });
        await takeScreenshot(page, SCREENSHOT_PATH);
        
        const searchText = "This post is for paid subscribers";
        const isSubscribePresent = await searchForText(page, searchText);
        
        if (isSubscribePresent) {
            console.log("Trying to login");
            await login(page, COOKIE);
            await page.waitForSelector("video");
            await takeScreenshot(page, SCREENSHOT_PATH);

            await playVideo(page);
            await startRecording(page, "recording.webm", 10000); // 10 seconds recording
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
}

main();
