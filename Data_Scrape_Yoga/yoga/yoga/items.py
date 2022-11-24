# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


# class YogaItem(scrapy.Item):
#     # define the fields for your item here like:
#     # name = scrapy.Field()
#     pass

class PoseTable(scrapy.Item):
    english_Name = scrapy.Field()
    sanskrit_Name = scrapy.Field()
    pose_Type = scrapy.Field()
    url = scrapy.Field()

class Meditation(scrapy.Item):
    english_Name = scrapy.Field()
    sanskrit_Name = scrapy.Field()
    meditation_Type = scrapy.Field()
    url = scrapy.Field()

class MeditationDetails(scrapy.Item):
    name = scrapy.Field()
    instructions = scrapy.Field()

class YogaCategory(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    anatomy = scrapy.Field()
    url = scrapy.Field()

class PoseByAnatomy(scrapy.Item):
    anatomy = scrapy.Field()
    pose_name = scrapy.Field()
    url = scrapy.Field()

class Poses(scrapy.Item):
    name = scrapy.Field()
    description = scrapy.Field()
    target_areas = scrapy.Field() #Done
    benefits = scrapy.Field() #Done
    preparatory_poses = scrapy.Field() #Done
    followup_poses = scrapy.Field() #Done
    intructions = scrapy.Field() #Done
    variation = scrapy.Field()
    url = scrapy.Field()