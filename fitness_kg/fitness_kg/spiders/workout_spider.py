from scrapy import Spider, Request
from urllib.parse import urlparse, parse_qs
from fitness_kg.items import MuscleGroup, Exercise, ExerciseGroup


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
        exercise_link = response.url
        exercise_name = response.css("h1::text").get()
        exercise_name = " ".join(exercise_name.split(" ")[:-3]).lower()
        list = response.css("div.node-stats-block ul li")
        record = {}
        for item in list:
            key = item.css("span.row-label::text").get().strip().lower()
            value = item.xpath("text()").getall()
            a_value = item.css("a::text").getall()
            div_value = item.css("div::text").getall()
            value += a_value
            value += div_value
            record[key] = convert_to_string(value, key)
        headings = response.css("h2::text").getall()
        overview = convert_to_string(
            response.css("div.field.field-name-field-exercise-overview").css("*::text").getall())
        instructions = convert_to_string(
            response.css("div.field.field-name-field-exercise-instructions").css("*::text").getall())
        if instructions == '':
            instructions = response.css("div.field.field-name-body").css("*::text").getall()
            instr = []
            tips = []
            reached = False
            for instruction in instructions:
                if instruction.strip().lower().endswith("tips:"):
                    reached = True
                elif reached:
                    tips.append(instruction)
                else:
                    instr.append(instruction)
        instructions = convert_to_string(instr)
        if len(tips) == 0:
            tips = convert_to_string(
                response.css("div.field.field-name-field-exercise-tips").css("*::text").getall())   
        else:
            tips = convert_to_string(tips)    
        print(exercise_link, overview)
        print(exercise_link, instructions)
        print(exercise_link, tips)
        yield ExerciseGroup(
                id=exercise_link,
                name=exercise_name,
                url=exercise_link,
                muscle=record['target muscle group'],
                type=record.get('exercise type', None),
                equipment=record.get('equipment required', None),
                mechanics=record.get('mechanics', None),
                difficulty=record.get('experience level', None),
                force_type=record.get('force type', None),
                secondary_muscle=record.get('secondary muscles', None),
                tips=tips,
                overview=overview,
                instructions=instructions
            )
        

            
        
                
                
            
                
            

                
                
