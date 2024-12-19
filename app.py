from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    start_time = db.Column(db.DateTime, nullable=True)
    total_time = db.Column(db.Integer, default=0)  # Total time in seconds
    is_running = db.Column(db.Boolean, default=False)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    tasks = Task.query.all()
    return render_template('index.html', tasks=tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    task = Task(
        name=data['name'],
        category=data['category']
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({
        'id': task.id,
        'name': task.name,
        'category': task.category,
        'total_time': task.total_time,
        'is_running': task.is_running
    })

@app.route('/api/tasks/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    if task.is_running:
        # Stop the timer
        elapsed = (datetime.utcnow() - task.start_time).total_seconds()
        task.total_time += int(elapsed)
        task.start_time = None
        task.is_running = False
    else:
        # Start the timer
        task.start_time = datetime.utcnow()
        task.is_running = True
    
    db.session.commit()
    return jsonify({
        'id': task.id,
        'is_running': task.is_running,
        'total_time': task.total_time
    })

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})

@app.route('/api/tasks/<int:task_id>/reset', methods=['POST'])
def reset_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.total_time = 0
    task.start_time = None
    task.is_running = False
    db.session.commit()
    return jsonify({
        'id': task.id,
        'total_time': task.total_time,
        'is_running': task.is_running
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
