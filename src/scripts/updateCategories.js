const mongoose = require('mongoose');
const Habit = require('../models/Habit');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Category mapping for existing habits
const categoryMapping = {
  'overcome-laziness': 'Mind & Wellbeing',
  'keep-learning-and-adapting': 'Learning & Growth', 
  'build-healthy-habits': 'Health & Fitness',
  'sugar-cut': 'Health & Fitness'
};

// Update categories for existing habits
const updateHabitCategories = async () => {
  try {
    console.log('Starting category update...');
    
    for (const [habitId, newCategory] of Object.entries(categoryMapping)) {
      const result = await Habit.findOneAndUpdate(
        { id: habitId },
        { category: newCategory },
        { new: true }
      );
      
      if (result) {
        console.log(`✅ Updated ${habitId}: ${result.category} -> ${newCategory}`);
      } else {
        console.log(`❌ Habit not found: ${habitId}`);
      }
    }
    
    console.log('Category update completed!');
    
    // Display all habits with their categories
    const allHabits = await Habit.find({}, 'id title category');
    console.log('\n📋 Current habits and categories:');
    allHabits.forEach(habit => {
      console.log(`  ${habit.id}: ${habit.title} (${habit.category})`);
    });
    
  } catch (error) {
    console.error('Error updating categories:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await updateHabitCategories();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main().catch(console.error);
