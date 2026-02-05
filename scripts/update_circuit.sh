#!/bin/bash
# Update Circuit Data
# This script processes crosstables and regenerates the site data
#
# Usage:
#   ./scripts/update_circuit.sh              # Process all events from events.json
#   ./scripts/update_circuit.sh <file> <type> # Process a single file
#
# Event types: rapid, group_a, group_b, group_c
#
# To add a new event, either:
#   1. Add it to crosstables/events.json
#   2. Run: ./scripts/update_circuit.sh crosstables/myevent.xlsx rapid

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Activate virtual environment
source venv/bin/activate

# Function to process a single event
process_event() {
    local file="$1"
    local event_type="$2"
    local name="$3"
    
    if [ ! -f "$file" ]; then
        echo "  [SKIP] File not found: $file"
        return 1
    fi
    
    local event_id=$(basename "$file" .xlsx)
    echo "  - Processing: ${name:-$event_id} ($event_type)"
    python scripts/process_crosstable.py "$file" "$event_type"
    python scripts/generate_event_page.py "$event_id"
}

# If arguments provided, process single file
if [ $# -ge 2 ]; then
    echo "Processing single event..."
    process_event "$1" "$2" "$3"
    echo ""
    echo "Done! Event processed."
    echo "To serve the site locally, run: python -m http.server 8000 --directory site"
    exit 0
fi

# Otherwise, process all events from config
CONFIG_FILE="crosstables/events.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found: $CONFIG_FILE"
    echo ""
    echo "Create it with the following format:"
    echo '{'
    echo '  "events": ['
    echo '    { "file": "myevent.xlsx", "type": "rapid", "name": "My Event" }'
    echo '  ]'
    echo '}'
    exit 1
fi

echo "Processing crosstables from $CONFIG_FILE..."
echo ""

# Parse events.json and process each event
# Using Python for JSON parsing since it's already available
python3 << 'PYTHON_SCRIPT'
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
        skipped += 1

print()
print(f"Processed: {processed} events")
if skipped > 0:
    print(f"Skipped: {skipped} events")
PYTHON_SCRIPT

echo ""
echo "Done! Site data updated."
echo "To serve the site locally, run: python -m http.server 8000 --directory site"
