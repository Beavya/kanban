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