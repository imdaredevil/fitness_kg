# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem
from fitness_kg.items import MuscleGroup, Exercise, ExerciseGroup, ExrxMuscleGroup, ExrxExercise, ExrxExerciseGroup, CardioExercise
from scrapy import Item
import json


def getItemType(
        item: Item
    )-> str:
        if isinstance(item, MuscleGroup):
            return 'muscle'
        if isinstance(item, Exercise):
            return 'exercise'
        if isinstance(item, ExerciseGroup):
            return 'exercisegroup'
        if isinstance(item, ExrxMuscleGroup):
            return 'exrx_muscle'
        if isinstance(item, ExrxExercise):
            return 'exrx_exercise'
        if isinstance(item, ExrxExerciseGroup):
            return 'exrx_exercisegroup'
        if isinstance(item, CardioExercise):
            return 'cardio'
        return 'unknown'

class DeDuplicatePipeline:
    def __init__(self):
        self.present_records = set()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        item_type = getItemType(adapter.item)
        if item_type == 'unknown':
            return item
        record = (item_type, adapter['id'])
        if record in self.present_records:
            raise DropItem(f"Duplicate {item_type} found: {str(item)}")
        else:
            self.present_records.add(record)
            return item


class JsonWriterPipeline:
    def __init__(self):
        self.filenames = {
            'gym_spider': {
                'muscle' : 'Extracted/Gym/muscle_groups.jsonl',
                'exercise': 'Extracted/Gym/exercise.jsonl',
                'exercisegroup': 'Extracted/Gym/exercise_group.jsonl',
                
            },
            'exrx_spider': {
                'exrx_muscle' : 'Extracted/exrx/exrx_muscle_groups.jsonl',
                'exrx_exercise': 'Extracted/exrx/exrx_exercise.jsonl',
                'exrx_exercisegroup': 'Extracted/exrx/exrx_exercise_group.jsonl', 
            },
            'fat_spider': {
                'cardio': 'Extracted/Fat/cardio.jsonl',
            }
        }
        self.filewriters = {}
    
    def open_spider(self, spider):
        for itemClass, file in self.filenames[spider.name].items():
            self.filewriters[itemClass] = open(file, "w")

    def close_spider(self, spider):
        for file in self.filewriters.values():
            file.close()
    
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        itemType = getItemType(adapter.item)
        if itemType == 'unknown':
            return item
        curr_file_writer = self.filewriters[itemType]
        item_dict = adapter.asdict()
        del item_dict['id']
        line = json.dumps(adapter.asdict()) + '\n'
        curr_file_writer.write(line)
        return item
