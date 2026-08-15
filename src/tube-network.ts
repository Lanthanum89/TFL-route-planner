// London Underground network model, routing algorithms, and data structures.
// TypeScript port of tube_network.py — same graph, same BFS algorithm.

export type Connection = [neighbor: string, line: string, time: number];
export type Leg = [line: string, start: string, end: string, stops: number];
/** A station reached during a route, paired with the line ridden to reach it (null for the starting station). */
export type Step = { station: string; line: string | null };

export class TubeNetwork {
    readonly graph: Record<string, Connection[]> = {};
    readonly lineColors: Record<string, string> = {
        Bakerloo: '#B36305',
        Central: '#E32017',
        Circle: '#FFD300',
        District: '#00782A',
        'Hammersmith & City': '#F3A9BB',
        Jubilee: '#A0A5A9',
        Metropolitan: '#9B0056',
        Northern: '#000000',
        Piccadilly: '#003688',
        Victoria: '#0098D4',
        'Waterloo & City': '#95CDBA',
        Elizabeth: '#7156A5',
        DLR: '#00A4A7',
        Overground: '#EE7C0E',
    };

    constructor() {
        this.buildNetwork();
    }

    private addConnection(a: string, b: string, line: string, time = 2): void {
        (this.graph[a] ??= []).push([b, line, time]);
        (this.graph[b] ??= []).push([a, line, time]);
    }

    private addLine(stations: string[], line: string): void {
        for (let i = 0; i < stations.length - 1; i++) {
            this.addConnection(stations[i], stations[i + 1], line);
        }
    }

    private buildNetwork(): void {
        this.addLine([
            'Brixton', 'Stockwell', 'Vauxhall', 'Pimlico', 'Victoria', 'Green Park', 'Oxford Circus',
            'Warren Street', 'Euston', "King's Cross St Pancras", 'Highbury & Islington', 'Finsbury Park', 'Seven Sisters', 'Tottenham Hale', 'Blackhorse Road', 'Walthamstow Central',
        ], 'Victoria');

        this.addLine([
            'West Ruislip', 'Northolt', 'Perivale', 'Hanger Lane', 'North Acton', 'East Acton', 'White City', "Shepherd's Bush",
            'Holland Park', 'Notting Hill Gate', 'Queensway', 'Lancaster Gate', 'Marble Arch', 'Bond Street', 'Oxford Circus', 'Tottenham Court Road', 'Holborn', 'Chancery Lane', "St. Paul's", 'Bank', 'Liverpool Street', 'Bethnal Green', 'Mile End', 'Stratford',
        ], 'Central');

        this.addLine([
            'Morden', 'Colliers Wood', 'Tooting Broadway', 'Tooting Bec', 'Balham', 'Clapham South', 'Clapham Common', 'Clapham North', 'Stockwell', 'Oval', 'Kennington', 'Elephant & Castle', 'Borough', 'London Bridge', 'Bank', 'Moorgate', 'Old Street', 'Angel', "King's Cross St Pancras", 'Euston', 'Camden Town',
        ], 'Northern');

        this.addLine([
            'Stratford', 'West Ham', 'Canning Town', 'North Greenwich', 'Canary Wharf', 'Canada Water', 'Bermondsey', 'London Bridge', 'Southwark', 'Waterloo', 'Westminster', 'Green Park', 'Bond Street', 'Baker Street',
        ], 'Jubilee');

        this.addLine([
            'Heathrow Terminals 2 & 3', 'Hatton Cross', 'Hounslow West', 'Boston Manor', 'Northfields', 'South Ealing', 'Acton Town', 'Hammersmith', 'Barons Court', "Earl's Court", 'Gloucester Road', 'South Kensington', 'Knightsbridge', 'Hyde Park Corner', 'Green Park', 'Piccadilly Circus', 'Leicester Square', 'Covent Garden', 'Holborn', 'Russell Square', "King's Cross St Pancras", 'Caledonian Road', 'Holloway Road', 'Arsenal', 'Finsbury Park', 'Manor House', 'Turnpike Lane', 'Wood Green', 'Bounds Green', 'Arnos Grove', 'Southgate', 'Oakwood', 'Cockfosters',
        ], 'Piccadilly');

        this.addLine([
            'Edgware Road', 'Paddington', 'Bayswater', 'Notting Hill Gate', 'High Street Kensington', 'Gloucester Road', 'South Kensington', 'Sloane Square', 'Victoria', "St. James's Park", 'Westminster', 'Embankment', 'Temple', 'Blackfriars', 'Mansion House', 'Cannon Street', 'Monument', 'Tower Hill', 'Aldgate', 'Liverpool Street', 'Moorgate', 'Barbican', 'Farringdon', "King's Cross St Pancras", 'Euston Square', 'Great Portland Street', 'Baker Street',
        ], 'Circle');

        this.addLine([
            'Upminster', 'Upminster Bridge', 'Hornchurch', 'Elm Park', 'Dagenham Heathway', 'Dagenham East', 'Becontree', 'Upney', 'Barking', 'East Ham', 'Upton Park', 'Plaistow', 'West Ham', 'Bromley-by-Bow', 'Bow Road', 'Mile End', 'Stepney Green', 'Whitechapel', 'Aldgate East', 'Tower Hill', 'Monument', 'Cannon Street', 'Mansion House', 'Blackfriars', 'Temple', 'Embankment', 'Westminster', "St. James's Park", 'Victoria', 'Sloane Square', 'South Kensington', 'Gloucester Road', "Earl's Court", 'West Kensington', 'Barons Court', 'Hammersmith',
        ], 'District');

        this.addLine([
            'Hammersmith', 'Goldhawk Road', "Shepherd's Bush Market", 'Wood Lane', 'Latimer Road', 'Ladbroke Grove', 'Westbourne Park', 'Royal Oak', 'Paddington', 'Edgware Road', 'Baker Street', 'Great Portland Street', 'Euston Square', "King's Cross St Pancras", 'Farringdon', 'Barbican', 'Moorgate', 'Liverpool Street', 'Aldgate East', 'Whitechapel', 'Stepney Green', 'Mile End', 'Bow Road', 'Bromley-by-Bow', 'West Ham', 'Plaistow', 'Upton Park', 'East Ham', 'Barking',
        ], 'Hammersmith & City');

        this.addLine([
            'Aldgate', 'Liverpool Street', 'Moorgate', 'Barbican', 'Farringdon', "King's Cross St Pancras", 'Euston Square', 'Great Portland Street', 'Baker Street', 'Finchley Road', 'Wembley Park', 'Preston Road', 'Northwick Park', 'Harrow-on-the-Hill', 'North Harrow', 'Pinner', 'Northwood Hills', 'Northwood', 'Moor Park', 'Rickmansworth', 'Chorleywood', 'Chalfont & Latimer', 'Amersham',
        ], 'Metropolitan');

        this.addLine([
            'Harrow & Wealdstone', 'Kenton', 'South Kenton', 'North Wembley', 'Wembley Central', 'Stonebridge Park', 'Harlesden', 'Willesden Junction', 'Kensal Green', "Queen's Park", 'Kilburn Park', 'Maida Vale', 'Warwick Avenue', 'Paddington', 'Edgware Road', 'Marylebone', 'Baker Street', "Regent's Park", 'Oxford Circus', 'Piccadilly Circus', 'Charing Cross', 'Embankment', 'Waterloo', 'Lambeth North', 'Elephant & Castle',
        ], 'Bakerloo');

        this.addLine(['Waterloo', 'Bank'], 'Waterloo & City');

        this.addLine([
            'Paddington', 'Bond Street', 'Tottenham Court Road', 'Farringdon', 'Liverpool Street', 'Whitechapel', 'Canary Wharf', 'Custom House', 'Woolwich',
        ], 'Elizabeth');

        // Additional interchange walking links
        this.addConnection('Euston', 'Euston Square', 'Walk', 5);
        this.addConnection('Bank', 'Monument', 'Walk', 5);
        this.addConnection('Paddington', 'Edgware Road', 'Walk', 7);
        this.addConnection('Tottenham Court Road', 'Goodge Street', 'Walk', 6);
        this.addConnection('Leicester Square', 'Charing Cross', 'Walk', 4);
        this.addConnection('Green Park', 'Hyde Park Corner', 'Walk', 5);
        this.addConnection('Bond Street', 'Oxford Circus', 'Walk', 4);
    }

    getAllStations(): string[] {
        return Object.keys(this.graph).sort();
    }

    getStationLines(station: string): string[] {
        const lines = new Set<string>();
        for (const [, line] of this.graph[station] ?? []) {
            if (line !== 'Walk') lines.add(line);
        }
        return [...lines].sort();
    }

    /** Extra cost (minutes) applied whenever a route changes line at a station. */
    static readonly INTERCHANGE_PENALTY = 5;

    /**
     * Find the fastest route using Dijkstra over (station, arrival line) states,
     * charging an interchange penalty whenever the line changes. Plain BFS on
     * stations alone would treat line changes as free and could "optimize" a
     * 3-stop, 2-interchange route over a slower but direct single-line one.
     *
     * Returns the exact line ridden for each hop (not just the station names) so
     * that leg-building never has to guess which line was used when several
     * lines happen to connect the same pair of adjacent stations.
     */
    findRoute(start: string, end: string): Step[] | null {
        if (!this.graph[start] || !this.graph[end]) return null;
        if (start === end) return [{ station: start, line: null }];

        // `committedLine` is the last *real* line ridden (never 'Walk'), used only to
        // decide whether boarding the next real line is a genuine interchange. Walking
        // edges pass it through unchanged: their own time already prices in the
        // transfer, so they neither trigger a penalty themselves nor shield a real
        // line change on either side of them from being charged exactly once.
        type State = { station: string; committedLine: string };
        type PrevEntry = { state: State; edgeLine: string };
        const stateKey = (s: State): string => JSON.stringify([s.station, s.committedLine]);

        const dist = new Map<string, number>();
        const prev = new Map<string, PrevEntry | null>();
        const stateOf = new Map<string, State>();

        const startState: State = { station: start, committedLine: '' };
        const startKey = stateKey(startState);
        dist.set(startKey, 0);
        prev.set(startKey, null);
        stateOf.set(startKey, startState);

        const frontier: string[] = [startKey];
        let endKey: string | null = null;

        while (frontier.length > 0) {
            let minIdx = 0;
            for (let i = 1; i < frontier.length; i++) {
                if ((dist.get(frontier[i]) ?? Infinity) < (dist.get(frontier[minIdx]) ?? Infinity)) minIdx = i;
            }
            const currentKey = frontier.splice(minIdx, 1)[0];
            const currentDist = dist.get(currentKey)!;
            const current = stateOf.get(currentKey)!;

            if (current.station === end) {
                endKey = currentKey;
                break;
            }

            for (const [neighbor, line, time] of this.graph[current.station] ?? []) {
                const isWalk = line === 'Walk';
                const newCommittedLine = isWalk ? current.committedLine : line;
                const isRealChange = !isWalk && current.committedLine !== '' && line !== current.committedLine;
                const penalty = isRealChange ? TubeNetwork.INTERCHANGE_PENALTY : 0;
                const newDist = currentDist + time + penalty;
                const neighborState: State = { station: neighbor, committedLine: newCommittedLine };
                const neighborKey = stateKey(neighborState);
                if (newDist < (dist.get(neighborKey) ?? Infinity)) {
                    dist.set(neighborKey, newDist);
                    prev.set(neighborKey, { state: current, edgeLine: line });
                    stateOf.set(neighborKey, neighborState);
                    frontier.push(neighborKey);
                }
            }
        }

        if (endKey === null) return null;

        const path: Step[] = [];
        let curKey: string | null = endKey;
        while (curKey !== null) {
            const curState = stateOf.get(curKey)!;
            const p: PrevEntry | null = prev.get(curKey) ?? null;
            path.push({ station: curState.station, line: p ? p.edgeLine : null });
            curKey = p ? stateKey(p.state) : null;
        }
        path.reverse();
        return path;
    }

    /** Generate human-readable leg descriptions with line changes. */
    getRouteDetails(route: Step[]): string[] {
        if (!route || route.length < 2) return [];

        return this.getRouteLegs(route).map(([line, start, end, stops]) => {
            if (line === 'Walk') return `Walk from ${start} to ${end} (${stops} stops)`;
            return `Take ${line} Line from ${start} to ${end} (${stops} stops)`;
        });
    }

    /**
     * Return a structured list of legs as [line, startStation, endStation, stops].
     * Uses the exact line each step recorded during the search — no re-derivation
     * from the graph, so it can't disagree with the route the search actually found.
     */
    getRouteLegs(route: Step[]): Leg[] {
        if (!route || route.length < 2) return [];

        const legs: Leg[] = [];
        let legStartIdx = 0;

        for (let i = 2; i <= route.length; i++) {
            const legLine = route[legStartIdx + 1].line;
            const edgeLine = i < route.length ? route[i].line : null;
            if (edgeLine !== legLine) {
                const start = route[legStartIdx].station;
                const end = route[i - 1].station;
                const stops = (i - 1) - legStartIdx;
                legs.push([legLine ?? 'Unknown', start, end, stops]);
                legStartIdx = i - 1;
            }
        }

        return legs;
    }
}
