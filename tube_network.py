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
        
        # Piccadilly Line (partial)
        piccadilly = [
            'Heathrow Terminals 2 & 3','Hatton Cross','Hounslow West','Boston Manor','Northfields','South Ealing','Acton Town','Hammersmith','Barons Court','Earl\'s Court','Gloucester Road','South Kensington','Knightsbridge','Hyde Park Corner','Green Park','Piccadilly Circus','Leicester Square','Covent Garden','Holborn','Russell Square','King\'s Cross St Pancras','Caledonian Road'
        ]
        for i in range(len(piccadilly)-1):
            self._add_connection(piccadilly[i], piccadilly[i+1], 'Piccadilly')
        
        # Circle Line (core central loop, partial)
        circle = [
            'Edgware Road','Paddington','Bayswater','Notting Hill Gate','High Street Kensington','Gloucester Road','South Kensington','Sloane Square','Victoria','St. James\'s Park','Westminster','Embankment','Temple','Blackfriars','Mansion House','Cannon Street','Monument','Tower Hill','Aldgate','Liverpool Street','Moorgate','Barbican','Farringdon','King\'s Cross St Pancras','Euston Square','Great Portland Street','Baker Street'
        ]
        for i in range(len(circle)-1):
            self._add_connection(circle[i], circle[i+1], 'Circle')
        
        # Interchange walking links (small time cost)
        self._add_connection('Euston','Euston Square','Walk', 5)
        self._add_connection('Bank','Monument','Walk', 5)
        self._add_connection('Paddington','Edgware Road','Walk', 7)
        
    def get_all_stations(self) -> List[str]:
        return sorted(self.graph.keys())
    
    def get_station_lines(self, station: str) -> List[str]:
        return sorted({line for neighbor, line, time in self.graph.get(station, []) if line != 'Walk'})

    def find_route(self, start: str, end: str) -> Optional[List[str]]:
        """Find shortest-stop route using BFS (minimizes number of hops).
        Later can be updated to minimize time or include live data.
        """
        if start not in self.graph or end not in self.graph:
            return None
        
        queue = deque([start])
        visited = {start}
        parent: Dict[str, Optional[str]] = {start: None}
        
        while queue:
            current = queue.popleft()
            if current == end:
                break
            for neighbor, line, time in self.graph[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append(neighbor)
        
        if end not in parent:
            return None
        
        # Reconstruct path
        path = []
        node = end
        while node is not None:
            path.append(node)
            node = parent[node]
        path.reverse()
        return path
    
    def get_route_details(self, route: List[str]) -> List[str]:
        """Generate human-readable leg descriptions with line changes."""
        if not route or len(route) < 2:
            return []
        
        details = []
        current_line = None
        leg_start = route[0]
        
        def line_between(a: str, b: str) -> Optional[str]:
            for neighbor, line, time in self.graph[a]:
                if neighbor == b:
                    return line
            return None
        
        for i in range(len(route)-1):
            a, b = route[i], route[i+1]
            line = line_between(a, b)
            if line is None:
                continue
            
            if current_line is None:
                current_line = line
            
            if line != current_line:
                # Close previous leg
                stops = route.index(a) - route.index(leg_start)
                details.append(f"Take {current_line} Line from {leg_start} to {a} ({stops} stops)")
                leg_start = a
                current_line = line
        
        # Final leg
        stops = route.index(route[-1]) - route.index(leg_start)
        details.append(f"Take {current_line} Line from {leg_start} to {route[-1]} ({stops} stops)")
        
        # Replace 'Walk' wording
        details = [d.replace('Take Walk Line', 'Walk') for d in details]
        return details
