# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

from typing import List, Optional
from scrapy.item import Item, Field
from dataclasses import dataclass

@dataclass
class MuscleGroup:
    id: str
    name: str
    url: str
