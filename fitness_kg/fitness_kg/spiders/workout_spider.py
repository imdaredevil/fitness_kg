from scrapy import Spider, Request
from urllib.parse import urlparse, parse_qs
from fitness_kg.items import Routine


def convert_to_string(li, key  = ''):
    return " ".join([l.strip() for l in li if (l != key and l != '')]).strip().lower()


class WorkoutSpider(Spider):
    name = 'workout_spider'
    allowed_domains = ['www.muscleandstrength.com']
    start_urls = [
        'https://www.muscleandstrength.com/workout-routines'
    ]

    def parse(self, response):
        workout_groups = response.css("h2.taxonomy-heading ~ div.mainpage-category-list")[0]
        workout_groups = workout_groups.css("div.cell")
        for workout_group in workout_groups:
            links = workout_group.css("a")
            for link in links:
                workout_group_link = response.urljoin(link.attrib["href"])
                if workout_group_link is not None:
                    yield Request(workout_group_link, self.parse_workout_group)
        
        
    def parse_workout_group(self, response):
        parsed_url = urlparse(response.url)
        pages = parse_qs(parsed_url.query).get('page', [])
        muscle = parsed_url.path.split('/')[-1]
        if len(pages) > 0:
            curr_page = pages[0]
        else:
            curr_page = 1
        workout_group = response.css("div.taxonomy-body div.grid-x.grid-margin-x.grid-margin-y")
        workout_divs = workout_group.css(".cell.small-12")
        for workout_div in workout_divs:
            title_div = workout_div.css("div.node-title a")
            exercise_link = response.urljoin(title_div.attrib.get("href"))
            yield Request(
                exercise_link,
                self.parse_workout_desc
            )
        if curr_page != 1:
            return
        a = response.css("ul.pager li.pager-last a")
        if a.get() is None:
            return
        last_page = a.attrib.get('href')
        last_page = response.urljoin(last_page)
        parsed_url = urlparse(last_page)
        pages = parse_qs(parsed_url.query).get('page', [])
        if len(pages) == 0:
            return
        page_num = int(pages[0])
        for i in range(page_num):
            query = f"page={str(i + 1)}"
            new_url = parsed_url._replace(query=query)
            new_url = new_url.geturl()
            yield Request(new_url, self.parse_muscle)
    
    def parse_workout_desc(self, response):
        list = response.css("h4 ~ table")
        for i, item in enumerate(list):
            exercises = item.css("td a")
            exercises = [exercise.attrib.get("href") for exercise in exercises]
            exercises = [response.urljoin(ex) for ex in exercises]
            yield Routine(
                    id=f"{response.url}_{i}",
                    exercises=exercises
                )
        

            
        
                
                
            
                
            

                
                
