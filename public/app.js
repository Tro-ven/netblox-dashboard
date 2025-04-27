class ModLogsApp {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.loadDashboard();
  }

  initElements() {
    this.elements = {
      dashboardContent: document.getElementById('dashboard-content'),
      logsContent: document.getElementById('logs-content'),
      actionForm: document.getElementById('actionForm'),
      logsSearch: document.getElementById('logsSearch'),
      tabLinks: document.querySelectorAll('[data-tab]')
    };
  }

  bindEvents() {
    this.elements.tabLinks.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e));
    });

    this.elements.actionForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.elements.logsSearch.addEventListener('input', () => this.searchLogs());
  }

  async switchTab(e) {
    e.preventDefault();
    const tabId = e.currentTarget.getAttribute('data-tab');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    e.currentTarget.classList.add('active');

    if (tabId === 'dashboard') {
      await this.loadDashboard();
    } else if (tabId === 'all-logs') {
      await this.loadAllLogs();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';

      const formData = {
        moderator: form.moderator.value,
        user: form.user.value,
        user_id: form.user_id.value,
        action: form.action.value,
        reason: form.reason.value,
        duration: form.duration.value || null
      };

      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        form.reset();
        if (document.querySelector('.nav-link.active').getAttribute('data-tab') === 'dashboard') {
          await this.loadDashboard();
        }
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async loadDashboard() {
    try {
      const response = await fetch('/api/logs?limit=5');
      const logs = await response.json();
      this.renderDashboard(logs);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }

  async loadAllLogs() {
    try {
      const response = await fetch('/api/logs');
      const logs = await response.json();
      this.renderAllLogs(logs);
    } catch (err) {
      console.error('Logs load error:', err);
    }
  }

  searchLogs() {
    const term = this.elements.logsSearch.value.toLowerCase();
    document.querySelectorAll('#logs-content tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  }

  renderDashboard(logs) {
    let html = logs.length ? '' : '<div class="text-center py-4">No recent actions</div>';
    
    logs.forEach(log => {
      html += `
      <div class="list-group-item bg-gray-800 text-light mb-2 rounded">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge ${this.getActionClass(log.action)} me-2">
              ${this.capitalizeFirstLetter(log.action)}
            </span>
            <strong>${log.moderator}</strong> → ${log.user} (${log.user_id})
          </div>
          <small class="text-muted">${new Date(log.timestamp).toLocaleString()}</small>
        </div>
        <div class="mt-2">${log.reason}</div>
        ${log.duration ? `<div class="mt-1"><small class="text-muted">Duration: ${log.duration}</small></div>` : ''}
      </div>`;
    });

    this.elements.dashboardContent.innerHTML = html;
  }

  renderAllLogs(logs) {
    let html = `
    <div class="table-responsive">
      <table class="table table-dark table-hover">
        <thead>
          <tr>
            <th>Moderator</th>
            <th>User</th>
            <th>User ID</th>
            <th>Action</th>
            <th>Reason</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>`;
    
    html += logs.map(log => `
      <tr>
        <td>${log.moderator}</td>
        <td>${log.user}</td>
        <td><code>${log.user_id}</code></td>
        <td><span class="badge ${this.getActionClass(log.action)}">${this.capitalizeFirstLetter(log.action)}</span></td>
        <td>${log.reason}</td>
        <td>${new Date(log.timestamp).toLocaleDateString()}</td>
      </tr>`
    ).join('');

    html += `</tbody></table></div>`;
    this.elements.logsContent.innerHTML = html;
  }

  getActionClass(action) {
    const classes = {
      warn: 'bg-warning text-dark',
      mute: 'bg-danger text-white',
      ban: 'bg-dark text-white',
      kick: 'bg-info text-white'
    };
    return classes[action] || 'bg-secondary text-white';
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => new ModLogsApp());
