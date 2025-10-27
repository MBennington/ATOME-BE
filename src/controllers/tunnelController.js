const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Store active tunnels
const activeTunnels = new Map();

const createTunnel = async (req, res) => {
  try {
    const { port = 5000 } = req.body;
    
    console.log('🌐 TUNNEL: Creating tunnel for port:', port);
    
    // Check if tunnel already exists for this port
    if (activeTunnels.has(port)) {
      const existingTunnel = activeTunnels.get(port);
      console.log('🌐 TUNNEL: Using existing tunnel:', existingTunnel.publicUrl);
      
      return res.json({
        success: true,
        publicUrl: existingTunnel.publicUrl,
        message: 'Using existing tunnel'
      });
    }
    
    // Create new tunnel using ngrok
    const ngrokProcess = spawn('ngrok', ['http', port.toString(), '--log=stdout'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let tunnelUrl = null;
    let output = '';
    
    ngrokProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // Parse ngrok output to find public URL
      const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
      if (urlMatch && !tunnelUrl) {
        tunnelUrl = urlMatch[0];
        console.log('🌐 TUNNEL: Public URL found:', tunnelUrl);
        
        // Store tunnel info
        activeTunnels.set(port, {
          publicUrl: tunnelUrl,
          process: ngrokProcess,
          createdAt: new Date()
        });
        
        // Send response
        res.json({
          success: true,
          publicUrl: tunnelUrl,
          message: 'Tunnel created successfully'
        });
      }
    });
    
    ngrokProcess.stderr.on('data', (data) => {
      console.log('🌐 TUNNEL: Error:', data.toString());
    });
    
    ngrokProcess.on('close', (code) => {
      console.log('🌐 TUNNEL: Process closed with code:', code);
      activeTunnels.delete(port);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!tunnelUrl) {
        ngrokProcess.kill();
        activeTunnels.delete(port);
        res.status(500).json({
          success: false,
          message: 'Tunnel creation timeout'
        });
      }
    }, 10000);
    
  } catch (error) {
    console.log('🌐 TUNNEL: Error creating tunnel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tunnel',
      error: error.message
    });
  }
};

const getTunnelStatus = (req, res) => {
  try {
    const tunnels = Array.from(activeTunnels.entries()).map(([port, tunnel]) => ({
      port,
      publicUrl: tunnel.publicUrl,
      createdAt: tunnel.createdAt
    }));
    
    res.json({
      success: true,
      tunnels,
      count: tunnels.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tunnel status',
      error: error.message
    });
  }
};

const closeTunnel = (req, res) => {
  try {
    const { port = 5000 } = req.params;
    
    if (activeTunnels.has(port)) {
      const tunnel = activeTunnels.get(port);
      tunnel.process.kill();
      activeTunnels.delete(port);
      
      res.json({
        success: true,
        message: 'Tunnel closed successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Tunnel not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to close tunnel',
      error: error.message
    });
  }
};

module.exports = {
  createTunnel,
  getTunnelStatus,
  closeTunnel
};
