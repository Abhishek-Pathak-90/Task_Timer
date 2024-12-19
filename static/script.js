document.addEventListener('DOMContentLoaded', function() {
    // Initialize task form
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', handleNewTask);

    // Initialize existing timers
    document.querySelectorAll('.timer').forEach(timer => {
        if (timer.closest('tr').querySelector('.toggle-timer').dataset.running === 'true') {
            startTimer(timer);
        }
    });

    // Add event listeners for all task actions
    document.querySelectorAll('.toggle-timer').forEach(btn => {
        btn.addEventListener('click', handleToggleTimer);
    });

    document.querySelectorAll('.reset-timer').forEach(btn => {
        btn.addEventListener('click', handleResetTimer);
    });

    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', handleDeleteTask);
    });

    // Initialize charts
    updateCharts();
});

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function handleNewTask(e) {
    e.preventDefault();
    
    const taskData = {
        name: document.getElementById('taskName').value,
        category: document.getElementById('category').value
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            const task = await response.json();
            addTaskToTable(task);
            taskForm.reset();
            updateCharts();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add task');
    }
}

function addTaskToTable(task) {
    const tbody = document.getElementById('tasksList');
    const row = document.createElement('tr');
    row.dataset.taskId = task.id;
    
    row.innerHTML = `
        <td>${task.name}</td>
        <td><span class="badge bg-secondary">${task.category}</span></td>
        <td><span class="timer">00:00:00</span></td>
        <td>
            <button class="btn btn-sm btn-primary toggle-timer" data-running="false">
                <i class="bi bi-play-fill"></i>
            </button>
            <button class="btn btn-sm btn-warning reset-timer">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-task">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tbody.insertBefore(row, tbody.firstChild);
    
    // Add event listeners to new buttons
    row.querySelector('.toggle-timer').addEventListener('click', handleToggleTimer);
    row.querySelector('.reset-timer').addEventListener('click', handleResetTimer);
    row.querySelector('.delete-task').addEventListener('click', handleDeleteTask);
}

async function handleToggleTimer(e) {
    const btn = e.currentTarget;
    const row = btn.closest('tr');
    const taskId = row.dataset.taskId;
    const timer = row.querySelector('.timer');

    try {
        const response = await fetch(`/api/tasks/${taskId}/toggle`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            btn.dataset.running = data.is_running.toString();
            
            if (data.is_running) {
                btn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                startTimer(timer);
            } else {
                btn.innerHTML = '<i class="bi bi-play-fill"></i>';
                stopTimer(timer);
                timer.textContent = formatTime(data.total_time);
            }
            
            updateCharts();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to toggle timer');
    }
}

async function handleResetTimer(e) {
    if (!confirm('Are you sure you want to reset this timer?')) return;

    const row = e.currentTarget.closest('tr');
    const taskId = row.dataset.taskId;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/reset`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            const timer = row.querySelector('.timer');
            const toggleBtn = row.querySelector('.toggle-timer');
            
            stopTimer(timer);
            timer.textContent = '00:00:00';
            toggleBtn.dataset.running = 'false';
            toggleBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            
            updateCharts();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to reset timer');
    }
}

async function handleDeleteTask(e) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const row = e.currentTarget.closest('tr');
    const taskId = row.dataset.taskId;
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            row.remove();
            updateCharts();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete task');
    }
}

function startTimer(timerElement) {
    if (timerElement.interval) return;

    const startTime = new Date();
    const initialTime = timeToSeconds(timerElement.textContent);
    
    timerElement.interval = setInterval(() => {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        timerElement.textContent = formatTime(initialTime + elapsedSeconds);
    }, 1000);
}

function stopTimer(timerElement) {
    if (timerElement.interval) {
        clearInterval(timerElement.interval);
        timerElement.interval = null;
    }
}

function timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

let timeChart;
async function updateCharts() {
    const tasks = Array.from(document.querySelectorAll('#tasksList tr')).map(row => ({
        name: row.cells[0].textContent,
        category: row.cells[1].textContent,
        time: timeToSeconds(row.querySelector('.timer').textContent)
    }));

    // Update category summary
    const categoryData = {};
    tasks.forEach(task => {
        if (!categoryData[task.category]) {
            categoryData[task.category] = 0;
        }
        categoryData[task.category] += task.time;
    });

    const summaryHtml = Object.entries(categoryData)
        .map(([category, time]) => `
            <div class="mb-2">
                <strong>${category}:</strong> ${formatTime(time)}
            </div>
        `)
        .join('');
    
    document.getElementById('categorySummary').innerHTML = summaryHtml;

    // Update chart
    const ctx = document.getElementById('timeChart').getContext('2d');
    
    if (timeChart) {
        timeChart.destroy();
    }

    timeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#3498db',
                    '#9b59b6',
                    '#2ecc71',
                    '#e74c3c',
                    '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Time Distribution by Category'
                }
            }
        }
    });
}
