const puppeteer = require('puppeteer');
const path = require('path');

class ModernImageGenerator {
  constructor() {
    this.width = 500;
    this.height = 500;
  }

  // Resolve an image URL into an embeddable data URL (base64). Returns null on failure.
  async resolveImageDataUrl(possibleUrl) {
    try {
      if (!possibleUrl || typeof possibleUrl !== 'string') {
        return null;
      }
      // If already a data URL, return as-is
      if (possibleUrl.startsWith('data:image/')) {
        return possibleUrl;
      }
      // Only attempt fetching http/https URLs
      if (!possibleUrl.startsWith('http://') && !possibleUrl.startsWith('https://')) {
        return null;
      }

      const response = await fetch(possibleUrl);
      if (!response.ok) {
        console.warn('🎨 MODERN GENERATOR: Failed to fetch habit image. Status:', response.status);
        return null;
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;
      return dataUrl;
    } catch (error) {
      console.warn('🎨 MODERN GENERATOR: Error resolving image data URL:', error.message);
      return null;
    }
  }

  // Generate modern achievement image using HTML/CSS
  async generateAchievementImage(habitTitle, completionTime, username = 'User', habitImage = null) {
    try {
      console.log('🎨 MODERN GENERATOR: Starting HTML-based achievement image generation');
      console.log('🎨 MODERN GENERATOR: Parameters:', { habitTitle, completionTime, username, habitImage });
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width: this.width, height: this.height });
      
      // Resolve habit image to embeddable data URL for reliable rendering
      const habitImageDataUrl = await this.resolveImageDataUrl(habitImage);

      // Generate HTML content
      const htmlContent = this.generateModernHTML(habitTitle, completionTime, username, habitImageDataUrl);
      
      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // If an image was provided, wait for it to be fully decoded (best-effort)
      if (habitImageDataUrl) {
        try {
          await page.waitForSelector('img.habit-image', { timeout: 2000 });
          await page.evaluate(async () => {
            const img = document.querySelector('img.habit-image');
            if (img && img.decode) {
              try { await img.decode(); } catch (_) {}
            }
          });
        } catch (_) {
          // Non-fatal: continue even if wait fails
        }
      }
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: this.width, height: this.height }
      });
      
      await browser.close();
      
      console.log('🎨 MODERN GENERATOR: HTML-based achievement image generated successfully');
      console.log('🎨 MODERN GENERATOR: Image size:', screenshot.length, 'bytes');
      return screenshot;
      
    } catch (error) {
      console.error('🎨 Error generating modern HTML achievement image:', error);
      throw error;
    }
  }

  // Generate modern HTML content
  generateModernHTML(habitTitle, completionTime, username, habitImageDataUrl = null) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Modern Achievement Card</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                width: 500px;
                height: 500px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .card {
                width: 460px;
                height: 460px;
                background: white;
                border-radius: 24px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(20px);
            }
            
            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #10B981, #059669, #047857);
                border-radius: 24px 24px 0 0;
            }
            
            .habit-image {
                width: 120px;
                height: 90px;
                border-radius: 16px;
                object-fit: cover;
                margin-bottom: 24px;
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .trophy-container {
                width: 120px;
                height: 90px;
                background: linear-gradient(135deg, #10B981, #059669);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;
                box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
            }
            
            .trophy {
                font-size: 40px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .title {
                font-size: 32px;
                font-weight: 900;
                color: #1f2937;
                margin-bottom: 16px;
                line-height: 1.0;
                letter-spacing: -0.8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .habit-title {
                font-size: 20px;
                font-weight: 700;
                color: #10B981;
                margin-bottom: 32px;
                line-height: 1.2;
                max-width: 100%;
                word-wrap: break-word;
                padding: 0 20px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 24px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
                background: #f9fafb;
                padding: 8px 16px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }
            
            .stat-icon {
                font-size: 16px;
            }
            
            .footer {
                position: absolute;
                bottom: 24px;
                left: 0;
                right: 0;
                text-align: center;
            }
            
            .footer-line {
                width: 80px;
                height: 3px;
                background: linear-gradient(90deg, #10B981, #059669);
                margin: 0 auto 16px;
                border-radius: 2px;
            }
            
            .footer-text {
                font-size: 15px;
                color: #6b7280;
                margin-bottom: 6px;
                font-weight: 500;
            }
            
            .app-name {
                font-size: 13px;
                color: #9ca3af;
                font-weight: 600;
            }
            
            .celebration {
                position: absolute;
                top: -10px;
                right: -10px;
                font-size: 24px;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
        </style>
    </head>
    <body>
        <div class="card">
            ${habitImageDataUrl ? `<img src="${habitImageDataUrl}" alt="Habit" class="habit-image" />` : `<div class="trophy-container">
                <div class="trophy">🏆</div>
            </div>`}
            
            <h1 class="title">Kudos!</h1>
            
            <div class="habit-title">"${habitTitle}"</div>
            
            
            <div class="footer">
                <div class="footer-line"></div>
                <div class="footer-text">Shared by ${username}</div>
                <div class="app-name">📱 ATOM Habit Tracker</div>
            </div>
            
            <div class="celebration">🎉</div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate custom modern image
  async generateCustomImage(habitTitle, completionTime, username, options = {}) {
    const {
      width = 500,
      height = 500,
      backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardColor = '#ffffff',
      primaryColor = '#10B981',
      textColor = '#1f2937',
      habitImage = null
    } = options;

    try {
      console.log('🎨 Generating custom modern HTML achievement image:', { width, height, habitTitle });
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width, height });

      // Resolve custom habit image to data URL if provided
      const habitImageDataUrl = await this.resolveImageDataUrl(habitImage);

      const htmlContent = this.generateCustomModernHTML(habitTitle, completionTime, username, {
        width,
        height,
        backgroundColor,
        cardColor,
        primaryColor,
        textColor,
        habitImage: habitImageDataUrl
      });
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      if (habitImageDataUrl) {
        try {
          await page.waitForSelector('img.habit-image', { timeout: 2000 });
          await page.evaluate(async () => {
            const img = document.querySelector('img.habit-image');
            if (img && img.decode) {
              try { await img.decode(); } catch (_) {}
            }
          });
        } catch (_) {}
      }
      
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height }
      });
      
      await browser.close();
      
      console.log('🎨 Custom modern HTML achievement image generated');
      return screenshot;
      
    } catch (error) {
      console.error('🎨 Error generating custom modern HTML image:', error);
      throw error;
    }
  }

  // Generate custom modern HTML with options
  generateCustomModernHTML(habitTitle, completionTime, username, options) {
    const { width, height, backgroundColor, cardColor, primaryColor, textColor, habitImage } = options;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Modern Achievement Card</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                width: ${width}px;
                height: ${height}px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
                background: ${backgroundColor};
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .card {
                width: ${width - 40}px;
                height: ${height - 40}px;
                background: ${cardColor};
                border-radius: 32px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 32px;
                text-align: center;
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 6px;
                background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd);
                border-radius: 32px 32px 0 0;
            }
            
            .habit-image {
                width: 120px;
                height: 90px;
                border-radius: 16px;
                object-fit: cover;
                margin-bottom: 24px;
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .trophy-container {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                box-shadow: 0 8px 20px ${primaryColor}30;
            }
            
            .trophy {
                font-size: 40px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .title {
                font-size: 28px;
                font-weight: 800;
                color: ${textColor};
                margin-bottom: 12px;
                line-height: 1.1;
                letter-spacing: -0.5px;
            }
            
            .habit-title {
                font-size: 18px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 20px;
                line-height: 1.3;
                max-width: 100%;
                word-wrap: break-word;
                padding: 0 10px;
            }
            
            .stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 24px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
                background: #f9fafb;
                padding: 8px 16px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }
            
            .stat-icon {
                font-size: 16px;
            }
            
            .footer {
                position: absolute;
                bottom: 24px;
                left: 0;
                right: 0;
                text-align: center;
            }
            
            .footer-line {
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd);
                margin: 0 auto 12px;
                border-radius: 1px;
            }
            
            .footer-text {
                font-size: 15px;
                color: #6b7280;
                margin-bottom: 6px;
                font-weight: 500;
            }
            
            .app-name {
                font-size: 13px;
                color: #9ca3af;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="card">
            ${habitImage ? `<img src="${habitImage}" alt="Habit" class="habit-image" />` : `<div class="trophy-container">
                <div class="trophy">🏆</div>
            </div>`}
            
            <h1 class="title">Kudos!</h1>
            
            <div class="habit-title">"${habitTitle}"</div>
            
            
            <div class="footer">
                <div class="footer-line"></div>
                <div class="footer-text">Shared by ${username}</div>
                <div class="app-name">📱 ATOM Habit Tracker</div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new ModernImageGenerator();
