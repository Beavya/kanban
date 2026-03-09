let eventBus = new Vue()

Vue.component('task-form', {
    props: {
        task: {
            type: Object,
            default: null
        }
    },
    template: `
        <div class="add-task-form">
            <h3>{{ task ? 'Редактировать задачу' : 'Создать новую задачу' }}</h3>
            <form @submit.prevent="onSubmit">
                <div class="form-group">
                    <label for="title">Заголовок:</label>
                    <input 
                        id="title" 
                        v-model="formData.title" 
                        placeholder="Введите заголовок"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="description">Описание:</label>
                    <textarea 
                        id="description" 
                        v-model="formData.description" 
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
                        v-model="formData.deadline"
                        required
                    >
                </div>
                
                <button type="submit">{{ task ? 'Сохранить' : 'Создать задачу' }}</button>
            </form>
        </div>
    `,
    data() {
        return {
            formData: {
                title: this.task ? this.task.title : null,
                description: this.task ? this.task.description : null,
                deadline: this.task ? this.formatDateForInput(this.task.deadline) : null
            }
        }
    },
    methods: {
        formatDateForInput(timestamp) {
            const date = new Date(timestamp)
            return date.toISOString().slice(0, 16)
        },
        onSubmit() {
            if (this.task) {
                this.$emit('save-edit', {
                    id: this.task.id,
                    title: this.formData.title,
                    description: this.formData.description,
                    deadline: new Date(this.formData.deadline).getTime(),
                    editedAt: Date.now()
                })
            } else {
                let newTask = {
                    title: this.formData.title,
                    description: this.formData.description,
                    createdAt: Date.now(),
                    deadline: new Date(this.formData.deadline).getTime(),
                    editedAt: null
                }
                eventBus.$emit('task-created', newTask)
                this.formData.title = null
                this.formData.description = null
                this.formData.deadline = null
            }
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
            if (this.returnReason && this.returnReason.trim()) {
                this.$emit('confirm-return', {
                    id: this.task.id,
                    reason: this.returnReason
                })
            }
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

            <div v-else class="task-card" :class="deadlineClass">
                <h3>{{ task.title }}</h3>
                <p class="description">{{ task.description }}</p>
                <div class="task-meta">
                    <p class="meta-item">Создано: {{ formatDate(task.createdAt) }}</p>
                    <p class="meta-item">Дедлайн: {{ formatDate(task.deadline) }}</p>
                    <p v-if="columnId === 4" class="deadline-status meta-item">
                        {{ deadlineStatus }}
                    </p>
                    <p v-if="task.returnReason" class="return-reason meta-item">
                        Причина возврата: {{ task.returnReason }}
                    </p>
                    <p v-if="task.editedAt" class="edited meta-item">
                        Изменено: {{ formatDate(task.editedAt) }}
                    </p>
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
        },
        hoursUntilDeadline() {
            const now = Date.now()
            const diffMs = this.task.deadline - now
            return diffMs / (1000 * 60 * 60)
        },
        deadlineClass() {
            if (this.columnId === 4) return ''
            
            const hours = this.hoursUntilDeadline
            
            if (hours <= 24) {
                return 'deadline-critical'
            } else if (hours <= 72) {
                return 'deadline-warning'
            }
            return ''
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
            <task-card 
                v-for="task in filteredTasks" 
                :key="task.id"
                :task="task"
                :column-id="columnId"
                @edit-task="$emit('edit-task', $event)"
                @delete-task="$emit('delete-task', $event)"
                @move-task="$emit('move-task', $event)"
            ></task-card>
        </div>
    `,
    computed: {
        filteredTasks() {
            return this.allTasks.filter(task => task.columnId === this.columnId)
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
                @edit-task="$emit('edit-task', $event)"
                @delete-task="$emit('delete-task', $event)"
                @move-task="$emit('move-task', $event)"
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
        allTasks: [],
        editingTask: null
    },
    methods: {
        startEdit(taskId) {
            this.editingTask = this.allTasks.find(t => t.id === taskId)
        },
        saveEdit(updatedTask) {
            const taskIndex = this.allTasks.findIndex(t => t.id === updatedTask.id)
            if (taskIndex !== -1) {
                this.allTasks[taskIndex].title = updatedTask.title
                this.allTasks[taskIndex].description = updatedTask.description
                this.allTasks[taskIndex].deadline = updatedTask.deadline
                this.allTasks[taskIndex].editedAt = updatedTask.editedAt
            }
            this.editingTask = null
        },
        deleteTask(taskId) {
            const taskIndex = this.allTasks.findIndex(t => t.id === taskId)
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
        }
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