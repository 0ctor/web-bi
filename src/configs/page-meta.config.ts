import { Metadata } from 'next'

const pageMeta: Metadata = {
    title: 'Painel da clínica',
    description: 'Respostas prontas sobre a clínica, sem montar gráfico.',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/icons/icon.svg', type: 'image/svg+xml' },
            { url: '/favicon.png', type: 'image/png' },
        ],
        apple: '/icons/apple-touch-icon.png',
    },
}

export default pageMeta
