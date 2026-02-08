# Keshmat Chess Circuit 2026

A tournament website for publishing circuit standings and points for the Keshmat Chess Circuit 2026, held in Dekweneh, Lebanon.

## Setup

### Prerequisites

- Python 3.10+
- A web browser

### Installation

1. Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Quick Start: Adding a New Event

This is the typical workflow when a new tournament finishes:

1. **Export the crosstable** from [Chess-Results](https://chess-results.com) as an Excel file (`.xlsx`).
2. **Drop the file** into the `crosstables/` directory.
3. **Run one command:**

```bash
./scripts/update_circuit.sh add crosstables/MyEvent2026.xlsx rapid "My Event 2026"
```

That's it. The script will:
- Register the event in `crosstables/events.json`
- Parse the crosstable and calculate circuit points
- Generate `data/events/MyEvent2026.json`
- Update `data/standings.json` (overall circuit standings)
- Generate `site/events/MyEvent2026.html`

### Event Types

| Type | Description | Placement Points |
|------|-------------|-----------------|
| `rapid` | Open Rapid tournament (Swiss) | Percentile-based (max 70) |
| `group_c` | Open Classical Swiss | Percentile-based (max 100) |
| `group_b` | Classical Round Robin (6 players) | Fixed (max 110) |
| `group_a` | Classical Finals Round Robin (6 players) | Fixed (max 125) |

### More Examples

```bash
# Add a classical group event:
./scripts/update_circuit.sh add crosstables/SpringClassicalA.xlsx group_a "Spring Classical Group A"

# Reprocess all events (e.g. after updating point calculation logic):
./scripts/update_circuit.sh

# Refresh standings only (e.g. after manually fixing a player name in a JSON file):
./scripts/update_circuit.sh standings

# Show full help with data flow diagram:
./scripts/update_circuit.sh help
```

## Viewing the Site

Start a local web server:

```bash
python -m http.server 8000 --directory site
```

Then open http://localhost:8000 in your browser.

## Project Structure

```
circuit2026/
├── crosstables/                  # Source crosstable files
│   ├── events.json               #   Registry of all events (auto-managed by 'add' command)
│   └── *.xlsx                    #   Crosstable exports from Chess-Results
├── data/                         # Generated JSON data
│   ├── standings.json            #   Overall circuit standings (best-3 system)
│   └── events/                   #   Individual event results + points
│       └── *.json
├── scripts/                      # Processing scripts
│   ├── update_circuit.sh         #   Main entry point — add events, reprocess, refresh standings
│   ├── process_crosstable.py     #   Parse .xlsx crosstables & calculate circuit points
│   └── generate_event_page.py    #   Generate static HTML event pages
├── site/                         # Static website (deploy this directory)
│   ├── index.html                #   Main standings page
│   ├── rules.html                #   Circuit points rules
│   ├── js/app.js                 #   Frontend JavaScript (fetches JSON, renders tables)
│   └── events/                   #   Generated event result pages
│       └── *.html
├── requirements.txt              # Python dependencies (pandas, openpyxl)
├── POINT_SPEC.md                 # Detailed points specification
└── README.md
```

## Data Flow

```
crosstables/*.xlsx                Source files from chess-results.com
       │
       ▼
[process_crosstable.py]           Parses Excel, calculates circuit points
       │
       ├──▶ data/events/*.json    Structured event results + point breakdowns
       └──▶ data/standings.json   Aggregated standings (best-3 per category)
               │
               ▼
[generate_event_page.py]          Creates static HTML shell
               │
               ▼
site/events/*.html                Event pages (load JSON at runtime via app.js)
site/index.html                   Standings page (loads standings.json at runtime)
```

## Circuit Points System

**Total Points = Placement + Performance Bonus + Participation**

- **Placement Points**: Based on final standing. Open events use percentile bands; Groups A/B use fixed points per rank.
- **Performance Bonus**: 2 points per position gained from seed rank. Capped at 20 (Groups A/B) or 25 (open events). Open events also capped at 50% of placement points.
- **Participation**: +5 points for completing all rounds.
- **Eligibility**: Players must complete at least 50% of rounds to receive any circuit points.
- **Best-3 System**: Only each player's top 3 Rapid scores and top 3 Classical scores count toward the circuit total.

See the full rules at `site/rules.html` or in `POINT_SPEC.md`.

## Scripts Reference

### update_circuit.sh

The main entry point for all admin tasks. Run `./scripts/update_circuit.sh help` for full documentation.

```bash
# Add a new event (registers + processes + generates page — one command):
./scripts/update_circuit.sh add <file.xlsx> <type> [display_name]

# Reprocess all events from crosstables/events.json:
./scripts/update_circuit.sh

# Refresh standings without reprocessing Excel files:
./scripts/update_circuit.sh standings
```

### process_crosstable.py

Parse a single crosstable and calculate circuit points. Called automatically by `update_circuit.sh`; rarely needed directly.

```bash
python scripts/process_crosstable.py <xlsx_file> <event_type> [--output-dir data]
```

### generate_event_page.py

Generate an HTML page for a single event. Called automatically by `update_circuit.sh`; rarely needed directly.

```bash
python scripts/generate_event_page.py <event_id> [--data-dir data] [--site-dir site]
```

## Deploying to Netlify

### Option 1: Connect to Git Repository

1. Push your project to GitHub, GitLab, or Bitbucket
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your repository
5. Netlify will auto-detect the `netlify.toml` configuration
6. Click "Deploy site"

The site will automatically redeploy whenever you push changes.

### Option 2: Manual Deploy

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Build and deploy:

```bash
# Copy data into site folder (same as Netlify build command)
cp -r data site/

# Deploy
netlify deploy --dir=site --prod
```

### Updating the Live Site

After adding new events:

1. Process the event locally:

```bash
./scripts/update_circuit.sh add crosstables/NewEvent.xlsx rapid "New Event Name"
```

2. Commit and push the changes:

```bash
git add crosstables/ data/ site/
git commit -m "Add New Event results"
git push
```

Netlify will automatically rebuild and deploy.

## License

Keshmat Chess Circuit 2026 - Dekweneh, Lebanon
