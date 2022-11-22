from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
import json

class App:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()
    
    def create_muscles(self, muscles):
        with self.driver.session(database="neo4j") as session:
            for muscle in muscles:
                result = session.execute_write(
                    self._create_muscle, muscle, 
                )
                print(result)
    
    @staticmethod
    def _create_muscle(tx, muscle):
        muscle_id = "-".join(muscle["name"].lower().split(" "))
        query = (
            "MERGE (m:Muscle { name: $muscle_name, url: $muscle_url, id: $muscle_id })"
            "RETURN m"
        )
        try:
            result = tx.run(query, muscle_id = muscle_id, muscle_name = muscle['name'], muscle_url= muscle['url'])
            return result
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise
    
    def create_exercises(self, exercises):
        with self.driver.session(database="neo4j") as session:
            for exercise in exercises:
                result = session.execute_write(
                    self._create_exercise, exercise, 
                )
                print(result)

    @staticmethod
    def _create_exercise(tx, exercise):
        query = (
            "MERGE (e:Exercise { name: $exercise_name, url: $exercise_url, type: $type, mechanics: $mechanics, difficulty: $difficulty }) "
            "MERGE (eq:Equipment { name: $equipment_name })"
            "CREATE (e)-[:USES_EQUIPMENT]->(eq)"
        )
        query2 = (
            "MATCH (m:Muscle), (e:Exercise) where m.id = $exercise_muscle and e.name = $exercise_name "
            "CREATE (e)-[r:TARGETS]->(m)"
            "RETURN r "
        )
        try:
            result = tx.run(query,
                            exercise_url = exercise['url'],
                            exercise_name = exercise['name'],
                            mechanics = exercise['mechanics'] if exercise['mechanics'] is not None else 'unknown',
                            type = exercise['type'] if exercise['type'] is not None else 'unknown',
                            difficulty= exercise['difficulty'] if exercise['difficulty'] is not None else 'unknown',
                            exercise_muscle = exercise['muscle'],
                            equipment_name = exercise['equipment'] if exercise['equipment'] is not None else 'no Equipment'
            )
            result2 = tx.run(query2,
                             exercise_muscle = exercise['muscle'],
                             exercise_name = exercise['name'])
            return result, result2
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query2, exception=exception))
            raise
    
    


if __name__ == "__main__":
    # Aura queries use an encrypted connection using the "neo4j+s" URI scheme
    uri = "neo4j+s://e3f1202f.databases.neo4j.io"
    user = "neo4j"
    password = "Mh-OR7IPlBwdxPSV-vGCwYz7uGodO347ICK5_Pe8_to"
    app = App(uri, user, password)
    f = open("muscle_groups.jsonl", "r")
    muscles = [json.loads(line) for line in f.readlines()]
    f.close()
    f = open("exercise.jsonl", "r")
    exercises = [json.loads(line) for line in f.readlines()]
    f.close()
    app.create_muscles(muscles)
    app.create_exercises(exercises)
    app.close()