from operator import eq
from numpy import diff
from scrapy import Spider, Request
from urllib.parse import urlparse, parse_qs
from fitness_kg.items import ExrxMuscleGroup, ExrxExercise, ExrxExerciseGroup




def convert_to_string(li, key  = ''):
    return " ".join([l.strip() for l in li if (l != key and l != '')]).strip().lower()

class ExrxSpider(Spider):
    name = 'exrx_spider'
    allowed_domains = ['exrx.net']
    start_urls = [
        'https://exrx.net/Lists/Directory'
    ]

    def parse(self, response):
        muscle_groups = response.css("div.col-sm-6 > ul > li")
        for muscle_group in muscle_groups:
            head_link = muscle_group.xpath("a")
            if len(head_link) == 0:
                continue
            muscle_name = head_link.css("::text").get().strip().lower()
            muscle_link = response.urljoin(head_link.attrib['href']).strip()
            yield ExrxMuscleGroup(
                id = muscle_link,
                name = muscle_name,
                url = muscle_link,
                parent_muscle=None
            )
            yield Request(muscle_link, self.parse_muscle)


    def parse_muscle(self, response):
        containers = response.css("div.container")
        parent_muscle_url = response.url
        heading = True
        curr_muscle = None
        for container in containers:
            if heading:
                links_head = container.css("div.col-sm-12 h2")
                if not links_head:
                    continue
                links = links_head.css("a")
                for link in links:
                    name = link.css("::text").get()
                    href = link.attrib.get('href', None)
                    if (name != '') and (href is not None):
                        name = name.strip().lower()
                        href = href.strip()
                        href = response.urljoin(href)
                        yield ExrxMuscleGroup(
                                id = href,
                                name = name,
                                url = href,
                                parent_muscle = parent_muscle_url
                            )
                        curr_muscle = href
                        break
                if curr_muscle is None:
                    curr_muscle = parent_muscle_url
                heading = False
            else:
                equipments = container.css("div.row > div.col-sm-6 > ul > li")
                for equipment in equipments:
                    equipment_name = equipment.css("::text").get()
                    exercises = equipment.xpath("ul/li")
                    for exercise in exercises:
                        link_ele = exercise.css("a")
                        name = link_ele.css("::text").get().strip().lower()
                        href = link_ele.attrib['href'].strip()
                        href = response.urljoin(href)
                        yield ExrxExercise(
                            id = href,
                            name = name,
                            url = href,
                            muscle = curr_muscle,
                            equipment = equipment_name
                        )
                        yield Request(href, self.parse_exercise)
                        parent_name = name
                        sub_exercises = exercise.css("ul > li")
                        for exercise in sub_exercises:
                            link_ele = exercise.css("a")
                            name = link_ele.css("::text").get().strip().lower()
                            href = link_ele.attrib['href'].strip()
                            href = response.urljoin(href)
                            yield ExrxExercise(
                                id = href,
                                name = parent_name + '_' + name,
                                url = href,
                                muscle = curr_muscle,
                                equipment = equipment_name
                            )
                            yield Request(href, self.parse_exercise)
                heading = True
                curr_muscle = None


    def parse_exercise(self, response):
        title = response.css("h1.page-title::text").get()
        left_div = response.css("div.ad-banner-block > div.row > div.col-sm-6")
        specs = left_div.css("table tr")
        text = specs.xpath("td[preceding-sibling::td/strong[contains(text(), 'Utility')]]").css("::text").getall()
        text = " ".join(text).lower()
        utilities = [t.strip() for t in text.split('or')]
        text = specs.xpath("td[preceding-sibling::td/strong[contains(text(), 'Mechanics')]]").css("::text").getall()
        mechanics = " ".join(text).lower()
        text = specs.xpath("td[preceding-sibling::td/strong[contains(text(), 'Force')]]").css("::text").getall()
        force = " ".join(text).lower()
        instructions = left_div.xpath("*[preceding-sibling::h2[contains(text(), 'Instructions')]]")
        instruction_text = ''
        for instruction in instructions:
            heading = instruction.xpath('strong/text()').get()
            h2 = instruction.root.tag == 'h2'
            if h2:
                break
            if heading is not None:
                instruction_text += f"{heading.strip()}:\n"
            else:
                instruction_text += f"{convert_to_string(instruction.css('::text').getall())}\n"
        if instruction_text == '':
            print(response.url, "instr")
        comments = left_div.xpath("*[preceding-sibling::h2[contains(text(), 'Comments')]]")
        comments_text = ''
        for comment in comments:
            heading = comment.xpath('strong/text()').get()
            h2 = comment.root.tag == 'h2'
            if h2:
                break
            if heading is not None:
                comments_text += f"{heading.strip()}:\n"
            else:
                comments_text += f"{convert_to_string(comment.css('::text').getall())}\n"
        if comments_text == '':
            print(response.url, "comm")
        muscles = left_div.xpath("*[preceding-sibling::h2[contains(text(), 'Muscles')]]")
        secondary_muscle = ''
        for muscle in muscles:
            heading = muscle.xpath('strong').get()
            h2 = muscle.root.tag == 'h2'
            if h2:
                break
            if heading is None:
                all_muscles = muscle.css("::text").getall()
                all_muscles = [f"{am.strip()}," for am in all_muscles if len(am.strip()) > 0]
                secondary_muscle += convert_to_string(all_muscles)
        if secondary_muscle == '':
            print(response.url, 'musc')
        
        yield ExrxExerciseGroup(
            id = response.url,
            name = title,
            url = response.url,
            mechanics = mechanics,
            force_type = force,
            utility = utilities,
            instructions=instruction_text,
            tips=comments_text,
            secondary_muscle=secondary_muscle
        )
        
 