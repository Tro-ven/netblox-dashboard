function validateLogInput(req, res, next) {
  const { moderator, user, user_id, action, reason } = req.body;

  if (!moderator || !user || !user_id || !action || !reason) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields' 
    });
  }

  if (!['warn', 'mute', 'ban', 'kick'].includes(action)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid action type' 
    });
  }

  next();
}

module.exports = { validateLogInput };
