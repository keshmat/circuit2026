Chess Circuit Format, Qualification, Points, and Prizes (Publishable)

Events in the Circuit (4 Total)

1) Rapid (Open)
	•	Format: 7-round Rapid
	•	Entry: Open
	•	Qualification: Top 2 qualify for Group A

2) Group C (Open Classical Swiss)
	•	Format: 5-round Swiss (Classical)
	•	Entry: Open
	•	Qualification: Winner qualifies for Group B

3) Group B (Classical Round Robin)
	•	Format: 6 players, 5-round Round Robin (Classical)
	•	Entry: Qualified / selected (no entry fee)
	•	Lineup:
	•	Winner of Group C
	•	3 highest-rated from registration
	•	2 wildcards
	•	Qualification: Winner qualifies for Group A

4) Group A (Classical Finals Round Robin)
	•	Format: 6 players, 5-round Round Robin (Classical)
	•	Entry: Qualified / selected (no entry fee)
	•	Lineup:
	•	Top 2 from Rapid
	•	Winner of Group B
	•	1st & 2nd from the previous Group A
	•	1 wildcard
	•	Notes: Group A is the top-tier finals group and awards the highest circuit points.

⸻

Season Flow (How the Circuit Feeds Itself)

Rapid + Group C are open qualifiers. The Group C winner advances to Group B, the Group B winner advances to Group A, and the top 2 from Rapid qualify for Group A. Group A is the finals group: its 1st & 2nd place automatically return in the next cycle’s Group A, with the remaining seat filled by a wildcard (plus the qualifiers above).

⸻

Circuit Points System

Inputs Needed (for organizers)

For each event:
	•	Total players N (for open events; for A/B, N = 6)
	•	For each player:
	•	SeedRank (starting rank by rating inside that event, 1 = highest)
	•	FinalRank (final standing after tiebreaks, 1 = winner)
	•	Completed (Y/N: completed all rounds/games)

Total Points Formula

TotalPoints(event, player) = PlacementPoints + PerformanceBonus + ParticipationPoints

⸻

Placement Points Tables

Group A (6-player RR, Classical)

Final Place	Circuit Points
1st	125
2nd	103
3rd	85
4th	70
5th	55
6th	43

Group B (6-player RR, Classical)

Final Place	Circuit Points
1st	110
2nd	90
3rd	75
4th	62
5th	48
6th	37

Group C (Open Swiss, Classical) — Percentile Bands

Percentile cutoffs are computed from N using:
cutoff = ceil(percent × N)
A player receives the highest band they qualify for based on FinalRank.

Final Standing Band	Circuit Points
Top 1%	100
Top 3%	90
Top 5%	82
Top 10%	72
Top 20%	62
Top 33%	52
Top 50%	44
Rest	22

Rapid (Open) — Percentile Bands

Same cutoff rule: cutoff = ceil(percent × N)

Final Standing Band	Circuit Points
Top 1%	70
Top 3%	63
Top 5%	57
Top 10%	50
Top 20%	43
Top 33%	36
Top 50%	31
Rest	15

Band Rule Note (important):
Percentile = FinalRank / N (1 is best). In implementation, use the ordered cutoffs (1%, 3%, 5%, 10%, 20%, 33%, 50%) and assign the first band that matches. Ties must be resolved by tournament tiebreaks before scoring.

⸻

Bonuses (added to Placement Points)

Performance Bonus (Improvement Bonus)

Definition (all events):

RawBonus = 2 × max(0, SeedRank − FinalRank)
	•	SeedRank = starting rank by rating within the event (1 = highest)
	•	FinalRank = final standing after tiebreaks (1 = winner)

Open Events (Rapid + Group C):

To ensure the bonus rewards improvement without overtaking top placement, we apply two caps:

PerformanceBonus = min( RawBonus, 25, floor(0.5 × PlacementPoints) )

So in open events:
	•	Bonus is capped at 25, and
	•	Bonus can never exceed 50% of the player's placement points in that event.

Round Robin Events (Group A + Group B):

Because these are small 6-player RRs (limited rank movement), we use a simple fixed cap:

PerformanceBonus = min( RawBonus, 20 )

(No additional "50% of placement" cap is needed here; it would have negligible effect.)

Participation Points (all events)

If Completed = Yes:
	•	Group A / Group B / Group C / Rapid: +5
Otherwise: +0

⸻

Live Standings Note

Season standings are updated after each event using a rolling best-3 system in each category: the leaderboard always counts a player's top 3 Rapid scores and top 3 Classical scores earned so far.

⸻