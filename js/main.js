let eventBus = new Vue()

Vue.component('add-task-form', {
    template: `
        <div class="add-task-form">
            <h3>Создать новую задачу</h3>
            <form @submit.prevent="onSubmit">
                <div class="form-group">
                    <label for="title">Заголовок:</label>
                    <input 
                        id="title" 
                        v-model="title" 
                        placeholder="Введите заголовок"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="description">Описание:</label>
                    <textarea 
                        id="description" 
                        v-model="description" 
                        placeholder="Введите описание задачи"
                        rows="3"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label for="deadline">Дедлайн:</label>
                    <input 
                        type="datetime-local" 
                        id="deadline" 
                        v-model="deadline"
                        required
                    >
                </div>
                
                <button type="submit">Создать задачу</button>
            </form>
        </div>
    `,
    data() {
        return {
            title: null,
            description: null,
            deadline: null
        }
    },
    methods: {
        onSubmit() {
            const deadlineDate = new Date(this.deadline).getTime()
            
            let newTask = {
                title: this.title,
                description: this.description,
                createdAt: Date.now(),
                deadline: deadlineDate,
                editedAt: null
            }
            
            eventBus.$emit('task-created', newTask)
            
            this.title = null
            this.description = null
            this.deadline = null
        }
    }
})

Vue.component('task-card', {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="task-card">
            <h3>{{ task.title }}</h3>
            <p class="description">{{ task.description }}</p>
            <div class="task-meta">
                <p>Создано: {{ formatDate(task.createdAt) }}</p>
                <p>Дедлайн: {{ formatDate(task.deadline) }}</p>
                <p v-if="task.editedAt" class="edited">Изменено: {{ formatDate(task.editedAt) }}</p>
            </div>
            <div class="task-actions">
                <button @click="editTask" class="task-btn">Редактировать</button>
                <button @click="deleteTask" class="task-btn">Удалить</button>
            </div>
        </div>
    `,
    methods: {
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString()
        },
        editTask() {
            this.$emit('edit-task', this.task.id)
        },
        deleteTask() {
            this.$emit('delete-task', this.task.id)
        }
    }
})

Vue.component('tasks', {
    props: {
        columnId: {
            type: Number,
            required: true
        },
        allTasks: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="tasks-container">
            <div v-if="editingTask" class="add-task-form">
                <h3>Редактировать задачу</h3>
                <form @submit.prevent="saveEdit">
                    <div class="form-group">
                        <label for="edit-title">Заголовок:</label>
                        <input 
                            id="edit-title" 
                            v-model="editTitle" 
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-description">Описание:</label>
                        <textarea 
                            id="edit-description" 
                            v-model="editDescription" 
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-deadline">Дедлайн:</label>
                        <input 
                            type="datetime-local" 
                            id="edit-deadline" 
                            v-model="editDeadline"
                            required
                        >
                    </div>
                    
                    <button type="submit">Сохранить</button>
                </form>
            </div>
            
            <template v-for="task in filteredTasks">
                <task-card 
                    v-if="editingTask !== task.id"
                    :key="task.id"
                    :task="task"
                    @edit-task="startEdit"
                    @delete-task="deleteTask"
                ></task-card>
            </template>
        </div>
    `,
    data() {
        return {
            editingTask: null,
            editTitle: '',
            editDescription: '',
            editDeadline: ''
        }
    },
    computed: {
        filteredTasks() {
            return this.allTasks.filter(task => task.columnId === this.columnId)
        }
    },
    methods: {
        deleteTask(taskId) {
            const taskIndex = this.allTasks.findIndex(task => task.id === taskId)
            if (taskIndex !== -1) {
                this.allTasks.splice(taskIndex, 1)
            }
        },
        startEdit(taskId) {
            const task = this.allTasks.find(t => t.id === taskId)
            if (task) {
                this.editingTask = taskId
                this.editTitle = task.title
                this.editDescription = task.description
                this.editDeadline = this.formatDateForInput(task.deadline)
            }
        },
        formatDateForInput(timestamp) {
            const date = new Date(timestamp)
            return date.toISOString().slice(0, 16)
        },
        saveEdit() {
            if (!this.editingTask) return
            
            const taskIndex = this.allTasks.findIndex(t => t.id === this.editingTask)
            if (taskIndex !== -1) {
                this.allTasks[taskIndex].title = this.editTitle
                this.allTasks[taskIndex].description = this.editDescription
                this.allTasks[taskIndex].deadline = new Date(this.editDeadline).getTime()
                this.allTasks[taskIndex].editedAt = Date.now()
            }
            this.editingTask = null
        }
    }
})

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        allTasks: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <tasks 
                :column-id="column.id" 
                :all-tasks="allTasks"
            ></tasks>
        </div>
    `
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, title: 'Запланированные задачи' },
            { id: 2, title: 'Задачи в работе' },
            { id: 3, title: 'Тестирование' },
            { id: 4, title: 'Выполненные задачи' }
        ],
        allTasks: []
    },
    mounted() {
        eventBus.$on('task-created', (newTask) => {
            this.allTasks.push({
                id: this.allTasks.length + 1,
                title: newTask.title,
                description: newTask.description,
                createdAt: newTask.createdAt,
                deadline: newTask.deadline,
                editedAt: null,
                columnId: 1
            })
        })
    }
})