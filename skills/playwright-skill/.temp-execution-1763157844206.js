const { chromium } = require('playwright');

// V1 Frontend URL (from CLAUDE.md)
const TARGET_URL = 'http://localhost:4200';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing V1 Frontend - Prize Fields Fix\n');

    // 1. Login
    console.log('1️⃣ Navigating to V1 login...');
    await page.goto(TARGET_URL);
    await page.waitForTimeout(2000);

    console.log('2️⃣ Logging in...');
    await page.fill('input[placeholder*="Usuario" i]', 'admin');
    await page.fill('input[placeholder*="Contraseña" i]', 'Admin123456');
    await page.click('button:has-text("INICIAR SESIÓN")');
    await page.waitForTimeout(3000);

    // 2. Navigate to edit banca (V1 uses /bancas/editar/:id)
    console.log('3️⃣ Navigating to edit banca #9...');
    await page.goto(`${TARGET_URL}/bancas/editar/9`);
    await page.waitForTimeout(3000);

    // 3. Find and click Premios & Comisiones tab
    console.log('4️⃣ Looking for Premios & Comisiones tab...');

    // Try multiple selectors
    const tabSelectors = [
      'a:has-text("Premios")',
      'a:has-text("Premios & Comisiones")',
      '[href*="premios"]',
      'text=Premios'
    ];

    let tabFound = false;
    for (const selector of tabSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          await element.click();
          console.log(`   ✅ Clicked tab with selector: ${selector}`);
          tabFound = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!tabFound) {
      console.log('   ⚠️  Could not find Premios & Comisiones tab');
      await page.screenshot({ path: '/tmp/v1-no-premios-tab.png', fullPage: true });
      console.log('   📸 Screenshot saved to /tmp/v1-no-premios-tab.png');
    }

    await page.waitForTimeout(3000);

    // 4. Count prize input fields
    console.log('\n5️⃣ Checking for prize input fields...');

    // Check for different input patterns
    const numberInputs = await page.locator('input[type="number"]').count();
    const textInputs = await page.locator('input[type="text"]').count();
    const allInputs = await page.locator('input').count();

    console.log(`   📝 Number inputs: ${numberInputs}`);
    console.log(`   📝 Text inputs: ${textInputs}`);
    console.log(`   📝 Total inputs: ${allInputs}`);

    // Check for bet type sections/accordions
    const accordions = await page.locator('.accordion-item, [class*="bet-type"], [class*="betType"]').count();
    console.log(`   📦 Accordion/BetType elements: ${accordions}`);

    // Check for "no fields" message
    const noFieldsMsg = await page.locator('text=/no hay campos/i, text=/sin configurar/i').count();
    console.log(`   ${noFieldsMsg > 0 ? '❌' : '✅'} "No hay campos" messages: ${noFieldsMsg}`);

    // 5. Look for specific bet types (like "Directo", "Palé")
    console.log('\n6️⃣ Looking for bet type names...');
    const directoExists = await page.locator('text=/directo/i').count();
    const paleExists = await page.locator('text=/palé/i').count();
    const tripletaExists = await page.locator('text=/tripleta/i').count();

    console.log(`   ${directoExists > 0 ? '✅' : '❌'} "Directo" found: ${directoExists}`);
    console.log(`   ${paleExists > 0 ? '✅' : '❌'} "Palé" found: ${paleExists}`);
    console.log(`   ${tripletaExists > 0 ? '✅' : '❌'} "Tripleta" found: ${tripletaExists}`);

    // 6. Take screenshot
    console.log('\n7️⃣ Taking screenshot...');
    await page.screenshot({ path: '/tmp/v1-premios-result.png', fullPage: true });
    console.log('   📸 Screenshot saved to /tmp/v1-premios-result.png');

    // 7. Get page state
    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyTextPreview: document.body.innerText.substring(0, 300)
      };
    });

    console.log('\n8️⃣ Page State:');
    console.log('   URL:', pageState.url);
    console.log('   Title:', pageState.title);

    // 8. Final verdict
    console.log('\n📊 VERDICT:');
    if (numberInputs >= 20 && directoExists > 0) {
      console.log('   ✅✅✅ V1 FIX IS WORKING! ✅✅✅');
      console.log(`   ✅ Found ${numberInputs} prize input fields`);
      console.log('   ✅ Bet types are visible');
    } else if (numberInputs > 0 && numberInputs < 20) {
      console.log('   ⚠️  PARTIAL FIX - Some inputs found but not all');
      console.log(`   ⚠️  Only ${numberInputs} inputs (expected 20+)`);
    } else {
      console.log('   ❌ FIX NOT WORKING - No prize inputs found');
      console.log('   ❌ Check screenshot for details');
    }

    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: '/tmp/v1-error.png', fullPage: true });
    console.log('📸 Error screenshot saved to /tmp/v1-error.png');
  } finally {
    await browser.close();
  }
})();
