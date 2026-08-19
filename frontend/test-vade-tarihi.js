const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Uygulamaya erişim sağla
    await page.goto('http://localhost:5177/dashboard/invoices', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Login kontrol et (uygulamanın login gerektirip gerektirmediğini kontrol et)
    const url = page.url();
    console.log('Current URL:', url);
    
    if (url.includes('/auth/login')) {
      console.log('Need to login');
      // Demo hesabı ile login
      await page.fill('[type="email"]', 'demo@axioninvoice.app');
      await page.fill('[type="password"]', 'Demo@12345');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    }
    
    // Faturalar listesine gidelim
    const invoiceLinks = await page.locator('a[href*="/dashboard/invoices/"]').first();
    if (invoiceLinks) {
      await invoiceLinks.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('No invoice found, taking screenshot');
      await page.screenshot({ path: 'error.png' });
    }
    
    // Başlık kısmında vade tarihini ara
    const header = await page.locator('h1').first();
    const headerText = await header.textContent();
    console.log('Invoice header:', headerText);
    
    // Vade Tarihi metni ara
    const dueDateText = await page.locator('text=Vade Tarihi').isVisible();
    console.log('Due date visible:', dueDateText);
    
    // Sayfanın bir bölümünün ekran görüntüsünü al
    await page.screenshot({ path: 'invoice-detail.png', fullPage: false });
    console.log('Screenshot taken');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
