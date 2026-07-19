// London Underground network model, routing algorithms, and data structures.
// Direct port of tube_network.py — same graph, same BFS algorithm.

class TubeNetwork {
    constructor() {
        this.graph = {}; // station -> [ [neighbor, line, time], ... ]
        this.lineColors = {
            'Bakerloo': '#B36305',
            'Central': '#E32017',
            'Circle': '#FFD300',
            'District': '#00782A',
            'Hammersmith & City': '#F3A9BB',
            'Jubilee': '#A0A5A9',
            'Metropolitan': '#9B0056',
            'Northern': '#000000',
            'Piccadilly': '#003688',
            'Victoria': '#0098D4',
            'Waterloo & City': '#95CDBA',
            'Elizabeth': '#7156A5',
            'DLR': '#00A4A7',
            'Overground': '#EE7C0E'
        };

        this._buildNetwork();
    }

    _addConnection(a, b, line, time = 2) {
        if (!this.graph[a]) this.graph[a] = [];
        if (!this.graph[b]) this.graph[b] = [];
        this.graph[a].push([b, line, time]);
        this.graph[b].push([a, line, time]);
    }

    _addLine(stations, line) {
        for (let i = 0; i < stations.length - 1; i++) {
            this._addConnection(stations[i], stations[i + 1], line);
        }
    }

    _buildNetwork() {
        this._addLine([
            'Brixton', 'Stockwell', 'Vauxhall', 'Pimlico', 'Victoria', 'Green Park', 'Oxford Circus',
            'Warren Street', 'Euston', "King's Cross St Pancras", 'Highbury & Islington', 'Finsbury Park', 'Seven Sisters', 'Tottenham Hale', 'Blackhorse Road', 'Walthamstow Central'
        ], 'Victoria');

        this._addLine([
            'West Ruislip', 'Northolt', 'Perivale', 'Hanger Lane', 'North Acton', 'East Acton', 'White City', "Shepherd's Bush",
            'Holland Park', 'Notting Hill Gate', 'Queensway', 'Lancaster Gate', 'Marble Arch', 'Bond Street', 'Oxford Circus', 'Tottenham Court Road', 'Holborn', 'Chancery Lane', "St. Paul's", 'Bank', 'Liverpool Street', 'Bethnal Green', 'Mile End', 'Stratford'
        ], 'Central');

        this._addLine([
            'Morden', 'Colliers Wood', 'Tooting Broadway', 'Tooting Bec', 'Balham', 'Clapham South', 'Clapham Common', 'Clapham North', 'Stockwell', 'Oval', 'Kennington', 'Elephant & Castle', 'Borough', 'London Bridge', 'Bank', 'Moorgate', 'Old Street', 'Angel', "King's Cross St Pancras", 'Euston', 'Camden Town'
        ], 'Northern');

        this._addLine([
            'Stratford', 'West Ham', 'Canning Town', 'North Greenwich', 'Canary Wharf', 'Canada Water', 'Bermondsey', 'London Bridge', 'Southwark', 'Waterloo', 'Westminster', 'Green Park', 'Bond Street', 'Baker Street'
        ], 'Jubilee');

        this._addLine([
            'Heathrow Terminals 2 & 3', 'Hatton Cross', 'Hounslow West', 'Boston Manor', 'Northfields', 'South Ealing', 'Acton Town', 'Hammersmith', 'Barons Court', "Earl's Court", 'Gloucester Road', 'South Kensington', 'Knightsbridge', 'Hyde Park Corner', 'Green Park', 'Piccadilly Circus', 'Leicester Square', 'Covent Garden', 'Holborn', 'Russell Square', "King's Cross St Pancras", 'Caledonian Road', 'Holloway Road', 'Arsenal', 'Finsbury Park', 'Manor House', 'Turnpike Lane', 'Wood Green', 'Bounds Green', 'Arnos Grove', 'Southgate', 'Oakwood', 'Cockfosters'
        ], 'Piccadilly');

        this._addLine([
            'Edgware Road', 'Paddington', 'Bayswater', 'Notting Hill Gate', 'High Street Kensington', 'Gloucester Road', 'South Kensington', 'Sloane Square', 'Victoria', "St. James's Park", 'Westminster', 'Embankment', 'Temple', 'Blackfriars', 'Mansion House', 'Cannon Street', 'Monument', 'Tower Hill', 'Aldgate', 'Liverpool Street', 'Moorgate', 'Barbican', 'Farringdon', "King's Cross St Pancras", 'Euston Square', 'Great Portland Street', 'Baker Street'
        ], 'Circle');

        this._addLine([
            'Upminster', 'Upminster Bridge', 'Hornchurch', 'Elm Park', 'Dagenham Heathway', 'Dagenham East', 'Becontree', 'Upney', 'Barking', 'East Ham', 'Upton Park', 'Plaistow', 'West Ham', 'Bromley-by-Bow', 'Bow Road', 'Mile End', 'Stepney Green', 'Whitechapel', 'Aldgate East', 'Tower Hill', 'Monument', 'Cannon Street', 'Mansion House', 'Blackfriars', 'Temple', 'Embankment', 'Westminster', "St. James's Park", 'Victoria', 'Sloane Square', 'South Kensington', 'Gloucester Road', "Earl's Court", 'West Kensington', 'Barons Court', 'Hammersmith'
        ], 'District');

        this._addLine([
            'Hammersmith', 'Goldhawk Road', "Shepherd's Bush Market", 'Wood Lane', 'Latimer Road', 'Ladbroke Grove', 'Westbourne Park', 'Royal Oak', 'Paddington', 'Edgware Road', 'Baker Street', 'Great Portland Street', 'Euston Square', "King's Cross St Pancras", 'Farringdon', 'Barbican', 'Moorgate', 'Liverpool Street', 'Aldgate East', 'Whitechapel', 'Stepney Green', 'Mile End', 'Bow Road', 'Bromley-by-Bow', 'West Ham', 'Plaistow', 'Upton Park', 'East Ham', 'Barking'
        ], 'Hammersmith & City');

        this._addLine([
            'Aldgate', 'Liverpool Street', 'Moorgate', 'Barbican', 'Farringdon', "King's Cross St Pancras", 'Euston Square', 'Great Portland Street', 'Baker Street', 'Finchley Road', 'Wembley Park', 'Preston Road', 'Northwick Park', 'Harrow-on-the-Hill', 'North Harrow', 'Pinner', 'Northwood Hills', 'Northwood', 'Moor Park', 'Rickmansworth', 'Chorleywood', 'Chalfont & Latimer', 'Amersham'
        ], 'Metropolitan');

        this._addLine([
            'Harrow & Wealdstone', 'Kenton', 'South Kenton', 'North Wembley', 'Wembley Central', 'Stonebridge Park', 'Harlesden', 'Willesden Junction', 'Kensal Green', "Queen's Park", 'Kilburn Park', 'Maida Vale', 'Warwick Avenue', 'Paddington', 'Edgware Road', 'Marylebone', 'Baker Street', "Regent's Park", 'Oxford Circus', 'Piccadilly Circus', 'Charing Cross', 'Embankment', 'Waterloo', 'Lambeth North', 'Elephant & Castle'
        ], 'Bakerloo');

        this._addLine(['Waterloo', 'Bank'], 'Waterloo & City');

        this._addLine([
            'Paddington', 'Bond Street', 'Tottenham Court Road', 'Farringdon', 'Liverpool Street', 'Whitechapel', 'Canary Wharf', 'Custom House', 'Woolwich'
        ], 'Elizabeth');

        // Additional interchange walking links
        this._addConnection('Euston', 'Euston Square', 'Walk', 5);
        this._addConnection('Bank', 'Monument', 'Walk', 5);
        this._addConnection('Paddington', 'Edgware Road', 'Walk', 7);
        this._addConnection('Tottenham Court Road', 'Goodge Street', 'Walk', 6);
        this._addConnection('Leicester Square', 'Charing Cross', 'Walk', 4);
        this._addConnection('Green Park', 'Hyde Park Corner', 'Walk', 5);
        this._addConnection('Bond Street', 'Oxford Circus', 'Walk', 4);
    }

    getAllStations() {
        return Object.keys(this.graph).sort();
    }

    getStationLines(station) {
        const lines = new Set();
        for (const [, line] of this.graph[station] || []) {
            if (line !== 'Walk') lines.add(line);
        }
        return [...lines].sort();
    }

    /** Find shortest-stop route using BFS (minimizes number of hops). */
    findRoute(start, end) {
        if (!this.graph[start] || !this.graph[end]) return null;

        const queue = [start];
        let head = 0;
        const visited = new Set([start]);
        const parent = { [start]: null };

        while (head < queue.length) {
            const current = queue[head++];
            if (current === end) break;
            for (const [neighbor] of this.graph[current]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent[neighbor] = current;
                    queue.push(neighbor);
                }
            }
        }

        if (!(end in parent)) return null;

        const path = [];
        let node = end;
        while (node !== null) {
            path.push(node);
            node = parent[node];
        }
        path.reverse();
        return path;
    }

    /** Generate human-readable leg descriptions with line changes. */
    getRouteDetails(route) {
        if (!route || route.length < 2) return [];

        return this.getRouteLegs(route).map(([line, start, end, stops]) => {
            if (line === 'Walk') return `Walk from ${start} to ${end} (${stops} stops)`;
            return `Take ${line} Line from ${start} to ${end} (${stops} stops)`;
        });
    }

    /** Return a structured list of legs as [line, startStation, endStation, stops]. */
    getRouteLegs(route) {
        if (!route || route.length < 2) return [];

        const lineBetween = (a, b) => {
            for (const [neighbor, line] of this.graph[a]) {
                if (neighbor === b) return line;
            }
            return null;
        };

        const legs = [];
        let currentLine = null;
        let legStartIdx = 0;

        for (let i = 0; i < route.length - 1; i++) {
            const a = route[i];
            const b = route[i + 1];
            const line = lineBetween(a, b);
            if (line === null) continue;
            if (currentLine === null) currentLine = line;
            if (line !== currentLine) {
                const start = route[legStartIdx];
                const end = a;
                const stops = i - legStartIdx;
                legs.push([currentLine, start, end, stops]);
                legStartIdx = i;
                currentLine = line;
            }
        }

        const start = route[legStartIdx];
        const end = route[route.length - 1];
        const stops = (route.length - 1) - legStartIdx;
        legs.push([currentLine || 'Unknown', start, end, stops]);

        return legs;
    }
}
