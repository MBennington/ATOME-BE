const Note = require('../models/Note');
const Task = require('../models/Task');

// @desc    Get all notes for a task within a specific habit
// @route   GET /api/notes/habit/:habitId/task/:taskId
// @access  Private
const getNotesByTask = async (req, res, next) => {
  try {
    const { taskId, habitId } = req.params; // Get both from URL parameters
    const userId = req.user._id; // Get user from authenticated request
    
    console.log('Getting notes for task:', taskId, 'in habit:', habitId, 'for user:', userId);
    
    // First verify that the task exists in the specified habit
    const task = await Task.findOne({ id: taskId, habitId: habitId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task '${taskId}' not found in habit '${habitId}'`
      });
    }
    
    const query = { 
      user: userId,
      taskId: taskId, 
      habitId: habitId
    };
    
    console.log('Querying notes with:', query);
    const notes = await Note.find(query).sort({ createdAt: -1 });

    console.log('Found notes:', notes.length);
    if (notes.length > 0) {
      console.log('Note details:', notes.map(note => ({
        id: note._id,
        userId: note.user,
        taskId: note.taskId,
        habitId: note.habitId,
        content: note.content.substring(0, 50) + '...'
      })));
    }
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error in getNotesByTask:', error);
    next(error);
  }
};

// @desc    Get all notes for a habit
// @route   GET /api/notes/habit/:habitId
// @access  Private
const getNotesByHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id; // Get user from authenticated request
    
    console.log('Getting notes for habit:', habitId, 'for user:', userId);
    
    const notes = await Note.find({ 
      user: userId,
      habitId: habitId
    }).sort({ createdAt: -1 });

    console.log('Found notes:', notes.length);
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error in getNotesByHabit:', error);
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const { taskId, habitId, content } = req.body;
    const userId = req.user._id; // Get user from authenticated request
    console.log('Creating note with data:', { taskId, habitId, content, userId });
    
    if (!taskId || !habitId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Task ID, Habit ID, and content are required'
      });
    }

    // Verify that the task exists within the specific habit
    const task = await Task.findOne({ id: taskId, habitId: habitId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task '${taskId}' not found in habit '${habitId}'`
      });
    }

    const noteData = {
      user: userId,
      task: task._id,
      taskId,
      habitId,
      content: content.trim()
    };

    console.log('Creating note with data:', noteData);
    const note = new Note(noteData);
    const savedNote = await note.save();
    console.log('Note created successfully:', savedNote._id);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: savedNote
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Get user from authenticated request
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Find note and verify it belongs to the user
    const note = await Note.findOne({ _id: id, user: userId });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to update it'
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    next(error);
  }
};

// @desc    Delete a note (permanent delete)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Get user from authenticated request
    
    // Find note and verify it belongs to the user
    const note = await Note.findOne({ _id: id, user: userId });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to delete it'
      });
    }
    
    // Permanently delete the note from database
    await Note.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    next(error);
  }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Get user from authenticated request
    
    const note = await Note.findOne({ _id: id, user: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to view it'
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error in getNoteById:', error);
    next(error);
  }
};

module.exports = {
  getNotesByTask,
  getNotesByHabit,
  createNote,
  updateNote,
  deleteNote,
  getNoteById
};
