import './style.css';
import { TubeNetwork, type Step } from './tube-network';

const network = new TubeNetwork();

const fromInput = document.getElementById('from-station') as HTMLInputElement;
const toInput = document.getElementById('to-station') as HTMLInputElement;
const stationList = document.getElementById('station-list') as HTMLDataListElement;
const swapButton = document.getElementById('swap-button') as HTMLButtonElement;
const planButton = document.getElementById('plan-button') as HTMLButtonElement;
const clearButton = document.getElementById('clear-button') as HTMLButtonElement;
const optInterchanges = document.getElementById('opt-interchanges') as HTMLInputElement;
const optSteps = document.getElementById('opt-steps') as HTMLInputElement;
const optColorize = document.getElementById('opt-colorize') as HTMLInputElement;
const resultsBody = document.getElementById('results-body') as HTMLDivElement;
const statusEl = document.getElementById('status-text') as HTMLElement;
const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

function populateStations(): void {
    stationList.innerHTML = '';
    for (const station of network.getAllStations()) {
        const option = document.createElement('option');
        option.value = station;
        stationList.appendChild(option);
    }
}

function setStatus(text: string): void {
    statusEl.textContent = text;
}

function contrastTextColor(hexColor: string): string {
    try {
        const hc = hexColor.replace('#', '');
        const r = parseInt(hc.substring(0, 2), 16);
        const g = parseInt(hc.substring(2, 4), 16);
        const b = parseInt(hc.substring(4, 6), 16);
        const srgb = (c: number) => {
            const v = c / 255;
            return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        const L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
        return L > 0.6 ? '#000000' : '#FFFFFF';
    } catch {
        return '#FFFFFF';
    }
}

function lineColor(lineName: string): string {
    return lineName === 'Walk' ? '#888888' : (network.lineColors[lineName] ?? '#666666');
}

function showEmptyState(): void {
    resultsBody.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🚇</div>
            <p><strong>Plan your journey</strong></p>
            <p>Pick a start and destination station, then hit Plan route to see colour-coded
            line-by-line directions and interchange points.</p>
        </div>
    `;
}

function showNoRoute(): void {
    resultsBody.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🚫</div>
            <p><strong>No route found</strong></p>
            <p>These two stations aren't connected in the current network data.</p>
        </div>
    `;
}

function displayRoute(route: Step[], fromStation: string, toStation: string): void {
    const totalStops = route.length - 1;
    const estimatedTime = totalStops * 2;
    const legs = network.getRouteLegs(route);
    const interchangeCount = route.slice(1, -1).filter((s) => network.getStationLines(s.station).length > 1).length;

    resultsBody.innerHTML = '';

    const journeyTitle = document.createElement('p');
    journeyTitle.className = 'journey-title';
    journeyTitle.innerHTML = `Journey from <strong>${fromStation}</strong> to <strong>${toStation}</strong>`;
    resultsBody.appendChild(journeyTitle);

    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    statRow.innerHTML = [
        [String(totalStops), 'Stops'],
        [`${estimatedTime} min`, 'Est. time'],
        [String(interchangeCount), 'Interchanges'],
    ].map(([value, label]) => `
        <div class="stat-tile">
            <span class="value">${value}</span>
            <span class="label">${label}</span>
        </div>
    `).join('');
    resultsBody.appendChild(statRow);

    const legsLabel = document.createElement('p');
    legsLabel.className = 'section-label';
    legsLabel.textContent = 'Route';
    resultsBody.appendChild(legsLabel);

    const legsRow = document.createElement('div');
    legsRow.className = 'legs';
    legs.forEach(([lineName, legStart, legEnd, stops]) => {
        const chip = document.createElement('span');
        chip.className = 'leg-chip';
        const text = lineName === 'Walk'
            ? `Walk · ${legStart} → ${legEnd} (${stops})`
            : `${lineName} · ${legStart} → ${legEnd} (${stops})`;

        if (optColorize.checked) {
            const bg = lineColor(lineName);
            chip.style.backgroundColor = bg;
            chip.style.color = contrastTextColor(bg);
        } else {
            chip.style.backgroundColor = 'var(--surface-muted)';
            chip.style.color = 'var(--text)';
        }
        chip.innerHTML = `<span class="dot"></span>${text}`;
        legsRow.appendChild(chip);
    });
    resultsBody.appendChild(legsRow);

    if (optSteps.checked) {
        const stepsLabel = document.createElement('p');
        stepsLabel.className = 'section-label';
        stepsLabel.textContent = 'Step-by-step directions';
        resultsBody.appendChild(stepsLabel);

        const timeline = document.createElement('div');
        timeline.className = 'timeline';

        route.forEach((step, i) => {
            const item = document.createElement('div');
            const lines = network.getStationLines(step.station);
            const isStart = i === 0;
            const isEnd = i === route.length - 1;
            const isInterchange = !isStart && !isEnd && lines.length > 1 && optInterchanges.checked;

            item.className = 'timeline-item' + (isStart ? ' start' : isEnd ? ' end' : isInterchange ? ' interchange' : '');
            item.innerHTML = `<span class="dot"></span><span class="station-name">${step.station}</span>`;

            if (isStart) {
                item.innerHTML += '<div class="meta">🚀 Board here</div>';
            } else if (isEnd) {
                item.innerHTML += '<div class="meta">🎯 Alight here</div>';
            } else if (isInterchange) {
                const badges = lines.map((l) => {
                    const bg = lineColor(l);
                    return `<span class="line-badge" style="background:${bg};color:${contrastTextColor(bg)}">${l}</span>`;
                }).join('');
                item.innerHTML += `<div class="meta">🔄 Interchange</div><div class="line-badges">${badges}</div>`;
            }

            timeline.appendChild(item);
        });

        resultsBody.appendChild(timeline);
    }

    const tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = '💡 Check TfL for live service updates — future versions will include live API integration.';
    resultsBody.appendChild(tip);
}

function planRoute(): void {
    const fromStation = fromInput.value.trim();
    const toStation = toInput.value.trim();

    if (!fromStation || !toStation) {
        alert('Please select both starting and destination stations.');
        return;
    }

    if (fromStation === toStation) {
        alert('Starting and destination stations are the same!');
        return;
    }

    const allStations = network.getAllStations();
    if (!allStations.includes(fromStation)) {
        alert(`Starting station '${fromStation}' not found.`);
        return;
    }
    if (!allStations.includes(toStation)) {
        alert(`Destination station '${toStation}' not found.`);
        return;
    }

    setStatus('Planning route…');

    const route = network.findRoute(fromStation, toStation);
    if (route) {
        displayRoute(route, fromStation, toStation);
        setStatus(`Route found: ${route.length} stations`);
    } else {
        showNoRoute();
        setStatus('No route found');
    }
}

function swapStations(): void {
    const fromStation = fromInput.value;
    const toStation = toInput.value;
    fromInput.value = toStation;
    toInput.value = fromStation;

    setStatus(fromStation && toStation ? `Swapped: ${toStation} ⇄ ${fromStation}` : 'Stations swapped');
}

function clearRoute(): void {
    fromInput.value = '';
    toInput.value = '';
    showEmptyState();
    setStatus('Route cleared — ready for a new search');
}

function initTheme(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
    }

    themeToggle.addEventListener('click', () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const current = document.documentElement.getAttribute('data-theme') ?? (prefersDark ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

planButton.addEventListener('click', planRoute);
clearButton.addEventListener('click', clearRoute);
swapButton.addEventListener('click', swapStations);

populateStations();
showEmptyState();
initTheme();
