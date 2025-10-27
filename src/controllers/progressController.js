const User = require('../models/User');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const UserProgress = require('../models/UserProgress');

// @desc    Get user's active habits with progress
// @route   GET /api/progress/active-habits
// @access  Private
const getActiveHabits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activeHabits.habit', 'id title description duration category difficulty image')
      .select('activeHabits');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeHabits = user.activeHabits.filter(habit => habit.isActive);

    // Get today's task for each active habit
    const habitsWithTodayTask = await Promise.all(
      activeHabits.map(async (activeHabit) => {
        const todayTask = user.getTodayTask(activeHabit.habitId);
        const habitProgress = user.getHabitProgress(activeHabit.habitId);
        
        // Get the actual task details from the database
        let taskDetails = null;
        if (todayTask && todayTask.day) {
          try {
            const tasks = await Task.find({ 
              habitId: activeHabit.habitId, 
              day: { $in: [todayTask.day] }
            }).sort({ sortOrder: 1 });
            taskDetails = tasks; // Now returns array of tasks for the day
          } catch (error) {
            console.error('Error fetching task details:', error);
          }
        }

        return {
          ...activeHabit.toObject(),
          habit: activeHabit.habit,
          todayTask: {
            ...todayTask,
            taskDetails
          },
          progress: habitProgress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: habitsWithTodayTask.length,
      data: habitsWithTodayTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a new habit
// @route   POST /api/progress/start-habit
// @access  Private
const startHabit = async (req, res, next) => {
  try {
    const { habitId } = req.body;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    // Find the habit in the database
    const habit = await Habit.findOne({ id: habitId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      await user.addActiveHabit(habitId, habit._id);
      
      res.status(201).json({
        success: true,
        message: 'Habit started successfully',
        data: {
          habitId,
          startDate: new Date(),
          currentDay: 1
        }
      });
    } catch (error) {
      if (error.message === 'Habit is already active') {
        return res.status(400).json({
          success: false,
          message: 'Habit is already active'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Stop an active habit
// @route   POST /api/progress/stop-habit
// @access  Private
const stopHabit = async (req, res, next) => {
  try {
    const { habitId } = req.body;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      await user.removeActiveHabit(habitId);
      
      res.status(200).json({
        success: true,
        message: 'Habit stopped successfully'
      });
    } catch (error) {
      if (error.message === 'Active habit not found') {
        return res.status(404).json({
          success: false,
          message: 'Active habit not found'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a task for a specific day
// @route   POST /api/progress/complete-task
// @access  Private
const completeTask = async (req, res, next) => {
  try {
    const { habitId, day, taskId, completionTime, notes, rating } = req.body;

    if (!habitId || !day) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID and day are required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      const result = await user.completeTask(habitId, day, {
        taskId,
        completionTime,
        notes,
        rating
      });

      // Extract the updated user and completion status
      const updatedUser = result.user;
      const isHabitCompleted = result.isHabitCompleted;
      
      const updatedProgress = updatedUser.getHabitProgress(habitId);
      
      // Get the active habit for logging
      const activeHabit = updatedUser.activeHabits.find(habit => 
        habit.habitId === habitId && habit.isActive
      );
      
      console.log('🔍 Backend completion check:', {
        habitId,
        day,
        isHabitCompleted,
        activeHabit: activeHabit ? {
          isCompleted: activeHabit.isCompleted,
          completedAt: activeHabit.completedAt,
          totalCompletedTasks: activeHabit.totalCompletedTasks,
          completedDays: activeHabit.completedDays.length
        } : null
      });

      res.status(200).json({
        success: true,
        message: 'Task completed successfully',
        data: {
          habitId,
          day,
          completedAt: new Date(),
          progress: updatedProgress,
          isHabitCompleted
        }
      });
    } catch (error) {
      if (error.message === 'Active habit not found') {
        return res.status(404).json({
          success: false,
          message: 'Active habit not found'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Uncomplete a task for a specific day
// @route   POST /api/progress/uncomplete-task
// @access  Private
const uncompleteTask = async (req, res, next) => {
  try {
    const { habitId, day, taskId } = req.body;

    if (!habitId || !day) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID and day are required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      await user.uncompleteTask(habitId, day, taskId);

      const updatedProgress = user.getHabitProgress(habitId);

      res.status(200).json({
        success: true,
        message: 'Task uncompleted successfully',
        data: {
          habitId,
          day,
          progress: updatedProgress
        }
      });
    } catch (error) {
      if (error.message === 'Active habit not found') {
        return res.status(404).json({
          success: false,
          message: 'Active habit not found'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a habit to start from day 1
// @route   POST /api/progress/reset-habit
// @access  Private
const resetHabit = async (req, res, next) => {
  try {
    const { habitId } = req.body;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      await user.resetHabit(habitId);

      const updatedProgress = user.getHabitProgress(habitId);

      res.status(200).json({
        success: true,
        message: 'Habit reset successfully',
        data: {
          habitId,
          startDate: new Date(),
          currentDay: 1,
          progress: updatedProgress
        }
      });
    } catch (error) {
      if (error.message === 'Active habit not found') {
        return res.status(404).json({
          success: false,
          message: 'Active habit not found'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit progress details
// @route   GET /api/progress/habit/:habitId
// @access  Private
const getHabitProgress = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const user = await User.findById(req.user.id)
      .populate('activeHabits.habit', 'id title description duration category difficulty image');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeHabit = user.activeHabits.find(habit => 
      habit.habitId === habitId && habit.isActive
    );

    if (!activeHabit) {
      return res.status(404).json({
        success: false,
        message: 'Active habit not found'
      });
    }

    const progress = user.getHabitProgress(habitId);
    const todayTask = user.getTodayTask(habitId);

    // Get all tasks for this habit
    const tasks = await Task.find({ habitId })
      .sort({ day: 1 });

    // Get completion status for each task
    const tasksWithProgress = tasks.map(task => {
      // For tasks with days array, check if any of the days are completed
      let completedDays = [];
      if (Array.isArray(task.day)) {
        completedDays = activeHabit.completedDays.filter(d => 
          task.day.includes(d.day) && d.taskId === task.id
        );
      } else {
        // Backward compatibility for single day tasks
        completedDays = activeHabit.completedDays.filter(d => 
          d.day === task.day && d.taskId === task.id
        );
      }
      
      return {
        ...task.toObject(),
        isCompleted: completedDays.length > 0,
        completedDays: completedDays,
        completedAt: completedDays[0]?.completedAt || null,
        completionTime: completedDays[0]?.completionTime || null,
        notes: completedDays[0]?.notes || '',
        rating: completedDays[0]?.rating || null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        habit: activeHabit.habit,
        progress,
        todayTask,
        tasks: tasksWithProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's comprehensive statistics including completed, involved, and given up tasks
// @route   GET /api/progress/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    console.log('🔍 NEW getUserStats function called - comprehensive statistics');
    const user = await User.findById(req.user.id)
      .populate('activeHabits.habit', 'id title description duration category difficulty image');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Separate habits by status
    const activeHabits = user.activeHabits.filter(habit => habit.isActive);
    const completedHabits = user.activeHabits.filter(habit => habit.isCompleted);
    const givenUpHabits = user.activeHabits.filter(habit => !habit.isActive && !habit.isCompleted);
    
    // Calculate overall statistics
    const totalActiveHabits = activeHabits.length;
    const totalCompletedHabits = completedHabits.length;
    const totalGivenUpHabits = givenUpHabits.length;
    const totalHabits = totalActiveHabits + totalCompletedHabits + totalGivenUpHabits;
    
    const totalCompletedTasks = user.activeHabits.reduce((sum, habit) => sum + habit.totalCompletedTasks, 0);
    const totalStreak = user.activeHabits.reduce((sum, habit) => sum + habit.streak, 0);
    const longestStreak = Math.max(...user.activeHabits.map(habit => habit.longestStreak), 0);
    
    const averageProgress = totalActiveHabits > 0 
      ? Math.round(activeHabits.reduce((sum, habit) => sum + habit.progressPercentage, 0) / totalActiveHabits)
      : 0;

    // Calculate completion rate
    const completionRate = totalHabits > 0 
      ? Math.round((totalCompletedHabits / totalHabits) * 100)
      : 0;

    // Get detailed habit information
    const activeHabitsWithDetails = await Promise.all(
      activeHabits.map(async (habit) => {
        const habitProgress = user.getHabitProgress(habit.habitId);
        return {
          habitId: habit.habitId,
          title: habit.habit?.title || 'Unknown',
          description: habit.habit?.description || '',
          duration: habit.habit?.duration || 0,
          category: habit.habit?.category || 'general',
          difficulty: habit.habit?.difficulty || 'beginner',
          image: habit.habit?.image || null,
          progressPercentage: habit.progressPercentage,
          streak: habit.streak,
          longestStreak: habit.longestStreak,
          totalCompletedTasks: habit.totalCompletedTasks,
          startDate: habit.startDate,
          lastCompletedDate: habit.lastCompletedDate,
          currentDay: habit.currentDay,
          status: 'active',
          completedDays: habit.completedDays.length,
          progress: habitProgress
        };
      })
    );

    const completedHabitsWithDetails = await Promise.all(
      completedHabits.map(async (habit) => {
        const habitProgress = user.getHabitProgress(habit.habitId);
        return {
          habitId: habit.habitId,
          title: habit.habit?.title || 'Unknown',
          description: habit.habit?.description || '',
          duration: habit.habit?.duration || 0,
          category: habit.habit?.category || 'general',
          difficulty: habit.habit?.difficulty || 'beginner',
          image: habit.habit?.image || null,
          progressPercentage: 100,
          streak: habit.streak,
          longestStreak: habit.longestStreak,
          totalCompletedTasks: habit.totalCompletedTasks,
          startDate: habit.startDate,
          completedAt: habit.completedAt,
          lastCompletedDate: habit.lastCompletedDate,
          status: 'completed',
          completedDays: habit.completedDays.length,
          progress: habitProgress
        };
      })
    );

    const givenUpHabitsWithDetails = await Promise.all(
      givenUpHabits.map(async (habit) => {
        const habitProgress = user.getHabitProgress(habit.habitId);
        return {
      habitId: habit.habitId,
      title: habit.habit?.title || 'Unknown',
          description: habit.habit?.description || '',
      duration: habit.habit?.duration || 0,
          category: habit.habit?.category || 'general',
          difficulty: habit.habit?.difficulty || 'beginner',
          image: habit.habit?.image || null,
      progressPercentage: habit.progressPercentage,
      streak: habit.streak,
          longestStreak: habit.longestStreak,
      totalCompletedTasks: habit.totalCompletedTasks,
      startDate: habit.startDate,
          lastCompletedDate: habit.lastCompletedDate,
          currentDay: habit.currentDay,
          status: 'given_up',
          completedDays: habit.completedDays.length,
          progress: habitProgress
        };
      })
    );

    // Calculate category statistics
    const categoryStats = {};
    [...activeHabitsWithDetails, ...completedHabitsWithDetails, ...givenUpHabitsWithDetails].forEach(habit => {
      const category = habit.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, active: 0, givenUp: 0 };
      }
      categoryStats[category].total++;
      categoryStats[category][habit.status]++;
    });

    // Calculate difficulty statistics
    const difficultyStats = {};
    [...activeHabitsWithDetails, ...completedHabitsWithDetails, ...givenUpHabitsWithDetails].forEach(habit => {
      const difficulty = habit.difficulty;
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { total: 0, completed: 0, active: 0, givenUp: 0 };
      }
      difficultyStats[difficulty].total++;
      difficultyStats[difficulty][habit.status]++;
    });

    // Calculate time-based statistics
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentCompletions = user.activeHabits.reduce((count, habit) => {
      return count + habit.completedDays.filter(day => 
        new Date(day.completedAt) >= lastWeek
      ).length;
    }, 0);

    const monthlyCompletions = user.activeHabits.reduce((count, habit) => {
      return count + habit.completedDays.filter(day => 
        new Date(day.completedAt) >= lastMonth
      ).length;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        // Overall statistics
        totalHabits,
        totalActiveHabits,
        totalCompletedHabits,
        totalGivenUpHabits,
        totalCompletedTasks,
        totalStreak,
        longestStreak,
        averageProgress,
        completionRate,
        
        // Time-based statistics
        recentCompletions,
        monthlyCompletions,
        
        // Detailed habit lists
        activeHabits: activeHabitsWithDetails,
        completedHabits: completedHabitsWithDetails,
        givenUpHabits: givenUpHabitsWithDetails,
        
        // Category and difficulty breakdowns
        categoryStats,
        difficultyStats,
        
        // User info
        userJoinedDate: user.createdAt,
        lastLoginDate: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's tasks for all active habits
// @route   GET /api/progress/today-tasks
// @access  Private
const getTodayTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activeHabits.habit', 'id title description duration category difficulty image');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeHabits = user.activeHabits.filter(habit => habit.isActive);
    
    const todayTasks = await Promise.all(
      activeHabits.map(async (activeHabit) => {
        const todayTask = user.getTodayTask(activeHabit.habitId);
        
        let taskDetails = [];
        if (todayTask && todayTask.day) {
          try {
            const tasks = await Task.find({ 
              habitId: activeHabit.habitId, 
              day: { $in: [todayTask.day] },
              isActive: true
            }).sort({ sortOrder: 1 });
            taskDetails = tasks;
          } catch (error) {
            console.error('Error fetching task details:', error);
          }
        }

        return {
          habitId: activeHabit.habitId,
          habit: activeHabit.habit,
          todayTask: {
            ...todayTask,
            taskDetails: Array.isArray(taskDetails) ? taskDetails : []
          },
          progress: user.getHabitProgress(activeHabit.habitId)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: todayTasks.length,
      data: todayTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users working on a specific habit
// @route   GET /api/progress/habit/:habitId/users
// @access  Private
const getHabitUsers = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const currentUserId = req.user.id;

    // Find all users who have this habit in their activeHabits
    const users = await User.find({
      'activeHabits.habitId': habitId,
      'activeHabits.isActive': true,
      '_id': { $ne: currentUserId } // Exclude current user
    })
    .select('name avatar activeHabits.$')
    .limit(20); // Limit to 20 users for performance

    // Process users to get their progress on this specific habit
    const usersWithProgress = users.map(user => {
      const activeHabit = user.activeHabits.find(habit => habit.habitId === habitId);
      
      if (!activeHabit) return null;

      // Calculate progress percentage
      const progressPercentage = activeHabit.progressPercentage || 0;
      
      // Determine if user has completed today's task
      const todayTask = user.getTodayTask(habitId);
      const isTodayCompleted = todayTask?.completedTasks?.length > 0;

      return {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        progress: Math.round(progressPercentage),
        isTodayCompleted,
        streak: activeHabit.streak || 0,
        startDate: activeHabit.startDate
      };
    }).filter(user => user !== null); // Remove null entries

    // Separate users into pending and completed based on today's task
    const pendingUsers = usersWithProgress.filter(user => !user.isTodayCompleted);
    const completedUsers = usersWithProgress.filter(user => user.isTodayCompleted);

    // If no users found, provide some sample data for testing
    if (usersWithProgress.length === 0) {
      console.log('No users found for habit:', habitId, '- providing sample data');
      const sampleData = {
        pending: [
          {
            id: 'sample-1',
            name: 'Alex Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            progress: 65,
            isTodayCompleted: false,
            streak: 5,
            startDate: new Date()
          },
          {
            id: 'sample-2',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            progress: 45,
            isTodayCompleted: false,
            streak: 3,
            startDate: new Date()
          },
          {
            id: 'sample-3',
            name: 'Mike Wilson',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            progress: 30,
            isTodayCompleted: false,
            streak: 1,
            startDate: new Date()
          }
        ],
        completed: [
          {
            id: 'sample-4',
            name: 'David Brown',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            progress: 100,
            isTodayCompleted: true,
            streak: 7,
            startDate: new Date()
          },
          {
            id: 'sample-5',
            name: 'Lisa Garcia',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            progress: 100,
            isTodayCompleted: true,
            streak: 6,
            startDate: new Date()
          },
          {
            id: 'sample-6',
            name: 'Tom Anderson',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            progress: 100,
            isTodayCompleted: true,
            streak: 4,
            startDate: new Date()
          }
        ]
      };

      return res.status(200).json({
        success: true,
        data: {
          pending: sampleData.pending,
          completed: sampleData.completed,
          total: sampleData.pending.length + sampleData.completed.length,
          isSampleData: true
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        pending: pendingUsers,
        completed: completedUsers,
        total: usersWithProgress.length,
        isSampleData: false
      }
    });
  } catch (error) {
    console.error('Error fetching habit users:', error);
    next(error);
  }
};

module.exports = {
  getActiveHabits,
  startHabit,
  stopHabit,
  completeTask,
  uncompleteTask,
  resetHabit,
  getHabitProgress,
  getUserStats,
  getTodayTasks,
  getHabitUsers
};
