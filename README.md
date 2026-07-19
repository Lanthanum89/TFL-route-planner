# London Underground Route Planner

A comprehensive route planner for the London Underground, available as an installable, offline-capable **PWA** (HTML/CSS/JS) and as the original Python/tkinter desktop app. Features an extensive network dataset covering 103+ stations across all major lines, with intelligent routing and colourised visual output.

## ✨ Features

- **Comprehensive Coverage**: 103+ stations across all major Underground lines
- **Smart Route Planning**: Shortest-path algorithm with interchange optimisation
- **Visual Route Display**: Colour-coded line segments matching official TfL colours
- **User-Friendly Interface**:
  - Searchable station dropdowns with autocomplete
  - ⇄ Swap stations button for return journeys
  - Customisable display options (colourisation, step-by-step directions)
- **Detailed Journey Information**:
  - Line-by-line route breakdown
  - Interchange points and walking connections
  - Estimated journey times
  - Station-by-station directions

## 🚇 Network Coverage

**Lines Included:**

- Bakerloo, Central, Circle, District
- Hammersmith & City, Jubilee, Metropolitan  
- Northern, Piccadilly, Victoria
- Waterloo & City
- DLR, Overground (partial coverage)

**Key Stations:** King's Cross St Pancras, Oxford Circus, Piccadilly Circus, Westminster, Canary Wharf, Heathrow, and many more.

## 📱 User Interface

The app features a clean, modern interface with colourised route display and convenient swap functionality for planning return journeys.

## 🚀 Getting started

### PWA (recommended)

No install, no build step — it's a static site.

```bash
# Clone or download the repository
git clone https://github.com/Lanthanum89/TFL-route-planner.git
cd TFL-route-planner

# Serve the files (service workers require http/https, not file://)
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Open it in Chrome/Edge on desktop or mobile and use the "Install app" / "Add to Home Screen" prompt to install it. Once loaded once, it keeps working offline.

- `index.html`, `styles.css`, `app.js` — UI shell and interaction logic
- `tube-network.js` — network graph, BFS routing, and route-leg formatting (JS port of `tube_network.py`)
- `manifest.json`, `service-worker.js`, `icons/` — PWA installability and offline caching

### Legacy desktop app (Python/tkinter)

#### Prerequisites

- Python 3.9+
- tkinter (included with most Python distributions on Windows/macOS)

#### Quick Start

```bash
# Run the application
python main.py
```

#### Optional: Virtual Environment

```bash
# Windows (PowerShell)
py -3 -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python -m venv .venv
source .venv/bin/activate

# Then run
python main.py
```

## 🎯 How to Use

1. **Select Stations**: Choose your starting and destination stations from the dropdown menus
2. **Swap if Needed**: Use the ⇄ button to quickly swap stations for return journeys  
3. **Plan Route**: Click "Plan Route" to find the optimal path
4. **Customise Display**: Toggle options for colourisation, interchanges, and step-by-step directions
5. **View Results**: See your route with line colours, interchange points, and estimated times

## 🏗️ Project Structure

**PWA:**
- `index.html` / `styles.css` / `app.js` — Web UI and interaction logic
- `tube-network.js` — Underground network model, routing algorithms, and data structures (JS port)
- `manifest.json` / `service-worker.js` / `icons/` — Installability and offline support

**Legacy desktop app:**
- `main.py` — Main GUI application with tkinter interface and user interactions
- `tube_network.py` — Underground network model, routing algorithms, and data structures

- `README.md` — This documentation file

## 🧠 How It Works

- **Graph Representation**: Network stored as `graph[station] = [(neighbor, line, time)]`
- **Pathfinding**: Breadth-First Search (BFS) finds routes with minimum station hops
- **Route Processing**: Intelligent line change detection for readable journey descriptions
- **Visual Display**: Colour-coded route segments using official TfL line colours

### Technical Features

- **Efficient Routing**: BFS algorithm ensures shortest hop count between stations
- **Interchange Modeling**: Walking connections between nearby stations (e.g., Bank↔Monument)
- **Extensible Design**: Easy to add new lines, stations, and connections
- **Colour Management**: Automatic contrast calculation for optimal text readability

## 🎨 Customization Options

**Display Options:**

- ✅ **Colourise legs by line** - Visual route segments in official line colours
- ✅ **Show interchanges** - Highlight station connections and walking links  
- ✅ **Step-by-step directions** - Detailed station-by-station journey breakdown

**Interface Features:**

- 🔄 **Station swapping** - Quick ⇄ button for return journey planning
- 🔍 **Searchable dropdowns** - Type to filter station names
- ⏱️ **Time estimates** - Rough journey duration calculations

## 🔮 Roadmap & Future Enhancements

### Phase 2: Smart Routing

- [ ] **Route Preferences**: Toggle between "Fewest stops" vs "Fastest time"  
- [ ] **Alternative Routes**: Show 2-3 different path options
- [ ] **Dijkstra Implementation**: Time-optimised routing with real travel durations

### Phase 3: Live Integration

- [ ] **TfL API Integration**: Real-time service status and delays
- [ ] **Live Journey Times**: Dynamic routing based on current conditions
- [ ] **Service Alerts**: Display line closures and engineering works

### Phase 4: Advanced Features

- [ ] **Visual Route Map**: Interactive line diagram with station markers
- [ ] **Accessibility Options**: Step-free routes and lift status
- [ ] **Fare Calculation**: Zone-based pricing with Oyster/contactless estimates
- [ ] **Journey History**: Save and recall frequent routes
- [ ] **Export Options**: Email/print journey plans

### Phase 5: Data Enhancement

- [ ] **Complete Network**: All 272 Underground stations
- [ ] **Elizabeth Line**: Full Crossrail integration  
- [ ] **National Rail**: Major connections and interchanges
- [ ] **Night Tube**: Weekend service indicators

## 🛠️ Development & Contributing

### Adding New Stations/Lines

```python
# In tube_network.py, add connections:
self._add_connection('Station A', 'Station B', 'Line Name', time=2)
```

### Key Development Notes

- **Bidirectional Connections**: `_add_connection()` automatically creates both directions
- **Time Values**: Integer minutes (2-3 min typical between adjacent stations)  
- **Walking Links**: Use `line='Walk'` with higher time values (4-7 min)
- **Line Colours**: Update `line_colors` dict for visual consistency

### Contributing Guidelines

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Test thoroughly**: Verify routes work correctly
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`  
6. **Open Pull Request**: Describe changes and benefits

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Transport for London** for inspiration and official line colours
- **London Underground** for the iconic network design
- **Python tkinter** community for GUI development resources
