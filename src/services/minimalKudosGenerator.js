const puppeteer = require('puppeteer');
const path = require('path');

class MinimalKudosGenerator {
  constructor() {
    this.width = 500;
    this.height = 500;
  }

  // Generate minimal kudos image using HTML/CSS
  async generateKudosImage(habitTitle, completionTime, username = 'User', habitImage = null) {
    try {
      console.log('🎨 MINIMAL KUDOS: Starting minimal kudos image generation');
      console.log('🎨 MINIMAL KUDOS: Parameters:', { habitTitle, completionTime, username, habitImage });
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width: this.width, height: this.height });
      
      // Generate HTML content
      const htmlContent = this.generateMinimalHTML(habitTitle);
      
      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: this.width, height: this.height }
      });
      
      await browser.close();
      
      console.log('🎨 MINIMAL KUDOS: Minimal kudos image generated successfully');
      console.log('🎨 MINIMAL KUDOS: Image size:', screenshot.length, 'bytes');
      return screenshot;
      
    } catch (error) {
      console.error('🎨 Error generating minimal kudos image:', error);
      throw error;
    }
  }

  // Generate minimal HTML content
  generateMinimalHTML(habitTitle) {
    const stoneImagePath = path.resolve(__dirname, '..', 'media', 'stones', 'stone.png');
    console.log('🎨 MINIMAL KUDOS: Stone image path:', stoneImagePath);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(stoneImagePath)) {
      console.error('🎨 MINIMAL KUDOS: Stone image not found at:', stoneImagePath);
      // Fallback to a different path or remove image
      return this.generateMinimalHTMLWithoutImage(habitTitle);
    }
    
    // Read image as base64
    let stoneImageBase64 = '';
    try {
      const imageBuffer = fs.readFileSync(stoneImagePath);
      stoneImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      console.log('🎨 MINIMAL KUDOS: Stone image loaded as base64, length:', stoneImageBase64.length);
    } catch (error) {
      console.error('🎨 MINIMAL KUDOS: Error reading stone image:', error);
      return this.generateMinimalHTMLWithoutImage(habitTitle);
    }
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kudos Card</title>
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
                background: #00394C;
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
            }
            
            .title {
                font-size: 48px;
                font-weight: 900;
                color: #1f2937;
                margin-bottom: 20px;
                line-height: 1.0;
                letter-spacing: -1px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .stone-image {
                width: 120px;
                height: 120px;
                margin-bottom: 20px;
                object-fit: contain;
            }
            
            .habit-title {
                font-size: 24px;
                font-weight: 600;
                color: #10B981;
                line-height: 1.3;
                max-width: 100%;
                word-wrap: break-word;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1 class="title">Kudos!</h1>
            <img src="${stoneImageBase64}" class="stone-image" alt="Stone" />
            <div class="habit-title">"${habitTitle}"</div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate HTML without stone image (fallback)
  generateMinimalHTMLWithoutImage(habitTitle) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kudos Card</title>
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
                background: #00394C;
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
                padding: 60px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .title {
                font-size: 48px;
                font-weight: 900;
                color: #1f2937;
                margin-bottom: 40px;
                line-height: 1.0;
                letter-spacing: -1px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .habit-title {
                font-size: 24px;
                font-weight: 600;
                color: #10B981;
                line-height: 1.3;
                max-width: 100%;
                word-wrap: break-word;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1 class="title">Kudos!</h1>
            <div class="habit-title">"${habitTitle}"</div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new MinimalKudosGenerator();
