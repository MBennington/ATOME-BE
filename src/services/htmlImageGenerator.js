const puppeteer = require('puppeteer');
const path = require('path');

class HTMLImageGenerator {
  constructor() {
    this.width = 500;
    this.height = 500;
  }

  // Generate achievement image using HTML/CSS
  async generateAchievementImage(habitTitle, completionTime, username = 'User', habitImage = null) {
    try {
      console.log('🎨 Generating HTML-based achievement image for:', habitTitle);
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width: this.width, height: this.height });
      
      // Generate HTML content
      const htmlContent = this.generateHTML(habitTitle, completionTime, username, habitImage);
      
      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: this.width, height: this.height }
      });
      
      await browser.close();
      
      console.log('🎨 HTML-based achievement image generated successfully');
      return screenshot;
      
    } catch (error) {
      console.error('🎨 Error generating HTML achievement image:', error);
      throw error;
    }
  }

  // Generate HTML content
  generateHTML(habitTitle, completionTime, username, habitImage = null) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Card</title>
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
                background: linear-gradient(90deg, #10B981, #059669, #047857);
                border-radius: 32px 32px 0 0;
            }
            
            .habit-image {
                width: 80px;
                height: 80px;
                border-radius: 20px;
                object-fit: cover;
                margin-bottom: 20px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                border: 3px solid #f3f4f6;
            }
            
            .trophy-container {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #10B981, #059669);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
            }
            
            .trophy {
                font-size: 40px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .title {
                font-size: 28px;
                font-weight: 800;
                color: #1f2937;
                margin-bottom: 12px;
                line-height: 1.1;
                letter-spacing: -0.5px;
            }
            
            .habit-title {
                font-size: 18px;
                font-weight: 600;
                color: #10B981;
                margin-bottom: 20px;
                line-height: 1.3;
                max-width: 100%;
                word-wrap: break-word;
                padding: 0 10px;
            }
            
            .stats {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 32px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 16px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .stat-icon {
                font-size: 18px;
            }
            
            .footer {
                position: absolute;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
            }
            
            .footer-line {
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, #10B981, #059669);
                margin: 0 auto 12px;
                border-radius: 1px;
            }
            
            .footer-text {
                font-size: 14px;
                color: #9ca3af;
                margin-bottom: 4px;
            }
            
            .app-name {
                font-size: 12px;
                color: #d1d5db;
                font-weight: 500;
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
            <div class="trophy-container">
                <div class="trophy">🏆</div>
            </div>
            
            <h1 class="title">Congratulations!7</h1>
            
            <div class="habit-title">"${habitTitle}"</div>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-icon">⏰</span>
                    <span>${completionTime ? `Completed in ${completionTime}` : 'Completed today'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">⭐</span>
                    <span>Amazing achievement!</span>
                </div>
            </div>
            
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

  // Generate custom image with HTML/CSS
  async generateCustomImage(habitTitle, completionTime, username, options = {}) {
    const {
      width = 500,
      height = 500,
      backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardColor = '#ffffff',
      primaryColor = '#10B981',
      textColor = '#1f2937'
    } = options;

    try {
      console.log('🎨 Generating custom HTML achievement image:', { width, height, habitTitle });
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width, height });
      
      const htmlContent = this.generateCustomHTML(habitTitle, completionTime, username, {
        width,
        height,
        backgroundColor,
        cardColor,
        primaryColor,
        textColor
      });
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height }
      });
      
      await browser.close();
      
      console.log('🎨 Custom HTML achievement image generated');
      return screenshot;
      
    } catch (error) {
      console.error('🎨 Error generating custom HTML image:', error);
      throw error;
    }
  }

  // Generate custom HTML with options
  generateCustomHTML(habitTitle, completionTime, username, options) {
    const { width, height, backgroundColor, cardColor, primaryColor, textColor } = options;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Achievement Card</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                width: ${width}px;
                height: ${height}px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                border-radius: 24px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd);
            }
            
            .trophy-container {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;
                box-shadow: 0 8px 16px ${primaryColor}30;
            }
            
            .trophy {
                font-size: 48px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .title {
                font-size: 32px;
                font-weight: 700;
                color: ${textColor};
                margin-bottom: 16px;
                line-height: 1.2;
            }
            
            .habit-title {
                font-size: 20px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 24px;
                line-height: 1.4;
                max-width: 100%;
                word-wrap: break-word;
            }
            
            .stats {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 32px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 16px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .stat-icon {
                font-size: 18px;
            }
            
            .footer {
                position: absolute;
                bottom: 20px;
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
                font-size: 14px;
                color: #9ca3af;
                margin-bottom: 4px;
            }
            
            .app-name {
                font-size: 12px;
                color: #d1d5db;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="trophy-container">
                <div class="trophy">🏆</div>
            </div>
            
            <h1 class="title">Congratulations!6</h1>
            
            <div class="habit-title">"${habitTitle}"</div>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-icon">⏰</span>
                    <span>${completionTime ? `Completed in ${completionTime}` : 'Completed today'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">⭐</span>
                    <span>Amazing achievement!</span>
                </div>
            </div>
            
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

module.exports = new HTMLImageGenerator();
