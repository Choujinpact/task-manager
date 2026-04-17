import React, { useMemo, useState } from 'react'
import { useTasks } from '../../../features/manage-tasks/model/useTasks'
import type { Task, TaskColor, TaskPriority } from '../../../entities/task/model/types'

const initialTasks: Task[] = [
  {
    id: Date.now() + 1,
    text: 'Сделать курсовую работу',
    completed: false,
    priority: 'high',
    color: 'red',
  },
  {
    id: Date.now() + 2,
    text: 'Купить продукты',
    completed: true,
    priority: 'medium',
    color: 'green',
  },
  {
    id: Date.now() + 3,
    text: 'Позвонить родителям',
    completed: false,
    priority: 'low',
    color: 'blue',
  },
]

export const TasksPage: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(initialTasks)
  const [inputValue, setInputValue] = useState<string>('')
  const [priorityValue, setPriorityValue] = useState<TaskPriority>('medium')
  const [colorValue, setColorValue] = useState<TaskColor>('red')

  const { completedCount, totalCount, progress } = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length
    const total = tasks.length
    const percent = total ? Math.round((completed / total) * 100) : 0
    return { completedCount: completed, totalCount: total, progress: percent }
  }, [tasks])

  const handleAddTask = () => {
    const text = inputValue.trim()
    if (!text) return
    addTask(text, { priority: priorityValue, color: colorValue })
    setInputValue('')
  }

  const handleToggleTask = (id: string | number) => {
    toggleTask(id)
  }

  const handleDeleteTask = (id: string | number) => {
    deleteTask(id)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    }
  }

  const groupedTasks = useMemo(() => {
    const priorityOrder: TaskPriority[] = ['high', 'medium', 'low']
    const priorityLabels: Record<TaskPriority, string> = {
      high: 'Высокий приоритет',
      medium: 'Средний приоритет',
      low: 'Низкий приоритет',
    }

    const colorOrder: TaskColor[] = ['red', 'blue', 'green', 'purple']
    const colorLabels: Record<TaskColor, string> = {
      red: 'Красные',
      blue: 'Синие',
      green: 'Зелёные',
      purple: 'Фиолетовые',
    }

    return priorityOrder.map((priority) => {
      const tasksByPriority = tasks.filter((task) => task.priority === priority)
      const colorGroups = colorOrder
        .map((color) => ({
          color,
          label: colorLabels[color],
          tasks: tasksByPriority.filter((task) => task.color === color),
        }))
        .filter((group) => group.tasks.length > 0)

      return {
        priority,
        label: priorityLabels[priority],
        groups: colorGroups,
      }
    })
  }, [tasks])

  return (
    <div className='page'>
      <h2 className='page-title'>📋 Задачи</h2>

      <div className='add-task'>
        <input
          type='text'
          className='task-input'
          placeholder='Новая задача...'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <select
          className='task-select'
          value={priorityValue}
          onChange={(e) => setPriorityValue(e.target.value as TaskPriority)}
        >
          <option value='high'>Высокий</option>
          <option value='medium'>Средний</option>
          <option value='low'>Низкий</option>
        </select>
        <select
          className='task-select'
          value={colorValue}
          onChange={(e) => setColorValue(e.target.value as TaskColor)}
        >
          <option value='red'>Красный</option>
          <option value='blue'>Синий</option>
          <option value='green'>Зелёный</option>
          <option value='purple'>Фиолетовый</option>
        </select>
        <button className='btn-primary' onClick={handleAddTask}>
          Добавить
        </button>
      </div>

      {groupedTasks.map((priorityBucket) =>
        priorityBucket.groups.length > 0 ? (
          <div className='task-group' key={priorityBucket.priority}>
            <h3 className='task-group-title'>{priorityBucket.label}</h3>

            {priorityBucket.groups.map((colorGroup) => (
              <div className='task-color-group' key={`${priorityBucket.priority}-${colorGroup.color}`}>
                <div className='task-color-title'>
                  <span className={`task-color-dot ${colorGroup.color}`}></span>
                  {colorGroup.label}
                </div>
                <div className='task-list'>
                  {colorGroup.tasks.map((task) => (
                    <div className='task-item' key={task.id}>
                      <input
                        type='checkbox'
                        className='task-check'
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span
                        className={'task-text' + (task.completed ? ' completed' : '')}
                      >
                        {task.text}
                      </span>
                      <button
                        className='delete-task'
                        title='Удалить'
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null,
      )}

      <div style={{ marginTop: 20, color: '#b15353', fontWeight: 500 }}>
        Выполнено: {completedCount} из {totalCount} ({progress}%)
      </div>
    </div>
  )
}
