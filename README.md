# Keshmat Chess Circuit 2026

A tournament website for publishing circuit standings and points for the Keshmat Chess Circuit 2026.

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

## Adding New Events

### Step 1: Add the Crosstable

Export the crosstable from [Chess-Results](https://chess-results.com) as an Excel file (`.xlsx`) and place it in the `crosstables/` directory.

### Step 2: Register the Event

Add an entry to `crosstables/events.json`:

```json
{
  "events": [
    { "file": "winterRapid2026.xlsx", "type": "rapid", "name": "Winter Rapid 2026" },
    { "file": "groupC_spring2026.xlsx", "type": "group_c", "name": "Spring Group C" }
  ]
}
```

**Event types:**
- `rapid` - Open Rapid tournaments
- `group_c` - Open Classical Swiss
- `group_b` - Classical Round Robin (6 players)
- `group_a` - Classical Finals Round Robin (6 players)

### Step 3: Process the Events

Run the update script to process all events:

```bash
./scripts/update_circuit.sh
```

Or process a single event directly:

```bash
./scripts/update_circuit.sh crosstables/myevent.xlsx rapid "My Event Name"
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
├── crosstables/           # Source crosstable files (.xlsx)
│   ├── events.json        # Event configuration
│   └── *.xlsx             # Crosstable exports from Chess-Results
├── data/                  # Generated JSON data
│   ├── standings.json     # Overall circuit standings
│   └── events/            # Individual event results
├── scripts/               # Processing scripts
│   ├── process_crosstable.py    # Parse crosstables & calculate points
│   ├── generate_event_page.py   # Generate event HTML pages
│   └── update_circuit.sh        # Main update script
├── site/                  # Static website
│   ├── index.html         # Main standings page
│   ├── rules.html         # Circuit points rules
│   ├── js/app.js          # Frontend JavaScript
│   └── events/            # Event result pages
├── requirements.txt       # Python dependencies
└── POINT_SPEC.md          # Detailed points specification
```

## Circuit Points System

**Total Points = Placement + Performance Bonus + Participation**

- **Placement Points**: Based on final standing (percentile bands for open events, fixed points for Groups A/B)
- **Performance Bonus**: +2 points per position gained from seed rank (capped at +20/+25)
- **Participation**: +3/+5 points for completing all rounds

**Eligibility**: Players must complete at least 50% of rounds to receive any circuit points.

See the full rules at `site/rules.html` or in `POINT_SPEC.md`.

## Scripts Reference

### update_circuit.sh

Process all events or a single event:

```bash
# Process all events from events.json
./scripts/update_circuit.sh

# Process a single file
./scripts/update_circuit.sh <xlsx_file> <event_type> [display_name]
```

### process_crosstable.py

Parse a crosstable and calculate circuit points:

```bash
python scripts/process_crosstable.py <xlsx_file> <event_type> [--output-dir data]
```

### generate_event_page.py

Generate an HTML page for an event:

```bash
python scripts/generate_event_page.py <event_id> [--data-dir data] [--site-dir site]
```

## License

Keshmat Chess Circuit 2026 - Dekweneh, Lebanon
