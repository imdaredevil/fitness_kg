import json
import csv

f = open("workout.jsonl")
workouts = [json.loads(x) for x in f.readlines()]
f.close()

with open("workouts.csv", "w") as f:
    reader = csv.DictWriter(f, fieldnames=["name"])
    reader.writeheader()
    for workout in workouts:
        reader.writerow({ "name": workout["id"].split("/")[-1]})