const puppeteer = require("puppeteer");
const URL = "https://weightlessbe.substack.com/p/06-managementul-energiei";
const SCREENSHOT_PATH = "screenshot.png";

const { spawn } = require("child_process");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const COOKIE = {
    name: "substack.sid",
    value:
      "s:LK-2AEf_YdwMb8VxFz4zYvkugFMj2Tno.PCnYHBt6oqz4P9xacKpfWHWXEDnBvwnVkViUDN8PCYI",
    domain: "",
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };
  // Your scraping logic goes here
  // Navigate to the login page
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // Wait for some time for the page to load and render content

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  const searchText = "This post is for paid subscribers";
  //    Search for the text
  const isSubscribePresent = await page.evaluate((searchText) => {
    const bodyText = document.body.textContent.toLowerCase();
    console.log(document.body.textContent.toLowerCase());
    return bodyText.includes(searchText.toLowerCase());
  }, searchText);

  if (isSubscribePresent) {
    console.log("Trying to login");
    await page.setCookie(COOKIE);
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("video");
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    // Start playing the video
    await page.evaluate(async () => {
      const video = document.querySelector("video");
      if (video) {
        await video.requestFullscreen()
        await video.play();
      }
    });
    // Start recording


    const recorder = await page.screencast({ path: "recording.webm" });
    // Wait for 3 seconds (adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Stop recording
    ffmpeg.kill("SIGINT");

    console.log("Creating video");
    // Wait for the video file to be created
    await new Promise((resolve) => ffmpeg.on("exit", resolve));
    // Stop recording.
    await recorder.stop();
  }

  // console.log(isTextFound)
  await browser.close();
})();
