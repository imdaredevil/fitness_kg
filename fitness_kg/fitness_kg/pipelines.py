# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem
from fitness_kg.items import MuscleGroup
from scrapy import Item
import json

def getItemType(
        item: Item
    )-> str:
        if isinstance(item, MuscleGroup):
            return 'muscle'
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
            'muscle' : 'muscle_groups.jsonl',
        }
        self.filewriters = {}
    
    def open_spider(self, spider):
        for itemClass, file in self.filenames.items():
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
