#!/usr/bin/env python3
"""
Process Chess-Results crosstables and calculate circuit points.
Usage: python scripts/process_crosstable.py <xlsx_file> <event_type> [--output-dir data]
"""

import argparse
import json
import math
import os
import re
from datetime import datetime
from pathlib import Path

import pandas as pd


# Circuit Points Configuration
PLACEMENT_POINTS = {
    "group_a": {1: 125, 2: 103, 3: 85, 4: 70, 5: 55, 6: 43},
    "group_b": {1: 110, 2: 90, 3: 75, 4: 62, 5: 48, 6: 37},
}

# Percentile bands for open events (Group C and Rapid)
PERCENTILE_BANDS_GROUP_C = [
    (0.01, 100),
    (0.03, 90),
    (0.05, 82),
    (0.10, 72),
    (0.20, 62),
    (0.33, 52),
    (0.50, 44),
    (1.00, 22),
]

PERCENTILE_BANDS_RAPID = [
    (0.01, 70),
    (0.03, 63),
    (0.05, 57),
    (0.10, 50),
    (0.20, 43),
    (0.33, 36),
    (0.50, 31),
    (1.00, 15),
]

# Performance bonus caps
PERFORMANCE_CAPS = {
    "group_a": 20,
    "group_b": 20,
    "group_c": 25,
    "rapid": 25,
}

# Participation points (all events now +5)
PARTICIPATION_POINTS = {
    "group_a": 5,
    "group_b": 5,
    "group_c": 5,
    "rapid": 5,
}

# Minimum completion ratio to be eligible for circuit points
MIN_COMPLETION_RATIO = 0.5  # Must complete at least 50% of rounds


def parse_crosstable(xlsx_path: str) -> dict:
    """Parse a Chess-Results crosstable Excel file."""
    df = pd.read_excel(xlsx_path, header=None)
    
    # Extract tournament info from header rows
    tournament_info = {}
    
    for idx, row in df.iterrows():
        cell = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""
        
        if "Keshmat" in cell and "2026" in cell:
            tournament_info["name"] = cell.strip()
        elif "Date :" in cell:
            date_match = re.search(r"(\d{4}/\d{2}/\d{2})", cell)
            if date_match:
                tournament_info["date"] = date_match.group(1).replace("/", "-")
        elif "Number of rounds" in cell:
            rounds_match = re.search(r"(\d+)", cell)
            if rounds_match:
                tournament_info["rounds"] = int(rounds_match.group(1))
        elif "Location :" in cell:
            tournament_info["location"] = cell.replace("Location :", "").strip()
        elif "Starting rank crosstable" in cell:
            # The header row is next
            header_idx = idx + 1
            break
    
    # Find the actual data rows
    # Look for row with "No." in first column
    header_row = None
    for idx, row in df.iterrows():
        if str(row.iloc[0]).strip() == "No.":
            header_row = idx
            break
    
    if header_row is None:
        raise ValueError("Could not find header row with 'No.' column")
    
    # Extract column mapping
    header = df.iloc[header_row]
    columns = {}
    for i, col in enumerate(header):
        col_str = str(col).strip() if pd.notna(col) else ""
        if col_str == "No.":
            columns["seed_rank"] = i
        elif col_str == "Name":
            columns["name"] = i
        elif col_str == "Rtg":
            columns["rating"] = i
        elif col_str == "FED":
            columns["federation"] = i
        elif col_str == "Pts.":
            columns["points"] = i
        elif col_str == "Rk.":
            columns["final_rank"] = i
    
    # Find round columns (they have pattern like "1.Rd", "2.Rd", etc.)
    round_cols = []
    for i, col in enumerate(header):
        col_str = str(col).strip() if pd.notna(col) else ""
        if re.match(r"\d+\.Rd", col_str):
            round_cols.append(i)
    columns["rounds"] = round_cols
    
    # Parse player data
    players = []
    data_start = header_row + 1
    
    for idx in range(data_start, len(df)):
        row = df.iloc[idx]
        
        # Check if this is a valid player row (has a number in No. column)
        seed_val = row.iloc[columns["seed_rank"]]
        if pd.isna(seed_val) or not str(seed_val).strip().isdigit():
            # Check if we've hit the end (footer)
            if "chess-results" in str(row.iloc[0]).lower():
                break
            continue
        
        seed_rank = int(seed_val)
        name = str(row.iloc[columns["name"]]).strip() if pd.notna(row.iloc[columns["name"]]) else ""
        
        # Get title (column before name)
        title_col = columns["name"] - 1
        title = str(row.iloc[title_col]).strip() if pd.notna(row.iloc[title_col]) and str(row.iloc[title_col]).strip() not in ["NaN", "nan", ""] else ""
        
        rating = int(row.iloc[columns["rating"]]) if pd.notna(row.iloc[columns["rating"]]) and str(row.iloc[columns["rating"]]).strip().isdigit() else 0
        federation = str(row.iloc[columns["federation"]]).strip() if pd.notna(row.iloc[columns["federation"]]) else ""
        points = float(row.iloc[columns["points"]]) if pd.notna(row.iloc[columns["points"]]) else 0
        final_rank = int(row.iloc[columns["final_rank"]]) if pd.notna(row.iloc[columns["final_rank"]]) else 0
        
        # Check if player completed all rounds
        rounds_played = 0
        total_rounds = len(round_cols)
        for rc in round_cols:
            rd_val = str(row.iloc[rc]).strip() if pd.notna(row.iloc[rc]) else ""
            # A round is played if it has a result (not empty, not "0" which means unplayed/forfeit loss without showing up)
            # Results can be: "13b1" (played, won), "8w0" (played, lost), "4b½" (draw), "-1" (forfeit win), "0" (forfeit loss/no show)
            if rd_val and rd_val != "0":
                rounds_played += 1
        
        completed = rounds_played >= total_rounds
        
        players.append({
            "seed_rank": seed_rank,
            "name": name,
            "title": title,
            "rating": rating,
            "federation": federation,
            "points": points,
            "final_rank": final_rank,
            "rounds_played": rounds_played,
            "total_rounds": total_rounds,
            "completed": completed,
        })
    
    return {
        "tournament": tournament_info,
        "players": players,
        "total_players": len(players),
    }


def get_placement_points(event_type: str, final_rank: int, total_players: int) -> int:
    """Calculate placement points based on event type and final rank."""
    if event_type in ["group_a", "group_b"]:
        return PLACEMENT_POINTS[event_type].get(final_rank, 0)
    
    # For open events (group_c, rapid), use percentile bands
    bands = PERCENTILE_BANDS_RAPID if event_type == "rapid" else PERCENTILE_BANDS_GROUP_C
    
    for percent, points in bands:
        cutoff = math.ceil(percent * total_players)
        if final_rank <= cutoff:
            return points
    
    # Fallback to rest
    return bands[-1][1]


def get_percentile_band(final_rank: int, total_players: int) -> str:
    """Get the percentile band label for display.
    
    Uses the same ceil-based cutoff logic as placement points calculation
    to ensure the label matches the points awarded.
    """
    # Use the same cutoff logic as placement points: cutoff = ceil(percent * N)
    bands = [
        (0.01, "Top 1%"),
        (0.03, "Top 3%"),
        (0.05, "Top 5%"),
        (0.10, "Top 10%"),
        (0.20, "Top 20%"),
        (0.33, "Top 33%"),
        (0.50, "Top 50%"),
    ]
    
    for percent, label in bands:
        cutoff = math.ceil(percent * total_players)
        if final_rank <= cutoff:
            return label
    
    return "Rest"


def calculate_circuit_points(player: dict, event_type: str, total_players: int) -> dict:
    """Calculate all circuit points for a player."""
    seed_rank = player["seed_rank"]
    final_rank = player["final_rank"]
    completed = player["completed"]
    rounds_played = player["rounds_played"]
    total_rounds = player["total_rounds"]
    
    # Check eligibility: must complete at least 50% of rounds
    completion_ratio = rounds_played / total_rounds if total_rounds > 0 else 0
    eligible = completion_ratio >= MIN_COMPLETION_RATIO
    
    if not eligible:
        # Player did not complete minimum rounds - no circuit points
        return {
            "placement": 0,
            "performance_bonus": 0,
            "participation": 0,
            "total": 0,
            "eligible": False,
            "eligibility_reason": f"Did not complete minimum rounds ({rounds_played}/{total_rounds})",
            "percentile_band": get_percentile_band(final_rank, total_players) if event_type in ["rapid", "group_c"] else None,
        }
    
    # Placement points
    placement = get_placement_points(event_type, final_rank, total_players)
    
    # Performance bonus calculation
    # RawBonus = 2 * max(0, SeedRank - FinalRank)
    improvement = max(0, seed_rank - final_rank)
    raw_bonus = 2 * improvement
    
    # Apply caps based on event type
    if event_type in ["rapid", "group_c"]:
        # Open events: min(RawBonus, 25, floor(0.5 * PlacementPoints))
        # Bonus capped at 25 AND cannot exceed 50% of placement points
        placement_cap = math.floor(0.5 * placement)
        performance_bonus = min(raw_bonus, 25, placement_cap)
    else:
        # Round Robin events (group_a, group_b): min(RawBonus, 20)
        performance_bonus = min(raw_bonus, 20)
    
    # Participation points
    participation = PARTICIPATION_POINTS[event_type] if completed else 0
    
    # Total
    total = placement + performance_bonus + participation
    
    return {
        "placement": placement,
        "performance_bonus": performance_bonus,
        "participation": participation,
        "total": total,
        "eligible": True,
        "eligibility_reason": None,
        "percentile_band": get_percentile_band(final_rank, total_players) if event_type in ["rapid", "group_c"] else None,
    }


def process_event(xlsx_path: str, event_type: str) -> dict:
    """Process a crosstable and calculate all circuit points."""
    data = parse_crosstable(xlsx_path)
    
    total_players = data["total_players"]
    
    results = []
    for player in data["players"]:
        points = calculate_circuit_points(player, event_type, total_players)
        results.append({
            **player,
            "circuit_points": points,
        })
    
    # Sort by circuit points (descending), then by final rank
    results.sort(key=lambda x: (-x["circuit_points"]["total"], x["final_rank"]))
    
    # Create event ID from filename
    event_id = Path(xlsx_path).stem
    
    return {
        "event_id": event_id,
        "event_type": event_type,
        "tournament": data["tournament"],
        "total_players": total_players,
        "results": results,
        "processed_at": datetime.now().isoformat(),
    }


def get_event_category(event_type: str) -> str:
    """Determine if an event is Rapid or Classical."""
    if event_type == "rapid":
        return "rapid"
    else:  # group_a, group_b, group_c are all Classical
        return "classical"


# Maximum number of events to count per category (rolling best-N)
MAX_EVENTS_PER_CATEGORY = 3


def calculate_best_n_points(events: list, max_events: int = MAX_EVENTS_PER_CATEGORY) -> tuple:
    """
    Calculate points using the best-N system.
    Returns (total_points, events_with_counted_flag).
    
    Each event in the returned list will have a 'counted' field indicating
    whether it's counted toward the total (True) or dropped (False).
    """
    # Sort events by points descending
    sorted_events = sorted(events, key=lambda x: -x["points"])
    
    # Mark top N as counted, rest as dropped
    events_with_status = []
    total = 0
    for i, event in enumerate(sorted_events):
        counted = i < max_events
        events_with_status.append({
            **event,
            "counted": counted,
        })
        if counted:
            total += event["points"]
    
    return total, events_with_status


def update_standings(data_dir: str) -> dict:
    """
    Aggregate all event results into overall standings.
    
    Uses a rolling best-3 system: for each player, only their top 3 Rapid 
    scores and top 3 Classical scores are counted toward the circuit total.
    """
    events_dir = Path(data_dir) / "events"
    if not events_dir.exists():
        return {"players": [], "events": []}
    
    # Load all event files
    all_events = []
    player_data = {}  # name -> player info with categorized events
    
    for event_file in events_dir.glob("*.json"):
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
                if name not in player_data:
                    player_data[name] = {
                        "name": name,
                        "title": result.get("title", ""),
                        "rating": result.get("rating", 0),
                        "federation": result.get("federation", ""),
                        "rapid_events": [],
                        "classical_events": [],
                    }
                
                # Update rating if higher (might have changed between events)
                if result.get("rating", 0) > player_data[name]["rating"]:
                    player_data[name]["rating"] = result["rating"]
                
                # Update title if present
                if result.get("title") and not player_data[name]["title"]:
                    player_data[name]["title"] = result["title"]
                
                event_entry = {
                    "event_id": event["event_id"],
                    "event_type": event_type,
                    "category": category,
                    "final_rank": result["final_rank"],
                    "points": result["circuit_points"]["total"],
                }
                
                # Add to appropriate category
                if category == "rapid":
                    player_data[name]["rapid_events"].append(event_entry)
                else:
                    player_data[name]["classical_events"].append(event_entry)
    
    # Calculate standings with best-3 system
    standings = []
    for name, data in player_data.items():
        # Calculate best-3 for each category
        rapid_total, rapid_events = calculate_best_n_points(data["rapid_events"])
        classical_total, classical_events = calculate_best_n_points(data["classical_events"])
        
        # Combine all events (sorted by date/event_id for display)
        all_player_events = rapid_events + classical_events
        
        # Count how many events are actually counted
        counted_events = [e for e in all_player_events if e.get("counted", True)]
        
        standings.append({
            "name": data["name"],
            "title": data["title"],
            "rating": data["rating"],
            "federation": data["federation"],
            "events": all_player_events,
            "rapid_points": rapid_total,
            "classical_points": classical_total,
            "total_points": rapid_total + classical_total,
            "events_counted": len(counted_events),
            "events_total": len(all_player_events),
        })
    
    # Sort players by total points (descending)
    standings.sort(key=lambda x: -x["total_points"])
    
    # Add standing position
    for i, player in enumerate(standings, 1):
        player["position"] = i
    
    return {
        "standings": standings,
        "events": sorted(all_events, key=lambda x: x.get("date", ""), reverse=True),
        "updated_at": datetime.now().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Process Chess-Results crosstables")
    parser.add_argument("xlsx_file", help="Path to the crosstable Excel file")
    parser.add_argument("event_type", choices=["rapid", "group_a", "group_b", "group_c"],
                        help="Type of event")
    parser.add_argument("--output-dir", default="data", help="Output directory for JSON files")
    
    args = parser.parse_args()
    
    # Process the event
    event_data = process_event(args.xlsx_file, args.event_type)
    
    # Ensure output directories exist
    output_dir = Path(args.output_dir)
    events_dir = output_dir / "events"
    events_dir.mkdir(parents=True, exist_ok=True)
    
    # Save event data
    event_file = events_dir / f"{event_data['event_id']}.json"
    with open(event_file, "w") as f:
        json.dump(event_data, f, indent=2)
    print(f"Saved event data to {event_file}")
    
    # Update overall standings
    standings = update_standings(args.output_dir)
    standings_file = output_dir / "standings.json"
    with open(standings_file, "w") as f:
        json.dump(standings, f, indent=2)
    print(f"Updated standings at {standings_file}")


if __name__ == "__main__":
    main()
