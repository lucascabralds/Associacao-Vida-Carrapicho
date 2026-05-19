// eventos-loader.js - Carrega e renderiza eventos do backend

// URL DINÂMICA - Funciona local e na Vercel
const API_URL = window.location.origin + '/api';

const CORES_EVENTOS = [
    'event-card-green',
    'event-card-gold',
    'event-card-pink'
];

// ======================================================
// FORMATAR DATA
// ======================================================

function formatarDataEvento(dataISO) {
    const data = new Date(dataISO);

    const dia = data
        .getDate()
        .toString()
        .padStart(2, '0');

    const mes = data
        .toLocaleString('pt-BR', {
            month: 'short'
        })
        .toUpperCase();

    return { dia, mes };
}

// ======================================================
// CRIAR CARD DO EVENTO
// ======================================================

function criarCardEvento(evento, indice) {

    const { dia, mes } = formatarDataEvento(evento.event_date);

    const corEvento = CORES_EVENTOS[indice % CORES_EVENTOS.length];

    const titulo = evento.title || 'Evento sem título';

    const descricao = evento.description ||
        'Confira os detalhes deste evento.';

    const imagem = evento.cover_image || './img/evento.png';

    const imagensHTML = evento.images && evento.images.length > 0
        ? evento.images.slice(0, 3).map(img => `
            <div class="event-thumb">
                <img src="${img.image_url}" alt="${titulo}">
                <p>${titulo}</p>
            </div>
        `).join('')
        : `
            <div class="event-thumb">
                <img src="${imagem}" alt="${titulo}">
                <p>${titulo}</p>
            </div>
        `;

    return `
        <article class="event-card" data-event-id="${evento.id}">
            <header class="event-card-header ${corEvento}">
                <div class="event-date">
                    <span class="day">${dia}</span>
                    <span class="month">${mes}</span>
                </div>
                <div class="event-name">Evento</div>
            </header>
            <div class="event-card-thumb-row">
                ${imagensHTML}
            </div>
            <div class="event-card-body">
                <h2>${titulo}</h2>
                <p>${descricao.substring(0, 120)}${descricao.length > 120 ? '...' : ''}</p>
                <a href="./evento.html?id=${evento.id}" class="event-cta-btn" style="margin-top: 16px;">
                    Ver detalhes →
                </a>
            </div>
        </article>
    `;
}

// ======================================================
// CARREGAR EVENTOS
// ======================================================

async function carregarEventos() {
    try {
        console.log('📡 Buscando eventos em:', `${API_URL}/events`);

        const response = await fetch(`${API_URL}/events`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar eventos: ${response.status}`);
        }

        const eventos = await response.json();

        const secaoProxEventos = document.getElementById('prox_event');
        const containerEventos = document.getElementById('eventos');

        if (!eventos || eventos.length === 0) {
            if (secaoProxEventos) {
                secaoProxEventos.style.display = 'none';
            }
            return;
        }

        if (secaoProxEventos) {
            secaoProxEventos.style.display = 'flex';
        }

        eventos.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        const eventosExibicao = eventos.slice(0, 3);

        if (containerEventos && eventosExibicao.length > 0) {
            containerEventos.innerHTML = eventosExibicao
                .map((evento, indice) => criarCardEvento(evento, indice))
                .join('');
        }

        console.log('✅ Eventos carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        const secaoProxEventos = document.getElementById('prox_event');
        if (secaoProxEventos) {
            secaoProxEventos.style.display = 'none';
        }
    }
}

// ======================================================
// INICIAR
// ======================================================

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        carregarEventos();
    }, 500);
});

// Atualiza a cada 30 segundos
setInterval(carregarEventos, 30000);