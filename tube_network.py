from typing import Dict, List, Tuple, Optional
from collections import defaultdict, deque

# Simple representation of the London Underground network
# This is a curated subset sufficient for demo purposes and can be expanded.
# Structure: graph[station] = list of (neighbor_station, line_name, travel_time_minutes)

class TubeNetwork:
    def __init__(self):
        self.graph = defaultdict(list)  # type: Dict[str, List[Tuple[str, str, int]]]
        self.line_colors = {
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
        }
        
        self._build_network()
        
    def _add_connection(self, a: str, b: str, line: str, time: int = 2):
        self.graph[a].append((b, line, time))
        self.graph[b].append((a, line, time))
        
    def _build_network(self):
        # Minimal but useful network sample; can be extended without changing algorithm
        # Victoria Line
        victoria = [
            'Brixton','Stockwell','Vauxhall','Pimlico','Victoria','Green Park','Oxford Circus',
            'Warren Street','Euston','King\'s Cross St Pancras','Highbury & Islington','Finsbury Park','Seven Sisters','Tottenham Hale','Blackhorse Road','Walthamstow Central'
        ]
        for i in range(len(victoria)-1):
            self._add_connection(victoria[i], victoria[i+1], 'Victoria')
        
        # Central Line (partial)
        central = [
            'West Ruislip','Northolt','Perivale','Hanger Lane','North Acton','East Acton','White City','Shepherd\'s Bush',
            'Holland Park','Notting Hill Gate','Queensway','Lancaster Gate','Marble Arch','Bond Street','Oxford Circus','Tottenham Court Road','Holborn','Chancery Lane','St. Paul\'s','Bank','Liverpool Street','Bethnal Green','Mile End','Stratford'
        ]
        for i in range(len(central)-1):
            self._add_connection(central[i], central[i+1], 'Central')
        
        # Northern Line (partial)
        northern = [
            'Morden','Colliers Wood','Tooting Broadway','Tooting Bec','Balham','Clapham South','Clapham Common','Clapham North','Stockwell','Oval','Kennington','Elephant & Castle','Borough','London Bridge','Bank','Moorgate','Old Street','Angel','King\'s Cross St Pancras','Euston','Camden Town'
        ]
        for i in range(len(northern)-1):
            self._add_connection(northern[i], northern[i+1], 'Northern')
        
        # Jubilee Line (partial)
        jubilee = [
            'Stratford','West Ham','Canning Town','North Greenwich','Canary Wharf','Canada Water','Bermondsey','London Bridge','Southwark','Waterloo','Westminster','Green Park','Bond Street','Baker Street'
        ]
        for i in range(len(jubilee)-1):
            self._add_connection(jubilee[i], jubilee[i+1], 'Jubilee')
        
        # Piccadilly Line (extended)
        piccadilly = [
            'Heathrow Terminals 2 & 3','Hatton Cross','Hounslow West','Boston Manor','Northfields','South Ealing','Acton Town','Hammersmith','Barons Court','Earl\'s Court','Gloucester Road','South Kensington','Knightsbridge','Hyde Park Corner','Green Park','Piccadilly Circus','Leicester Square','Covent Garden','Holborn','Russell Square','King\'s Cross St Pancras','Caledonian Road','Holloway Road','Arsenal','Finsbury Park','Manor House','Turnpike Lane','Wood Green','Bounds Green','Arnos Grove','Southgate','Oakwood','Cockfosters'
        ]
        for i in range(len(piccadilly)-1):
            self._add_connection(piccadilly[i], piccadilly[i+1], 'Piccadilly')
        
        # Circle Line (core central loop, partial)
        circle = [
            'Edgware Road','Paddington','Bayswater','Notting Hill Gate','High Street Kensington','Gloucester Road','South Kensington','Sloane Square','Victoria','St. James\'s Park','Westminster','Embankment','Temple','Blackfriars','Mansion House','Cannon Street','Monument','Tower Hill','Aldgate','Liverpool Street','Moorgate','Barbican','Farringdon','King\'s Cross St Pancras','Euston Square','Great Portland Street','Baker Street'
        ]
        for i in range(len(circle)-1):
            self._add_connection(circle[i], circle[i+1], 'Circle')
        
        # District Line (extended coverage)
        district = [
            'Upminster','Upminster Bridge','Hornchurch','Elm Park','Dagenham Heathway','Dagenham East','Becontree','Upney','Barking','East Ham','Upton Park','Plaistow','West Ham','Bromley-by-Bow','Bow Road','Mile End','Stepney Green','Whitechapel','Aldgate East','Tower Hill','Monument','Cannon Street','Mansion House','Blackfriars','Temple','Embankment','Westminster','St. James\'s Park','Victoria','Sloane Square','South Kensington','Gloucester Road','Earl\'s Court','West Kensington','Barons Court','Hammersmith'
        ]
        for i in range(len(district)-1):
            self._add_connection(district[i], district[i+1], 'District')
        
        # Hammersmith & City Line
        hammersmith_city = [
            'Hammersmith','Goldhawk Road','Shepherd\'s Bush Market','Wood Lane','Latimer Road','Ladbroke Grove','Westbourne Park','Royal Oak','Paddington','Edgware Road','Baker Street','Great Portland Street','Euston Square','King\'s Cross St Pancras','Farringdon','Barbican','Moorgate','Liverpool Street','Aldgate East','Whitechapel','Stepney Green','Mile End','Bow Road','Bromley-by-Bow','West Ham','Plaistow','Upton Park','East Ham','Barking'
        ]
        for i in range(len(hammersmith_city)-1):
            self._add_connection(hammersmith_city[i], hammersmith_city[i+1], 'Hammersmith & City')
        
        # Metropolitan Line (main route)
        metropolitan = [
            'Aldgate','Liverpool Street','Moorgate','Barbican','Farringdon','King\'s Cross St Pancras','Euston Square','Great Portland Street','Baker Street','Finchley Road','Wembley Park','Preston Road','Northwick Park','Harrow-on-the-Hill','North Harrow','Pinner','Northwood Hills','Northwood','Moor Park','Rickmansworth','Chorleywood','Chalfont & Latimer','Amersham'
        ]
        for i in range(len(metropolitan)-1):
            self._add_connection(metropolitan[i], metropolitan[i+1], 'Metropolitan')
        
        # Bakerloo Line
        bakerloo = [
            'Harrow & Wealdstone','Kenton','South Kenton','North Wembley','Wembley Central','Stonebridge Park','Harlesden','Willesden Junction','Kensal Green','Queen\'s Park','Kilburn Park','Maida Vale','Warwick Avenue','Paddington','Edgware Road','Marylebone','Baker Street','Regent\'s Park','Oxford Circus','Piccadilly Circus','Charing Cross','Embankment','Waterloo','Lambeth North','Elephant & Castle'
        ]
        for i in range(len(bakerloo)-1):
            self._add_connection(bakerloo[i], bakerloo[i+1], 'Bakerloo')
        
        # Waterloo & City Line
        waterloo_city = ['Waterloo','Bank']
        for i in range(len(waterloo_city)-1):
            self._add_connection(waterloo_city[i], waterloo_city[i+1], 'Waterloo & City')
        
        # Elizabeth Line (Crossrail) - central section
        elizabeth = [
            'Paddington','Bond Street','Tottenham Court Road','Farringdon','Liverpool Street','Whitechapel','Canary Wharf','Custom House','Woolwich'
        ]
        for i in range(len(elizabeth)-1):
            self._add_connection(elizabeth[i], elizabeth[i+1], 'Elizabeth')
        
        # Additional interchange walking links
        self._add_connection('Euston','Euston Square','Walk', 5)
        self._add_connection('Bank','Monument','Walk', 5)
        self._add_connection('Paddington','Edgware Road','Walk', 7)
        self._add_connection('Tottenham Court Road','Goodge Street','Walk', 6)
        self._add_connection('Leicester Square','Charing Cross','Walk', 4)
        self._add_connection('Green Park','Hyde Park Corner','Walk', 5)
        self._add_connection('Bond Street','Oxford Circus','Walk', 4)
        
    def get_all_stations(self) -> List[str]:
        return sorted(self.graph.keys())
    
    def get_station_lines(self, station: str) -> List[str]:
        return sorted({line for neighbor, line, time in self.graph.get(station, []) if line != 'Walk'})

    # Extra cost (minutes) applied whenever a route changes line at a station.
    INTERCHANGE_PENALTY = 5

    def find_route(self, start: str, end: str) -> Optional[List[Tuple[str, Optional[str]]]]:
        """Find the fastest route using Dijkstra over (station, arrival line) states,
        charging an interchange penalty whenever the line changes. Plain BFS on
        stations alone would treat line changes as free and could "optimize" a
        3-stop, 2-interchange route over a slower but direct single-line one.

        Returns a list of (station, line) pairs, where `line` is the line ridden
        to reach that station (None for the starting station) — the exact line
        used for each hop, so leg-building never has to guess which line was
        used when several lines happen to connect the same pair of adjacent
        stations.
        """
        if start not in self.graph or end not in self.graph:
            return None
        if start == end:
            return [(start, None)]

        # `committed_line` is the last *real* line ridden (never 'Walk'), used only to
        # decide whether boarding the next real line is a genuine interchange. Walking
        # edges pass it through unchanged: their own time already prices in the
        # transfer, so they neither trigger a penalty themselves nor shield a real
        # line change on either side of them from being charged exactly once.
        def key(station: str, committed_line: str) -> Tuple[str, str]:
            return (station, committed_line)

        dist: Dict[Tuple[str, str], int] = {key(start, ''): 0}
        # Maps a state key to (predecessor state key, literal edge line used to arrive), or None for the start.
        prev: Dict[Tuple[str, str], Optional[Tuple[Tuple[str, str], str]]] = {key(start, ''): None}
        frontier: List[Tuple[str, str]] = [key(start, '')]
        end_key: Optional[Tuple[str, str]] = None

        while frontier:
            min_idx = 0
            for i in range(1, len(frontier)):
                if dist.get(frontier[i], float('inf')) < dist.get(frontier[min_idx], float('inf')):
                    min_idx = i
            current_key = frontier.pop(min_idx)
            current_dist = dist[current_key]
            current_station, current_committed_line = current_key

            if current_station == end:
                end_key = current_key
                break

            for neighbor, line, time in self.graph[current_station]:
                is_walk = line == 'Walk'
                new_committed_line = current_committed_line if is_walk else line
                is_real_change = (not is_walk) and current_committed_line != '' and line != current_committed_line
                penalty = self.INTERCHANGE_PENALTY if is_real_change else 0
                new_dist = current_dist + time + penalty
                neighbor_key = key(neighbor, new_committed_line)
                if new_dist < dist.get(neighbor_key, float('inf')):
                    dist[neighbor_key] = new_dist
                    prev[neighbor_key] = (current_key, line)
                    frontier.append(neighbor_key)

        if end_key is None:
            return None

        # Reconstruct path
        path: List[Tuple[str, Optional[str]]] = []
        cur_key: Optional[Tuple[str, str]] = end_key
        while cur_key is not None:
            station = cur_key[0]
            entry = prev[cur_key]
            edge_line = entry[1] if entry is not None else None
            path.append((station, edge_line))
            cur_key = entry[0] if entry is not None else None
        path.reverse()
        return path

    def get_route_details(self, route: List[Tuple[str, Optional[str]]]) -> List[str]:
        """Generate human-readable leg descriptions with line changes."""
        if not route or len(route) < 2:
            return []

        # Build via structured legs, then render text
        legs = self.get_route_legs(route)
        details = []
        for line, start, end, stops in legs:
            if line == 'Walk':
                details.append(f"Walk from {start} to {end} ({stops} stops)")
            else:
                details.append(f"Take {line} Line from {start} to {end} ({stops} stops)")
        return details

    def get_route_legs(self, route: List[Tuple[str, Optional[str]]]) -> List[Tuple[str, str, str, int]]:
        """Return a structured list of legs as (line, start_station, end_station, stops).
        Stops count is number of edges between start and end in that leg.
        Uses the exact line each step recorded during the search — no re-derivation
        from the graph, so it can't disagree with the route the search actually found.
        """
        if not route or len(route) < 2:
            return []

        legs: List[Tuple[str, str, str, int]] = []
        leg_start_idx = 0

        for i in range(2, len(route) + 1):
            leg_line = route[leg_start_idx + 1][1]
            edge_line = route[i][1] if i < len(route) else None
            if edge_line != leg_line:
                start = route[leg_start_idx][0]
                end = route[i - 1][0]
                stops = (i - 1) - leg_start_idx
                legs.append((leg_line or 'Unknown', start, end, stops))
                leg_start_idx = i - 1

        return legs
