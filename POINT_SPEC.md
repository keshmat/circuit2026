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
Rest	32

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
Rest	22

Band Rule Note (important):
Percentile = FinalRank / N (1 is best). In implementation, use the ordered cutoffs (1%, 3%, 5%, 10%, 20%, 33%, 50%) and assign the first band that matches. Ties must be resolved by tournament tiebreaks before scoring.

⸻

Bonuses (added to Placement Points)

Performance Bonus (all events)

PerformanceBonus = min( 2 × max(0, SeedRank − FinalRank), cap )

Caps:
	•	Group A: cap +20
	•	Group B: cap +20
	•	Group C: cap +25
	•	Rapid: cap +25

Participation Points (all events)

If Completed = Yes:
	•	Group A / Group B: +5
	•	Group C / Rapid: +3
Otherwise: +0

⸻