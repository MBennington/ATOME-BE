const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

class ImageGenerator {
  constructor() {
    this.canvasWidth = 500;
    this.canvasHeight = 500;
    this.margin = 40;
    this.contentWidth = this.canvasWidth - (this.margin * 2);
  }

  // Generate achievement image
  async generateAchievementImage(habitTitle, completionTime, username = 'User') {
    try {
      console.log('🎨 Generating achievement image for:', habitTitle);
      
      // Create canvas
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
      const ctx = canvas.getContext('2d');
      
      // Background gradient
      this.drawGradientBackground(ctx);
      
      // Main content
      this.drawTrophyIcon(ctx);
      this.drawTitle(ctx);
      this.drawHabitTitle(ctx, habitTitle);
      this.drawStats(ctx, completionTime);
      this.drawFooter(ctx, username);
      
      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');
      
      console.log('🎨 Achievement image generated successfully');
      return buffer;
      
    } catch (error) {
      console.error('🎨 Error generating achievement image:', error);
      throw error;
    }
  }

  // Draw white background with round corners
  drawGradientBackground(ctx) {
    const radius = 20;
    
    // Create rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(this.canvasWidth - radius, 0);
    ctx.quadraticCurveTo(this.canvasWidth, 0, this.canvasWidth, radius);
    ctx.lineTo(this.canvasWidth, this.canvasHeight - radius);
    ctx.quadraticCurveTo(this.canvasWidth, this.canvasHeight, this.canvasWidth - radius, this.canvasHeight);
    ctx.lineTo(radius, this.canvasHeight);
    ctx.quadraticCurveTo(0, this.canvasHeight, 0, this.canvasHeight - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw trophy icon
  drawTrophyIcon(ctx) {
    const centerX = this.canvasWidth / 2;
    const iconY = 100;
    const iconSize = 100;
    
    // Trophy circle background
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.beginPath();
    ctx.arc(centerX, iconY, iconSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Trophy border
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Trophy emoji (using text since we can't load custom icons easily)
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', centerX, iconY + 18);
  }

  // Draw main title
  drawTitle(ctx) {
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations!5', this.canvasWidth / 2, 220);
  }

  // Draw habit title
  drawHabitTitle(ctx, habitTitle) {
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    
    // Word wrap for long titles
    const words = habitTitle.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > this.contentWidth - 20) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Draw lines
    const startY = 270;
    const lineHeight = 28;
    
    lines.forEach((line, index) => {
      ctx.fillText(`"${line}"`, this.canvasWidth / 2, startY + (index * lineHeight));
    });
  }

  // Draw stats
  drawStats(ctx, completionTime) {
    const statsY = 320;
    
    // Time stat
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏰', this.canvasWidth / 2 - 80, statsY);
    ctx.fillText(completionTime ? `Completed in ${completionTime}` : 'Completed today', this.canvasWidth / 2, statsY);
    
    // Achievement stat
    ctx.fillStyle = '#10B981';
    ctx.fillText('⭐', this.canvasWidth / 2 - 80, statsY + 35);
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Amazing achievement!', this.canvasWidth / 2, statsY + 35);
  }

  // Draw footer
  drawFooter(ctx, username) {
    const footerY = this.canvasHeight - 60;
    
    // Decorative line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.margin, footerY - 15);
    ctx.lineTo(this.canvasWidth - this.margin, footerY - 15);
    ctx.stroke();
    
    // Footer text
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Shared by ${username}`, this.canvasWidth / 2, footerY);
    ctx.fillText('📱 ATOM Habit Tracker', this.canvasWidth / 2, footerY + 25);
  }

  // Generate shareable image with custom dimensions
  async generateCustomImage(habitTitle, completionTime, username, options = {}) {
    const {
      width = 500,
      height = 500,
      backgroundColor = '#10B981',
      textColor = '#ffffff',
      accentColor = '#FFD700'
    } = options;

    try {
      console.log('🎨 Generating custom achievement image:', { width, height, habitTitle });
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // Custom background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Custom content with new dimensions
      this.drawCustomContent(ctx, width, height, habitTitle, completionTime, username, textColor, accentColor);
      
      const buffer = canvas.toBuffer('image/png');
      console.log('🎨 Custom achievement image generated');
      return buffer;
      
    } catch (error) {
      console.error('🎨 Error generating custom image:', error);
      throw error;
    }
  }

  // Draw custom content
  drawCustomContent(ctx, width, height, habitTitle, completionTime, username, textColor, accentColor) {
    const centerX = width / 2;
    const margin = Math.min(width, height) * 0.1;
    
    // Trophy
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, height * 0.2, Math.min(width, height) * 0.08, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.min(width, height) * 0.05}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('🏆', centerX, height * 0.22);
    
    // Title
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.min(width, height) * 0.08}px Arial`;
    ctx.fillText('Congratulations!4', centerX, height * 0.35);
    
    // Habit title
    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.min(width, height) * 0.05}px Arial`;
    ctx.fillText(`"${habitTitle}"`, centerX, height * 0.45);
    
    // Stats
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.min(width, height) * 0.04}px Arial`;
    ctx.fillText(completionTime ? `Completed in ${completionTime}` : 'Completed today', centerX, height * 0.6);
    ctx.fillText('Amazing achievement!', centerX, height * 0.65);
    
    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${Math.min(width, height) * 0.035}px Arial`;
    ctx.fillText(`Shared by ${username}`, centerX, height * 0.85);
    ctx.fillText('📱 ATOM Habit Tracker', centerX, height * 0.9);
  }
}

module.exports = new ImageGenerator();
