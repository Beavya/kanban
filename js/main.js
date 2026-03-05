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
                <button @click="deleteTask" class="delete-btn">Удалить</button>
            </div>
        </div>
    `,
    methods: {
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString()
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
            <task-card 
                v-for="task in filteredTasks" 
                :key="task.id"
                :task="task"
                @delete-task="deleteTask"
            ></task-card>
        </div>
    `,
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