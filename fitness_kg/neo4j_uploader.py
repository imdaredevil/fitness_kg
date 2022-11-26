import argparse
import sys
from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
import csv
from copy import deepcopy
from tqdm import tqdm

uri = "neo4j+s://e3f1202f.databases.neo4j.io"
user = "neo4j"
password = "Mh-OR7IPlBwdxPSV-vGCwYz7uGodO347ICK5_Pe8_to"
driver = GraphDatabase.driver(uri, auth=(user, password))


def parse_args(args):
    parser = argparse.ArgumentParser(description='Create neo4j class from object')
    parser.add_argument('-i', '--input_file', type=str, required=True)
    parser.add_argument('-nr', '--node_or_relation', type=str, required=True, choices=["node", "relation"])
    parser.add_argument('-n', '--name', type=str, required=True)
    return parser.parse_args(args)


def read_csv(input_path):
    result = []
    with open(input_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            result.append(row)
        return result, reader.fieldnames


def create_node(tx, node : dict, name : str, fieldnames):
    name = name.capitalize()
    keys = list(node.keys())
    key_string = "{ " + ", ".join([f"{key}: ${key}" for key in keys]) + " }"
    query = (
       f"MERGE (r:{name} {key_string})"
       "RETURN r"
    )
    try:
        result = tx.run(query, **node)
        res = [row["r"] for row in result]
        return res
    except ServiceUnavailable as exception:
        logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
        raise

def create_relation(tx, edge: dict, name : str, fieldnames):
    name = name.upper()
    key_string = "{ " + ", ".join([f"{key}: ${key}" for key in fieldnames[3:]]) + " }"
    source = edge[fieldnames[0]]
    destination = edge[fieldnames[2]]
    del edge[fieldnames[0]]
    del edge[fieldnames[2]]
    query = (
        "MATCH (s), (d) where s.name = $source and d.name = $destination "
        f"MERGE (s)-[r:{name} {key_string}]->(d)"
        "RETURN r"
    )
    try:
        result = tx.run(query,source=source, destination=destination, **edge)
        res = [row["r"] for row in result]
        return res
    except ServiceUnavailable as exception:
        logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
        raise


def main(args):
   data, fieldnames = read_csv(args.input_file)
   create_func = None
   if args.node_or_relation == "node":
       create_func = create_node
   else:
       create_func = create_relation
   with driver.session(database="neo4j") as session:
        for row in tqdm(data):
            result = session.execute_write(
                create_func, deepcopy(row), args.name, fieldnames
            )
            if len(result) == 0:
                print(row)
            # print(result)
    



if __name__ == "__main__":
    args = parse_args(sys.argv[1:])
    main(args)
    driver.close()
