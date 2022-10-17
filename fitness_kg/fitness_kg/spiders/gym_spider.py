from scrapy import Spider, Request
from urllib.parse import urljoin
from fitness_kg.items import MuscleGroup

class GymSpider(Spider):
    name = 'gym_spider'
    allowed_domains = ['https://www.muscleandstrength.com/']
    start_urls = [
        'https://www.muscleandstrength.com/exercises'
    ]

    def parse(self, response):
        muscle_groups = response.css("h2.taxonomy-heading ~ div.mainpage-category-list")[0]
        muscle_groups = muscle_groups.css("div.cell")
        for muscle_group in muscle_groups:
            links = muscle_group.css("a")
            for link in links:
                muscle_group = link.css("div.category-name::text").get()
                muscle_group_link = response.urljoin(link.attrib["href"])
                if muscle_group is not None:
                    yield MuscleGroup(
                        id=muscle_group_link,
                        name=muscle_group,
                        url=muscle_group_link
                    )
                    
                
                
