# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from .items import YogaCategory, PoseByAnatomy, Poses, PoseTable, Meditation, MeditationDetails
from scrapy.exceptions import DropItem

import json

class YogaPipeline:
    def __init__(self):
        self.yogaCategories = open('Extracted/yoga_categories.jsonl', 'w', encoding='utf8')
        self.yogaPoses = open('Extracted/yoga_poses.jsonl', 'w', encoding='utf8')
        self.poseDetails = open('Extracted/pose_details.jsonl', 'w', encoding='utf8')
        self.poseTable = open('Extracted/poseTable.jsonl', 'w', encoding='utf8')
        self.meditationList = open('Extracted/meditation_List.jsonl', 'w', encoding='utf8')
        self.meditationdetails = open('Extracted/meditationdetails.jsonl', 'w', encoding='utf8')

    def process_item(self,item,spider):
        if isinstance(item, YogaCategory):
            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.yogaCategories.write(line)
            return item

        if isinstance(item, PoseByAnatomy):
            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.yogaPoses.write(line)
            return item

        # if isinstance(item, Poses):
        #     for dict_key,dict_value in item.items():
        #         if dict_key == "name":
        #             item[dict_key] = dict_value.strip()
        #         elif dict_key == "target_areas":
        #             target_areas = []
        #             for targets in dict_value:
        #                 if (targets !="Targets:") | (targets !="Target area:") | (targets != "\n"):
        #                     target_areas.append(targets.strip())
        #             item[dict_key] = target_areas
        #         elif dict_key == 'benefits':
        #             benefits = []
        #             for benefit in dict_value:
        #                 if (benefit.strip()!='Benefits:') | (benefit!="\n"):
        #                     benefits.append(benefit.strip())
        #             item[dict_key] = benefits 
        #         else:
        #             new_list = []
        #             for targets in dict_value:
        #                 if targets!="\n":
        #                     new_list.append(targets.strip())
        #             item[dict_key]  =new_list

        #     line = json.dumps(dict(item), ensure_ascii=False) + "\n"
        #     self.poseDetails.write(line)
        #     return item

        if isinstance(item, Poses):
            for dict_key,dict_value in item.items():
                if dict_key == "name":
                    item[dict_key] = dict_value.strip()
                else:
                    new_list = []
                    for poses in dict_value:
                        non_use_words = ["Targets:", "Target area:", "Benefits:"]
                        new_val = poses.strip()
                        if (len(new_val)>0) and (new_val not in non_use_words):
                             new_list.append(new_val)
                    item[dict_key]  =new_list

            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.poseDetails.write(line)
            return item

        if isinstance(item, PoseTable):
            for dict_key,dict_value in item.items():
                if dict_key=="pose_Type":
                    pose_type = []
                    for pos_type in dict_value:
                        val = pos_type.strip()
                        if len(val)>0:
                            pose_type.append(val)
                    item[dict_key] = pose_type
            
            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.poseTable.write(line)
            return item

        if isinstance(item, Meditation):
            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.meditationList.write(line)
            return item

        if isinstance(item, MeditationDetails):
            
            for dict_key,dict_value in item.items():
                if dict_key == "name":
                    item[dict_key] = dict_value.strip()
                elif dict_key == "instructions":
                    instructions = []
                    for instruction in dict_value:
                        if instruction!="\n":
                            instructions.append(instruction.strip())
                    item[dict_key] = instructions

            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.meditationdetails.write(line)
            return item