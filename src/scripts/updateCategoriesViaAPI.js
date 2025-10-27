// Simple script to update categories via API calls
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

// Category mapping for existing habits
const categoryUpdates = [
  { habitId: 'overcome-laziness', category: 'Mind & Wellbeing' },
  { habitId: 'keep-learning-and-adapting', category: 'Learning & Growth' },
  { habitId: 'build-healthy-habits', category: 'Health & Fitness' },
  { habitId: 'sugar-cut', category: 'Health & Fitness' }
];

async function updateCategories() {
  try {
    console.log('Updating habit categories via API...');
    
    for (const update of categoryUpdates) {
      try {
        const response = await fetch(`${API_BASE_URL}/habits/${update.habitId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: update.category
          })
        });
        
        if (response.ok) {
          console.log(`✅ Updated ${update.habitId}: ${update.category}`);
        } else {
          console.log(`❌ Failed to update ${update.habitId}: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${update.habitId}:`, error.message);
      }
    }
    
    console.log('Category update completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateCategories();
