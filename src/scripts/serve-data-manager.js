const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from the scripts directory
app.use(express.static(path.join(__dirname)));

// Serve the data manager HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'data-manager.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Data Manager Server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log(`\n📝 Open one of the URLs above in your browser to access the data manager.`);
  console.log(`\n💡 Make sure your ATOME backend server is running on http://localhost:5000`);
});
