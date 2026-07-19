// London Underground Route Planner — browser UI logic.
// Port of the tkinter LondonUndergroundApp interaction logic in main.py.

(function () {
    const network = new TubeNetwork();

    const fromInput = document.getElementById('from-station');
    const toInput = document.getElementById('to-station');
    const stationList = document.getElementById('station-list');
    const swapButton = document.getElementById('swap-button');
    const planButton = document.getElementById('plan-button');
    const clearButton = document.getElementById('clear-button');
    const optInterchanges = document.getElementById('opt-interchanges');
    const optSteps = document.getElementById('opt-steps');
    const optColorize = document.getElementById('opt-colorize');
    const summaryEl = document.getElementById('summary');
    const outputEl = document.getElementById('route-output');
    const statusEl = document.getElementById('status-text');

    function populateStations() {
        const stations = network.getAllStations();
        stationList.innerHTML = '';
        for (const station of stations) {
            const option = document.createElement('option');
            option.value = station;
            stationList.appendChild(option);
        }
    }

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function contrastTextColor(hexColor) {
        try {
            const hc = hexColor.replace('#', '');
            const r = parseInt(hc.substring(0, 2), 16);
            const g = parseInt(hc.substring(2, 4), 16);
            const b = parseInt(hc.substring(4, 6), 16);
            const srgb = (c) => {
                c = c / 255;
                return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            };
            const L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
            return L > 0.6 ? '#000000' : '#FFFFFF';
        } catch {
            return '#FFFFFF';
        }
    }

    function showWelcomeMessage() {
        outputEl.textContent = `Welcome to the London Underground Route Planner! 🚇

Features:
• Plan routes between any two London Underground stations
• View step-by-step directions with line information
• See interchange points and walking times
• Estimated journey times included

Instructions:
1. Select your starting station from the 'From' field
2. Select your destination station from the 'To' field
3. Click 'Plan Route' to find the best route
4. View detailed directions in this area

Tips:
• Start typing in a field to filter station names
• Check the options below for additional route information
• Future versions will include live service updates via TfL API

Ready to plan your journey?`;
    }

    function displayRoute(route, fromStation, toStation) {
        outputEl.innerHTML = '';
        summaryEl.hidden = false;

        const totalStops = route.length - 1;
        const estimatedTime = totalStops * 2;
        summaryEl.textContent = `Journey from ${fromStation} to ${toStation}\nTotal stops: ${totalStops} | Estimated time: ${estimatedTime} minutes`;
        summaryEl.style.whiteSpace = 'pre-wrap';

        const header = document.createElement('div');
        header.textContent = '🚇 ROUTE DETAILS\n' + '='.repeat(50) + '\n';
        outputEl.appendChild(header);

        const legs = network.getRouteLegs(route);
        legs.forEach(([lineName, legStart, legEnd, stops], i) => {
            const legLine = document.createElement('span');
            legLine.className = 'route-leg';
            legLine.textContent = lineName === 'Walk'
                ? `${i + 1}. Walk from ${legStart} to ${legEnd} (${stops} stops)`
                : `${i + 1}. Take ${lineName} Line from ${legStart} to ${legEnd} (${stops} stops)`;

            if (optColorize.checked) {
                const bg = lineName === 'Walk' ? '#888888' : (network.lineColors[lineName] || '#666666');
                legLine.style.backgroundColor = bg;
                legLine.style.color = contrastTextColor(bg);
            }
            outputEl.appendChild(legLine);
        });

        if (optSteps.checked) {
            const stepsHeader = document.createElement('div');
            stepsHeader.textContent = '\n' + '='.repeat(50) + '\nSTEP-BY-STEP DIRECTIONS:\n';
            outputEl.appendChild(stepsHeader);

            route.forEach((station, i) => {
                const line = document.createElement('div');
                if (i === 0) {
                    line.textContent = `🚀 START: Board at ${station}`;
                } else if (i === route.length - 1) {
                    line.textContent = `🎯 END: Alight at ${station}`;
                } else {
                    const lines = network.getStationLines(station);
                    if (lines.length > 1 && optInterchanges.checked) {
                        line.textContent = `🔄 INTERCHANGE: ${station} (Lines: ${lines.join(', ')})`;
                    } else {
                        line.textContent = `   → ${station}`;
                    }
                }
                outputEl.appendChild(line);
            });
        }

        const footer = document.createElement('div');
        footer.textContent = '\n' + '='.repeat(50) + '\n💡 TIP: Check TfL website for live service updates\n🌐 Future version will include live API integration';
        outputEl.appendChild(footer);
    }

    function planRoute() {
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

        setStatus('Planning route...');

        const route = network.findRoute(fromStation, toStation);
        if (route) {
            displayRoute(route, fromStation, toStation);
            setStatus(`Route found: ${route.length} stations`);
        } else {
            summaryEl.hidden = true;
            outputEl.textContent = 'No route found between these stations.';
            setStatus('No route found');
        }
    }

    function swapStations() {
        const fromStation = fromInput.value;
        const toStation = toInput.value;
        fromInput.value = toStation;
        toInput.value = fromStation;

        if (fromStation && toStation) {
            setStatus(`Swapped: ${toStation} ⇄ ${fromStation}`);
        } else {
            setStatus('Stations swapped');
        }
    }

    function clearRoute() {
        fromInput.value = '';
        toInput.value = '';
        summaryEl.hidden = true;
        showWelcomeMessage();
        setStatus('Route cleared - Ready for new search');
    }

    planButton.addEventListener('click', planRoute);
    clearButton.addEventListener('click', clearRoute);
    swapButton.addEventListener('click', swapStations);

    populateStations();
    showWelcomeMessage();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js').catch(() => {
                // Offline support is a progressive enhancement; ignore registration failures.
            });
        });
    }
})();
