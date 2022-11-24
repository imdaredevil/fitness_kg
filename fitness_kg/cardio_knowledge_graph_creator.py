import json
import csv


ranges = [
    (0, 1.5),
    (1.6, 2.5),
    (2.6, 3.5),
    (3.6, 5.0),
    (5.1, 8.0),
    (8.1, 13.5),
    (13.6, 16.0),
    (10, 110),
    (111, 200),
    (201, 260),
    (261, 410),
    (411, 590),
    (591, 890),
    (891, 1200),
]

n = len(ranges)
i = 0
levels = [ranges]
while True:
    new_level = []
    num_ranges = len(ranges)
    if num_ranges == 1:
        break
    for i in range(num_ranges // 2):
        left = ranges[i * 2]
        right = ranges[i * 2 + 1]
        new_level.append((left[0], right[1]))
    if (num_ranges % 2) == 1:
        new_level.append(ranges[-1])
    levels = [new_level] + levels
    ranges = new_level


nodes = [x for level in levels for x in level]
nodes = list(set(nodes))
nodes = [{
        "start": x[0],
        "end": x[1],
        "name": f"{x[0]}-{x[1]}"
    } for x in nodes]


less_than_links = []
more_than_links = []

for level in levels:
    n = len(level)
    for i in range(n-1):
        curr_node = level[i]
        next_node = level[i + 1]
        curr_node = f"{curr_node[0]}-{curr_node[1]}"
        next_node = f"{next_node[0]}-{next_node[1]}"
        less_than_links.append((curr_node, next_node))
        more_than_links.append((next_node, curr_node))

subset_links = []
superset_links = []
n = len(levels)
for i in range(n-1):
    for parent_node in levels[i]:
        for child_node in levels[i+1]:
            if (parent_node[0] <= child_node[0]) and (parent_node[1] >= child_node[1]):
                p_node = f"{parent_node[0]}-{parent_node[1]}"
                c_node = f"{child_node[0]}-{child_node[1]}"
                if p_node != c_node:
                    subset_links.append((c_node, p_node))
                    superset_links.append((p_node, c_node))

f  = open("cardio.jsonl")
cardio_exercises = [json.loads(x) for x in f.readlines()]
cardio_nodes = [{
    "name": c["name"],
    "url": c["url"],
    "intensity": c["intensity"],
    "calories": float(c["calories"]),
    "met": float(c["met"])
} for c in cardio_exercises]
burns = []
spends = [] 
for exercise in cardio_exercises:
    calories = float(exercise["calories"])
    for num in nodes:
        if (calories >= num["start"]) and (calories <= num["end"]):
            burns.append((exercise["name"], num["name"]))

for exercise in cardio_exercises:
    met = float(exercise["met"])
    for num in nodes:
        if (met >= num["start"]) and (met <= num["end"]):
            spends.append((exercise["name"], num["name"]))

with open("spends.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in spends:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "SPENDS"
        })

with open("burns.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in burns:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "BURNS"
        })

with open("less_than.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in less_than_links:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "LESS_THAN"
        })

with open("more_than.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in more_than_links:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "MORE_THAN"
        })

with open("subset.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in subset_links:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "SUBSET_OF"
        })

with open("superset.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "relation", "destination"])
    writer.writeheader()
    for spend in superset_links:
        writer.writerow({
            "source": spend[0],
            "destination": spend[1],
            "relation": "SUPERSET_OF"
        })


with open("cardio.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "url", "intensity", "calories", "met"])
    writer.writeheader()
    for cardio_node in cardio_nodes:
        writer.writerow(cardio_node)

with open("numbers.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "start", "end"])
    writer.writeheader()
    for number in nodes:
        writer.writerow(number)


        