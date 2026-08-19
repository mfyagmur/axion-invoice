import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to app...");
    await page.goto("http://localhost:5177/dashboard/invoices", { waitUntil: "networkidle", timeout: 30000 });
    
    const url = page.url();
    console.log("Current URL:", url);
    
    // Login check
    if (url.includes("/auth/login")) {
      console.log("Logging in...");
      await page.fill("[type=\"email\"]", "demo@axioninvoice.app");
      await page.fill("[type=\"password\"]", "Demo@12345");
      await page.click("button[type=\"submit\"]");
      await page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 });
    }
    
    // Find and click first invoice
    console.log("Looking for invoices...");
    const firstInvoice = await page.locator("a[href*=\"/dashboard/invoices/\"]").first();
    if (firstInvoice) {
      const href = await firstInvoice.getAttribute("href");
      console.log("Found invoice link:", href);
      await firstInvoice.click();
      await page.waitForTimeout(3000);
    }
    
    // Check for due date text
    const dueDateVisible = await page.locator("text=Vade Tarihi").isVisible();
    console.log("Due date text visible:", dueDateVisible);
    
    // Get all text content from header
    const headerContent = await page.locator("h1").first().textContent();
    console.log("Header content:", headerContent);
    
    // Get the whole section
    const pageContent = await page.content();
    if (pageContent.includes("Vade Tarihi")) {
      console.log("✓ Vade Tarihi found in page content");
    } else {
      console.log("✗ Vade Tarihi NOT found in page content");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();
