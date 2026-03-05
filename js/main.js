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
            // Преобразуем дату из input в timestamp
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
        </div>
    `,
    methods: {
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString()
        }
    }
})

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        tasks: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <div class="cards-container">
                <task-card 
                    v-for="task in filteredTasks" 
                    :key="task.id"
                    :task="task"
                ></task-card>
            </div>
        </div>
    `,
    computed: {
        filteredTasks() {
            return this.tasks.filter(task => task.columnId === this.column.id)
        }
    }
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
        tasks: [
            {
                id: 1,
                title: 'Создать макет',
                description: 'Разработать дизайн главной страницы',
                createdAt: Date.now() - 86400000,
                deadline: Date.now() + 86400000 * 2,
                editedAt:  Date.now() + 86400000 * 2,
                columnId: 1
            },
            {
                id: 2,
                title: 'Верстка компонентов',
                description: 'Сверстать карточки товаров',
                createdAt: Date.now() - 43200000,
                deadline: Date.now() + 86400000,
                editedAt: null,
                columnId: 2
            }
        ]
    }
})