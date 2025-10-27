const Task = require('../models/Task');
const Habit = require('../models/Habit');

// @desc    Create multiple tasks (bulk)
// @route   POST /api/tasks/bulk
// @access  Public
const createBulkTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    
    console.log('🔍 Received tasks data:', JSON.stringify(tasks, null, 2));
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    // Validate each task and populate habit ObjectId
    const tasksWithHabitRefs = [];
    
    for (const task of tasks) {
      console.log('🔍 Validating task:', task.id);
      if (!task.id || !task.habitId || !task.title || !task.description) {
        console.error('❌ Task validation failed:', {
          id: task.id,
          habitId: task.habitId,
          title: task.title,
          description: task.description
        });
        return res.status(400).json({
          success: false,
          message: 'Each task must have id, habitId, title, and description'
        });
      }

      // Find the habit by habitId to get the ObjectId
      console.log(`🔍 Looking for habit with id: '${task.habitId}'`);
      const habit = await Habit.findOne({ id: task.habitId });
      if (!habit) {
        console.error(`❌ Habit with id '${task.habitId}' not found`);
        return res.status(400).json({
          success: false,
          message: `Habit with id '${task.habitId}' not found. Please create the habit first.`
        });
      }
      console.log(`✅ Found habit: ${habit.title} (${habit._id})`);

      // Add the habit ObjectId to the task
      tasksWithHabitRefs.push({
        ...task,
        habit: habit._id
      });
    }

    // Create tasks with proper habit references
    console.log('🔍 Creating tasks with data:', JSON.stringify(tasksWithHabitRefs, null, 2));
    
    // Use individual saves instead of insertMany to get better error handling
    const createdTasks = [];
    const errors = [];
    
    for (const taskData of tasksWithHabitRefs) {
      try {
        console.log('🔍 Attempting to create task:', taskData.id);
        const task = new Task(taskData);
        const savedTask = await task.save();
        createdTasks.push(savedTask);
        console.log('✅ Successfully created task:', savedTask.id, 'Days:', savedTask.day);
      } catch (error) {
        console.error('❌ Error creating task:', taskData.id, error.message);
        console.error('❌ Full error:', error);
        if (error.name === 'ValidationError') {
          console.error('Validation errors:', Object.keys(error.errors));
          errors.push(`Task ${taskData.id}: ${error.message}`);
        } else if (error.code === 11000) {
          console.error('Duplicate key error for task:', taskData.id);
          errors.push(`Task ${taskData.id}: Already exists (duplicate key)`);
        } else {
          errors.push(`Task ${taskData.id}: ${error.message}`);
        }
        // Continue with other tasks even if one fails
      }
    }
    
    if (errors.length > 0) {
      console.log('⚠️ Task creation errors:', errors);
    }

    console.log('Created tasks result:', createdTasks);

    const response = {
      success: true,
      message: `Successfully created ${createdTasks.length} tasks`,
      data: createdTasks
    };
    
    if (errors.length > 0) {
      response.warnings = errors;
      response.message += ` (${errors.length} tasks failed)`;
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Task creation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some tasks already exist (duplicate id)'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    
    next(error);
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getAllTasks = async (req, res, next) => {
  try {
    const { habitId, day, week } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (habitId) {
      filter.habitId = habitId;
    }
    
    if (day) {
      filter.day = parseInt(day);
    }
    
    if (week) {
      filter.week = parseInt(week);
    }

    const tasks = await Task.find(filter)
      .sort({ habitId: 1, week: 1, day: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ id: id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task by ID
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const task = await Task.findOneAndUpdate(
      { id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task by ID
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOneAndDelete({ id: id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBulkTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
