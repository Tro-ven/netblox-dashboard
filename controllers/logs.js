async function logAction(db, req, res) {
  try {
    const { moderator, user, user_id, action, reason, duration, evidence, notes } = req.body;
    const ip = req.ip;

    await db.runAsync(
      `INSERT INTO modlogs 
       (moderator, user, user_id, action, reason, duration, evidence, notes, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [moderator, user, user_id, action, reason, duration, evidence, notes, ip]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Log action error:', err);
    res.status(500).json({ success: false });
  }
}

async function getLogs(db, req, res) {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM modlogs`;
    let params = [];
    
    if (search) {
      query += ` WHERE 
        user LIKE ? OR 
        user_id LIKE ? OR 
        moderator LIKE ? OR 
        reason LIKE ?`;
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const logs = await db.allAsync(query, params);
    res.json(logs);
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ success: false });
  }
}

module.exports = { logAction, getLogs };
