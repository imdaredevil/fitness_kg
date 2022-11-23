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
    image_url: str

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
    overview: str
    instructions: str
    tips: str
    secondary_muscle: str

@dataclass
class ExrxMuscleGroup:
    id: str
    name: str
    url: str
    parent_muscle: Optional[str]

@dataclass
class ExrxExercise:
    id: str
    name: str
    url: str
    muscle: str
    equipment: str


@dataclass
class ExrxExerciseGroup:
    id: str
    name: str
    url: str
    mechanics: str
    force_type: str
    utility: str
    instructions: str
    tips: str
    secondary_muscle: str


@dataclass
class CardioExercise:
    id: str
    name: str
    url: str
    calories: str
    met: str
    intensity: str

    