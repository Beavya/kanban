Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <div class="cards-container">
                <!-- Здесь будут карточки -->
            </div>
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
        cards: []
    }
})