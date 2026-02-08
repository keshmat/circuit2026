#!/bin/bash
# Update Circuit Data
# This script processes crosstables and regenerates the site data.
#
# Usage:
#   ./scripts/update_circuit.sh                              # Process all events from events.json
#   ./scripts/update_circuit.sh add <file.xlsx> <type> [name] # Add new event, register in events.json, process & generate page
#   ./scripts/update_circuit.sh standings                     # Refresh standings only (no Excel reprocessing)
#
# Event types: rapid, group_a, group_b, group_c
#
# Examples:
#   ./scripts/update_circuit.sh add crosstables/SpringRapid2026.xlsx rapid "Spring Rapid 2026"
#   ./scripts/update_circuit.sh add crosstables/SpringClassicalA.xlsx group_a "Spring Classical Group A"
#   ./scripts/update_circuit.sh standings
#   ./scripts/update_circuit.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="crosstables/events.json"

cd "$PROJECT_DIR"

# Activate virtual environment
source venv/bin/activate

# ──────────────────────────────────────────────
# Helper: ensure events.json exists
# ──────────────────────────────────────────────
ensure_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo '{ "events": [] }' > "$CONFIG_FILE"
        echo "Created $CONFIG_FILE"
    fi
}

# ──────────────────────────────────────────────
# Helper: add an event to events.json if missing
# ──────────────────────────────────────────────
register_event() {
    local filename="$1"  # just the basename, e.g. SpringRapid2026.xlsx
    local event_type="$2"
    local name="$3"

    ensure_config

    python3 << PYEOF
import json, sys

config_file = "${CONFIG_FILE}"
filename = "${filename}"
event_type = "${event_type}"
name = "${name}"

with open(config_file) as f:
    config = json.load(f)

# Check if already registered
for ev in config.get("events", []):
    if ev["file"] == filename:
        print(f"  Already registered in {config_file}: {filename}")
        sys.exit(0)

# Add the new event
entry = {"file": filename, "type": event_type}
if name:
    entry["name"] = name
config.setdefault("events", []).append(entry)

with open(config_file, "w") as f:
    json.dump(config, f, indent=2)
    f.write("\n")

print(f"  Registered in {config_file}: {filename} ({event_type})")
PYEOF
}

# ──────────────────────────────────────────────
# Helper: process a single event (crosstable -> json -> html)
# ──────────────────────────────────────────────
process_event() {
    local file="$1"
    local event_type="$2"
    local name="$3"

    if [ ! -f "$file" ]; then
        echo "  [SKIP] File not found: $file"
        return 1
    fi

    local event_id
    event_id=$(basename "$file" .xlsx)
    echo "  - Processing: ${name:-$event_id} ($event_type)"
    python scripts/process_crosstable.py "$file" "$event_type"
    python scripts/generate_event_page.py "$event_id"
}

# ──────────────────────────────────────────────
# Subcommand: add
# ──────────────────────────────────────────────
cmd_add() {
    local file="$1"
    local event_type="$2"
    local name="$3"

    if [ -z "$file" ] || [ -z "$event_type" ]; then
        echo "Usage: $0 add <file.xlsx> <type> [name]"
        echo ""
        echo "Event types: rapid, group_a, group_b, group_c"
        exit 1
    fi

    # Validate event type
    case "$event_type" in
        rapid|group_a|group_b|group_c) ;;
        *)
            echo "Error: Invalid event type '$event_type'"
            echo "Valid types: rapid, group_a, group_b, group_c"
            exit 1
            ;;
    esac

    if [ ! -f "$file" ]; then
        echo "Error: File not found: $file"
        exit 1
    fi

    local filename
    filename=$(basename "$file")
    echo "Adding event: $filename ($event_type)"
    echo ""

    # 1. Register in events.json
    register_event "$filename" "$event_type" "$name"

    # 2. Process crosstable and generate page
    process_event "$file" "$event_type" "$name"

    echo ""
    echo "Done! Event added and processed."
    echo "To serve the site locally, run: python -m http.server 8000 --directory site"
}

# ──────────────────────────────────────────────
# Subcommand: standings
# ──────────────────────────────────────────────
cmd_standings() {
    echo "Refreshing standings from existing event data..."
    python3 << 'PYEOF'
import json, re
from datetime import datetime
from pathlib import Path

def get_event_category(event_type):
    return "rapid" if event_type == "rapid" else "classical"

def normalize_player_key(name):
    return re.sub(r"\s+", " ", name.replace(",", " ").strip().lower())

def calculate_best_n_points(events, max_events=3):
    sorted_events = sorted(events, key=lambda x: -x["points"])
    events_with_status = []
    total = 0
    for i, event in enumerate(sorted_events):
        counted = i < max_events
        events_with_status.append({**event, "counted": counted})
        if counted:
            total += event["points"]
    return total, events_with_status

data_dir = Path("data")
events_dir = data_dir / "events"
if not events_dir.exists():
    print("No events directory found.")
    exit(1)

all_events = []
player_data = {}

for event_file in sorted(events_dir.glob("*.json")):
    with open(event_file) as f:
        event = json.load(f)
    event_type = event["event_type"]
    category = get_event_category(event_type)
    all_events.append({
        "event_id": event["event_id"],
        "event_type": event_type,
        "category": category,
        "name": event["tournament"].get("name", event["event_id"]),
        "date": event["tournament"].get("date", ""),
        "total_players": event["total_players"],
    })
    for result in event["results"]:
        name = result["name"]
        key = normalize_player_key(name)
        if key not in player_data:
            player_data[key] = {
                "name": name, "title": result.get("title", ""),
                "rating": result.get("rating", 0), "federation": result.get("federation", ""),
                "rapid_events": [], "classical_events": [],
            }
        else:
            if "," in name and "," not in player_data[key]["name"]:
                player_data[key]["name"] = name
        if result.get("rating", 0) > player_data[key]["rating"]:
            player_data[key]["rating"] = result["rating"]
        if result.get("title") and not player_data[key]["title"]:
            player_data[key]["title"] = result["title"]
        entry = {
            "event_id": event["event_id"], "event_type": event_type,
            "category": category, "final_rank": result["final_rank"],
            "points": result["circuit_points"]["total"],
        }
        if category == "rapid":
            player_data[key]["rapid_events"].append(entry)
        else:
            player_data[key]["classical_events"].append(entry)

standings = []
for data in player_data.values():
    rapid_total, rapid_events = calculate_best_n_points(data["rapid_events"])
    classical_total, classical_events = calculate_best_n_points(data["classical_events"])
    all_player_events = rapid_events + classical_events
    counted_events = [e for e in all_player_events if e.get("counted", True)]
    standings.append({
        "name": data["name"], "title": data["title"],
        "rating": data["rating"], "federation": data["federation"],
        "events": all_player_events,
        "rapid_points": rapid_total, "classical_points": classical_total,
        "total_points": rapid_total + classical_total,
        "events_counted": len(counted_events),
        "events_total": len(all_player_events),
    })

standings.sort(key=lambda x: -x["total_points"])
for i, player in enumerate(standings, 1):
    player["position"] = i

result = {
    "standings": standings,
    "events": sorted(all_events, key=lambda x: x.get("date", ""), reverse=True),
    "updated_at": datetime.now().isoformat(),
}

out = data_dir / "standings.json"
with open(out, "w") as f:
    json.dump(result, f, indent=2)
print(f"Updated {out}")
PYEOF

    echo ""
    echo "Done! Standings refreshed."
}

# ──────────────────────────────────────────────
# Subcommand: (default) process all events
# ──────────────────────────────────────────────
cmd_process_all() {
    ensure_config

    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: Config file not found: $CONFIG_FILE"
        echo ""
        echo "Use '$0 add <file.xlsx> <type> [name]' to add your first event."
        exit 1
    fi

    echo "Processing all events from $CONFIG_FILE..."
    echo ""

    python3 << 'PYEOF'
import json
import subprocess
import sys
import os

config_file = "crosstables/events.json"
with open(config_file) as f:
    config = json.load(f)

events = config.get("events", [])
if not events:
    print("No events found in config file.")
    print("Use './scripts/update_circuit.sh add <file.xlsx> <type> [name]' to add events.")
    sys.exit(0)

processed = 0
skipped = 0

for event in events:
    file_path = f"crosstables/{event['file']}"
    event_type = event['type']
    name = event.get('name', event['file'])

    if not os.path.exists(file_path):
        print(f"  [SKIP] File not found: {file_path}")
        skipped += 1
        continue

    event_id = os.path.splitext(event['file'])[0]
    print(f"  - Processing: {name} ({event_type})")

    try:
        subprocess.run(
            ["python", "scripts/process_crosstable.py", file_path, event_type],
            check=True,
            capture_output=True
        )
        subprocess.run(
            ["python", "scripts/generate_event_page.py", event_id],
            check=True,
            capture_output=True
        )
        processed += 1
    except subprocess.CalledProcessError as e:
        print(f"    [ERROR] Failed to process: {e}")
        if e.stderr:
            print(f"    {e.stderr.decode()[:200]}")
        skipped += 1

print()
print(f"Processed: {processed} events")
if skipped > 0:
    print(f"Skipped: {skipped} events")
PYEOF

    echo ""
    echo "Done! Site data updated."
    echo "To serve the site locally, run: python -m http.server 8000 --directory site"
}

# ──────────────────────────────────────────────
# Subcommand: help
# ──────────────────────────────────────────────
cmd_help() {
    cat << 'HELPTEXT'
Keshmat Circuit 2026 - Site Update Tool

USAGE
  ./scripts/update_circuit.sh <command> [arguments]

COMMANDS
  (no command)                                Process all events registered in crosstables/events.json.
                                              Reprocesses every .xlsx file and regenerates all pages + standings.

  add <file.xlsx> <type> [name]               Add a new event to the circuit. This does three things:
                                                1. Registers the event in crosstables/events.json
                                                2. Processes the .xlsx crosstable into data/events/<id>.json
                                                3. Generates the HTML page at site/events/<id>.html
                                              If the event is already registered, it skips step 1 and reprocesses.

  standings                                   Refresh data/standings.json from existing event JSONs without
                                              reprocessing any Excel files. Useful after manually fixing
                                              player names or other data in data/events/*.json.

  help, --help, -h                            Show this help message.

EVENT TYPES
  rapid       Open Rapid tournament (Swiss). Percentile-based placement points (max 70).
  group_a     Classical Finals Round Robin (6 players). Fixed placement points (max 125).
  group_b     Classical Round Robin (6 players). Fixed placement points (max 110).
  group_c     Open Classical Swiss. Percentile-based placement points (max 100).

EXAMPLES
  # Add a new rapid event (typical admin workflow):
  #   1. Export crosstable from chess-results.com as .xlsx
  #   2. Place it in crosstables/
  #   3. Run:
  ./scripts/update_circuit.sh add crosstables/SpringRapid2026.xlsx rapid "Spring Rapid 2026"

  # Add a classical group event:
  ./scripts/update_circuit.sh add crosstables/SpringClassicalA.xlsx group_a "Spring Classical Group A"

  # Reprocess everything (e.g. after updating point calculation logic):
  ./scripts/update_circuit.sh

  # Refresh standings only (e.g. after fixing a player name in a JSON file):
  ./scripts/update_circuit.sh standings

DATA FLOW
  crosstables/*.xlsx                          Source files exported from chess-results.com
        |
        v
  [process_crosstable.py]                     Parses Excel, calculates circuit points
        |
        v
  data/events/<event_id>.json                 Structured event results + points
  data/standings.json                         Aggregated circuit standings (best-3 system)
        |
        v
  [generate_event_page.py]                    Creates static HTML page
        |
        v
  site/events/<event_id>.html                 Event page (loads JSON via app.js)
  site/index.html                             Main standings page (loads standings.json)

FILES
  crosstables/events.json                     Registry of all events to process. Managed automatically
                                              by the 'add' command; can also be edited by hand.
  data/standings.json                         Overall circuit standings. Regenerated on every run.
  site/                                       Static site root. Serve with any web server or deploy to Netlify.
HELPTEXT
}

# ──────────────────────────────────────────────
# Route to subcommand
# ──────────────────────────────────────────────
case "${1:-}" in
    add)
        shift
        cmd_add "$@"
        ;;
    standings)
        cmd_standings
        ;;
    "")
        cmd_process_all
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        # Legacy: treat as single-file processing for backwards compat
        # ./scripts/update_circuit.sh <file> <type> [name]
        if [ $# -ge 2 ]; then
            file="$1"
            event_type="$2"
            name="${3:-}"
            filename=$(basename "$file")

            echo "Processing single event..."

            # Auto-register in events.json
            register_event "$filename" "$event_type" "$name"

            process_event "$file" "$event_type" "$name"
            echo ""
            echo "Done! Event processed."
            echo "To serve the site locally, run: python -m http.server 8000 --directory site"
        else
            echo "Unknown command: $1"
            echo ""
            cmd_help
            exit 1
        fi
        ;;
esac
