# Task Time Tracker

A modern web application for tracking time spent on different tasks and projects. Perfect for freelancers, students, and professionals who want to monitor their time usage.

## Features

- ⏱️ Real-time task timing
- 📊 Visual time distribution charts
- 🏷️ Category-based organization
- 📱 Responsive design
- 🔄 Pause/Resume functionality
- 🗑️ Task management (add/delete)
- 📈 Category-wise summary

## Prerequisites

Before running this application, ensure you have:

1. Python 3.8 or higher
   ```bash
   python --version
   ```

2. pip (Python package installer)
   ```bash
   pip --version
   ```

## Installation

1. Clone this repository:
   ```bash
   git clone [your-repo-url]
   cd task-timer
   ```

2. Create and activate a virtual environment:
   - Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Using the Application

1. **Adding Tasks**
   - Enter task name
   - Select category
   - Click "Add Task"

2. **Managing Tasks**
   - Start/Pause: Click the play/pause button
   - Reset: Click the reset button
   - Delete: Click the delete button

3. **Viewing Statistics**
   - Time distribution chart shows category-wise time allocation
   - Category summary shows total time per category

## Project Structure

```
task_timer/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── styles.css     # Custom styling
│   └── script.js      # Frontend JavaScript
└── templates/
    └── index.html     # Main HTML template
```

## Technologies Used

- Backend: Flask, SQLAlchemy
- Frontend: HTML5, CSS3, JavaScript
- Database: SQLite
- Charts: Chart.js
- UI Framework: Bootstrap 5
- Icons: Bootstrap Icons

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
