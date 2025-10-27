const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Habit = require('../models/Habit');
const Task = require('../models/Task');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Read JSON file
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    return null;
  }
};

// Clear existing data
const clearExistingData = async () => {
  try {
    console.log('🧹 Clearing existing habits and tasks...');
    await Task.deleteMany({});
    await Habit.deleteMany({});
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    throw error;
  }
};

// Migrate habits
const migrateHabits = async () => {
  try {
    console.log('📋 Migrating habits...');
    
    // Read habits index
    const habitsIndexPath = path.join(__dirname, '../../../data/habits-index.json');
    const habitsIndex = readJsonFile(habitsIndexPath);
    
    if (!habitsIndex || !habitsIndex.habits) {
      throw new Error('Invalid habits index file');
    }

    const habits = [];
    
    for (const habitData of habitsIndex.habits) {
      // Read detailed habit data
      const habitFilePath = path.join(__dirname, '../../../data/habits', habitData.dataFile);
      const detailedHabit = readJsonFile(habitFilePath);
      
      if (!detailedHabit) {
        console.warn(`⚠️ Skipping habit ${habitData.id} - could not read detailed data`);
        continue;
      }

      // Create habit document
      const habit = new Habit({
        id: habitData.id,
        title: habitData.title,
        description: habitData.description,
        duration: habitData.duration,
        category: habitData.category,
        difficulty: habitData.difficulty,
        image: habitData.image,
        isActive: true,
        isFeatured: true, // Mark all imported habits as featured
        sortOrder: habits.length
      });

      await habit.save();
      habits.push(habit);
      console.log(`✅ Migrated habit: ${habit.title}`);
    }

    console.log(`✅ Successfully migrated ${habits.length} habits`);
    return habits;
  } catch (error) {
    console.error('❌ Error migrating habits:', error.message);
    throw error;
  }
};

// Migrate tasks
const migrateTasks = async (habits) => {
  try {
    console.log('📝 Migrating tasks...');
    
    let totalTasks = 0;
    
    for (const habit of habits) {
      // Read detailed habit data to get tasks
      const habitFilePath = path.join(__dirname, '../../../data/habits', `${habit.id}.json`);
      const detailedHabit = readJsonFile(habitFilePath);
      
      if (!detailedHabit || !detailedHabit.tasks) {
        console.warn(`⚠️ No tasks found for habit ${habit.id}`);
        continue;
      }

      const tasks = [];
      
      for (const taskData of detailedHabit.tasks) {
        const task = new Task({
          habit: habit._id,
          habitId: habit.id,
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          day: taskData.day,
          category: taskData.category,
          estimatedTime: taskData.estimatedTime,
          executionTime: taskData.executionTime,
          notifyTime: taskData.notifyTime,
          week: taskData.week,
          weekGoal: taskData.weekGoal,
          isActive: true,
          sortOrder: tasks.length
        });

        await task.save();
        tasks.push(task);
        totalTasks++;
      }

      console.log(`✅ Migrated ${tasks.length} tasks for habit: ${habit.title}`);
    }

    console.log(`✅ Successfully migrated ${totalTasks} total tasks`);
  } catch (error) {
    console.error('❌ Error migrating tasks:', error.message);
    throw error;
  }
};

// Main migration function
const migrateData = async () => {
  try {
    console.log('🚀 Starting data migration...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearExistingData();
    
    // Migrate habits
    const habits = await migrateHabits();
    
    // Migrate tasks
    await migrateTasks(habits);
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Habits migrated: ${habits.length}`);
    
    // Get task count
    const taskCount = await Task.countDocuments();
    console.log(`   - Tasks migrated: ${taskCount}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
