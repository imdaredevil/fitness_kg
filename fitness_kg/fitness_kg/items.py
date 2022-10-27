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

@dataclass
class Exercise:
    id: str
    name: str
    url: str
    muscle: str
    type: str
    equipment: str
    mechanics: str
    difficulty: str

@dataclass
class ExerciseGroup:
    id: str
    name: str
    url: str
    muscle: str
    type: str
    equipment: str
    mechanics: str
    force_type: str
    difficulty: str
    secondary_muscle: str