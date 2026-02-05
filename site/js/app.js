// Keshmat Circuit 2026 - Frontend Application

// Data path - can be overridden before loading this script
// Use /data for production (Netlify), ../data for local file serving
var DATA_PATH = window.DATA_PATH || '/data';

// Event type labels
const EVENT_TYPE_LABELS = {
    'rapid': 'Rapid',
    'group_a': 'Group A',
    'group_b': 'Group B',
    'group_c': 'Group C'
};

const EVENT_TYPE_BADGES = {
    'rapid': 'badge-warning',
    'group_a': 'badge-error',
    'group_b': 'badge-primary',
    'group_c': 'badge-secondary'
};

// Title formatting
function formatTitle(title) {
    if (!title) return '';
    const titleClasses = {
        'GM': 'title-gm',
        'IM': 'title-im',
        'FM': 'title-fm',
        'WGM': 'title-gm',
        'WIM': 'title-im',
        'WFM': 'title-fm',
        'CM': 'title-cm',
        'WCM': 'title-cm',
        'AFM': 'title-afm'
    };
    const cls = titleClasses[title] || 'title-default';
    return `<span class="title-badge ${cls}">${title}</span>`;
}

// Position formatting with medals
function formatPosition(pos) {
    if (pos === 1) return '<span class="trophy-gold text-xl">&#x1F947;</span>';
    if (pos === 2) return '<span class="trophy-silver text-xl">&#x1F948;</span>';
    if (pos === 3) return '<span class="trophy-bronze text-xl">&#x1F949;</span>';
    return pos;
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format rating
function formatRating(rating) {
    if (!rating || rating === 0) return '<span class="text-base-content/50">Unr.</span>';
    return rating;
}

// Load JSON data
async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to load ${path}:`, error);
        return null;
    }
}

// Format points breakdown with rapid/classical split
function formatPointsBreakdown(player) {
    const rapidPts = player.rapid_points || 0;
    const classicalPts = player.classical_points || 0;
    
    // Count events by category
    const rapidEvents = (player.events || []).filter(e => e.category === 'rapid');
    const classicalEvents = (player.events || []).filter(e => e.category === 'classical');
    const rapidCounted = rapidEvents.filter(e => e.counted).length;
    const classicalCounted = classicalEvents.filter(e => e.counted).length;
    
    let parts = [];
    if (rapidPts > 0 || rapidEvents.length > 0) {
        const droppedRapid = rapidEvents.length - rapidCounted;
        const droppedNote = droppedRapid > 0 ? ` <span class="text-warning text-xs">(${droppedRapid} dropped)</span>` : '';
        parts.push(`<span class="text-warning">${rapidPts}</span> R${droppedNote}`);
    }
    if (classicalPts > 0 || classicalEvents.length > 0) {
        const droppedClassical = classicalEvents.length - classicalCounted;
        const droppedNote = droppedClassical > 0 ? ` <span class="text-info text-xs">(${droppedClassical} dropped)</span>` : '';
        parts.push(`<span class="text-info">${classicalPts}</span> C${droppedNote}`);
    }
    
    if (parts.length === 0) return '-';
    return parts.join(' + ');
}

// Format events count showing counted vs total
function formatEventsCount(player) {
    const total = player.events_total || player.events?.length || 0;
    const counted = player.events_counted || total;
    
    if (total === counted) {
        return `<span class="badge badge-ghost">${total}</span>`;
    }
    return `<span class="badge badge-ghost" title="${counted} of ${total} events counted">${counted}/${total}</span>`;
}

// Render standings table
function renderStandings(data) {
    const tbody = document.getElementById('standings-body');
    if (!data || !data.standings || data.standings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-base-content/50">
                    No standings data available yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.standings.map(player => `
        <tr class="hover">
            <td class="text-center font-bold">${formatPosition(player.position)}</td>
            <td>
                <div class="flex items-center gap-2">
                    ${formatTitle(player.title)}
                    <span class="font-medium">${player.name}</span>
                </div>
            </td>
            <td class="text-center">${formatRating(player.rating)}</td>
            <td class="text-center">
                ${formatEventsCount(player)}
            </td>
            <td class="text-center text-sm">
                ${formatPointsBreakdown(player)}
            </td>
            <td class="text-center">
                <span class="font-bold text-lg">${player.total_points}</span>
            </td>
        </tr>
    `).join('');
}

// Render events navigation
function renderEventsNav(events) {
    const nav = document.getElementById('nav-events');
    if (!nav || !events || events.length === 0) return;

    nav.innerHTML = events.map(event => `
        <li><a href="events/${event.event_id}.html">${event.name || event.event_id}</a></li>
    `).join('');
}

// Render events grid
function renderEventsGrid(events) {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    if (!events || events.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-8 text-base-content/50">
                No events recorded yet.
            </div>
        `;
        return;
    }

    grid.innerHTML = events.map(event => `
        <a href="events/${event.event_id}.html" class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
            <div class="card-body">
                <div class="flex justify-between items-start">
                    <span class="badge ${EVENT_TYPE_BADGES[event.event_type] || 'badge-ghost'}">${EVENT_TYPE_LABELS[event.event_type] || event.event_type}</span>
                    <span class="text-sm text-base-content/50">${formatDate(event.date)}</span>
                </div>
                <h3 class="card-title text-base mt-2">${event.name || event.event_id}</h3>
                <div class="flex gap-4 text-sm text-base-content/70 mt-2">
                    <span>${event.total_players} players</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Update stats cards
function updateStats(data) {
    if (!data) return;

    const statEvents = document.getElementById('stat-events');
    const statPlayers = document.getElementById('stat-players');
    const statLeader = document.getElementById('stat-leader');
    const statLeaderName = document.getElementById('stat-leader-name');

    if (statEvents && data.events) {
        statEvents.textContent = data.events.length;
    }

    if (statPlayers && data.standings) {
        statPlayers.textContent = data.standings.length;
    }

    if (statLeader && statLeaderName && data.standings && data.standings.length > 0) {
        const leader = data.standings[0];
        statLeader.textContent = leader.total_points;
        statLeaderName.textContent = leader.name;
    }
}

// Main load function for standings page
async function loadStandings() {
    const data = await loadJSON(`${DATA_PATH}/standings.json`);
    if (data) {
        renderStandings(data);
        renderEventsNav(data.events);
        renderEventsGrid(data.events);
        updateStats(data);
    }
}

// Format rounds played
function formatRoundsPlayed(player) {
    const played = player.rounds_played || 0;
    const total = player.total_rounds || played;
    return `${played}/${total}`;
}

// Check if player is eligible
function isPlayerEligible(player) {
    const cp = player.circuit_points;
    return cp.eligible !== false; // Default to true if not specified
}

// Render event results page
function renderEventResults(data) {
    // Update page title
    document.title = `${data.tournament.name} - Keshmat Circuit 2026`;

    // Update event header
    const header = document.getElementById('event-header');
    if (header) {
        header.innerHTML = `
            <div class="flex flex-wrap gap-2 items-center mb-2">
                <span class="badge ${EVENT_TYPE_BADGES[data.event_type] || 'badge-ghost'} badge-lg">${EVENT_TYPE_LABELS[data.event_type] || data.event_type}</span>
                <span class="badge badge-outline">${data.total_players} players</span>
                <span class="badge badge-outline">${data.tournament.rounds || '?'} rounds</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">${data.tournament.name}</h1>
            <p class="text-base-content/70">
                ${data.tournament.location || ''} ${data.tournament.date ? `- ${formatDate(data.tournament.date)}` : ''}
            </p>
        `;
    }

    // Render results table
    const tbody = document.getElementById('results-body');
    if (tbody) {
        tbody.innerHTML = data.results.map((player, idx) => {
            const cp = player.circuit_points;
            const eligible = isPlayerEligible(player);
            const rowClass = eligible ? 'hover' : 'opacity-50';
            const ineligibleBadge = !eligible ? '<span class="badge badge-error badge-sm ml-1">Ineligible</span>' : '';
            
            return `
                <tr class="${rowClass}">
                    <td class="text-center font-bold">${formatPosition(player.final_rank)}</td>
                    <td>
                        <div class="flex items-center gap-2 flex-wrap">
                            ${formatTitle(player.title)}
                            <span class="font-medium ${!eligible ? 'line-through' : ''}">${player.name}</span>
                            ${ineligibleBadge}
                        </div>
                    </td>
                    <td class="text-center">${formatRating(player.rating)}</td>
                    <td class="text-center font-medium">${player.points}</td>
                    <td class="text-center">
                        <span class="badge badge-sm ${!eligible ? 'badge-error' : 'badge-ghost'}">${formatRoundsPlayed(player)}</span>
                    </td>
                    <td class="text-center">
                        ${cp.percentile_band ? `<span class="badge badge-sm badge-ghost">${cp.percentile_band}</span>` : '-'}
                    </td>
                    <td class="text-center">${cp.placement}</td>
                    <td class="text-center ${cp.performance_bonus > 0 ? 'text-success' : ''}">${cp.performance_bonus > 0 ? '+' + cp.performance_bonus : '-'}</td>
                    <td class="text-center ${cp.participation > 0 ? 'text-info' : 'text-error'}">${cp.participation > 0 ? '+' + cp.participation : '0'}</td>
                    <td class="text-center">
                        <span class="font-bold text-lg">${cp.total}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update qualification note if rapid - only show eligible players
    const qualNote = document.getElementById('qualification-note');
    if (qualNote && data.event_type === 'rapid') {
        const eligiblePlayers = data.results.filter(p => isPlayerEligible(p));
        const top2 = eligiblePlayers.slice(0, 2);
        if (top2.length > 0) {
            qualNote.innerHTML = `
                <div class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <div class="font-bold">Qualified for Group A</div>
                        <div class="text-sm">${top2.map(p => p.name).join(' and ')}</div>
                    </div>
                </div>
            `;
        }
    }
}

// Load event page
async function loadEventPage(eventId, dataPath) {
    const basePath = dataPath || DATA_PATH;
    const data = await loadJSON(`${basePath}/events/${eventId}.json`);
    if (data) {
        renderEventResults(data);
    }

    // Also load standings for nav
    const standings = await loadJSON(`${basePath}/standings.json`);
    if (standings) {
        renderEventsNav(standings.events);
    }
}
