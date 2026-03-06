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
            let newTask = {
                title: this.title,
                description: this.description,
                createdAt: Date.now(),
                deadline: new Date(this.deadline).getTime(),
                editedAt: null
            }
            
            eventBus.$emit('task-created', newTask)
            
            this.title = null
            this.description = null
            this.deadline = null
        }
    }
})

Vue.component('return-form', {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="add-task-form">
            <h3>Укажите причину возврата</h3>
            <div class="form-group">
                <textarea 
                    v-model="returnReason" 
                    placeholder="Введите причину возврата"
                    rows="3"
                    required
                ></textarea>
            </div>
            <button @click="confirmReturn" class="task-btn">Переместить</button>
        </div>
    `,
    data() {
        return {
            returnReason: null
        }
    },
    methods: {
        confirmReturn() {
            this.$emit('confirm-return', {
                id: this.task.id,
                reason: this.returnReason
            })
        }
    }
})

Vue.component('task-card', {
    props: {
        task: {
            type: Object,
            required: true
        },
        columnId: {
            type: Number,
            required: true
        }
    },
    template: `
        <div>
            <return-form 
                v-if="showReturnForm"
                :task="task"
                @confirm-return="handleReturn"
            ></return-form>

            <div v-else class="task-card">
                <h3>{{ task.title }}</h3>
                <p class="description">{{ task.description }}</p>
                <div class="task-meta">
                    <p>Создано: {{ formatDate(task.createdAt) }}</p>
                    <p>Дедлайн: {{ formatDate(task.deadline) }}</p>
                    <p v-if="columnId === 4" class="deadline-status">
                        {{ deadlineStatus }}
                    </p>
                    <p v-if="task.returnReason" class="return-reason">
                        Причина возврата: {{ task.returnReason }}
                    </p>
                    <p v-if="task.editedAt" class="edited">Изменено: {{ formatDate(task.editedAt) }}</p>
                </div>
                
                <div class="task-actions">
                    <button v-if="columnId === 3" @click="showReturnForm = true" class="task-btn">←</button>
                    <button v-if="columnId !== 4" @click="editTask" class="task-btn">Редактировать</button>
                    <button v-if="columnId === 1" @click="deleteTask" class="task-btn">Удалить</button>
                    <button v-if="columnId < 4" @click="moveForward" class="task-btn">→</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showReturnForm: false
        }
    },
    computed: {
        deadlineStatus() {
            if (this.columnId !== 4) return null
            const now = Date.now()
            return this.task.deadline < now ? 'Просрочено' : 'Выполнено в срок'
        }
    },
    methods: {
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString()
        },
        editTask() {
            this.$emit('edit-task', this.task.id)
        },
        deleteTask() {
            this.$emit('delete-task', this.task.id)
        },
        moveForward() {
            this.$emit('move-task', {
                id: this.task.id,
                newColumnId: this.columnId + 1
            })
        },
        handleReturn(data) {
            this.$emit('move-task', {
                id: data.id,
                newColumnId: 2,
                reason: data.reason
            })
            this.showReturnForm = false
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
                            v-model="editingTask.title" 
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-description">Описание:</label>
                        <textarea 
                            id="edit-description" 
                            v-model="editingTask.description" 
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-deadline">Дедлайн:</label>
                        <input 
                            type="datetime-local" 
                            id="edit-deadline" 
                            v-model="editingTask.deadline"
                            required
                        >
                    </div>
                    
                    <button type="submit">Сохранить</button>
                </form>
            </div>
            
            <template v-for="task in filteredTasks">
                <task-card 
                    v-if="!editingTask || editingTask.id !== task.id"
                    :key="task.id"
                    :task="task"
                    :column-id="columnId"
                    @edit-task="startEdit"
                    @delete-task="deleteTask"
                    @move-task="moveTask"
                ></task-card>
            </template>
        </div>
    `,
    data() {
        return {
            editingTask: null
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
        moveTask(data) {
            const taskIndex = this.allTasks.findIndex(t => t.id === data.id)
            if (taskIndex !== -1) {
                this.allTasks[taskIndex].columnId = data.newColumnId
                if (data.reason) {
                    this.allTasks[taskIndex].returnReason = data.reason
                }
            }
        },
        startEdit(taskId) {
            const task = this.allTasks.find(t => t.id === taskId)
            if (task) {
                this.editingTask = {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    deadline: this.formatDateForInput(task.deadline)
                }
            }
        },
        formatDateForInput(timestamp) {
            const date = new Date(timestamp)
            return date.toISOString().slice(0, 16)
        },
        saveEdit() {
            if (!this.editingTask) return
            
            const taskIndex = this.allTasks.findIndex(t => t.id === this.editingTask.id)
            if (taskIndex !== -1) {
                this.allTasks[taskIndex].title = this.editingTask.title
                this.allTasks[taskIndex].description = this.editingTask.description
                this.allTasks[taskIndex].deadline = new Date(this.editingTask.deadline).getTime()
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