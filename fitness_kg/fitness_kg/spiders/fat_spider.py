from operator import eq
from numpy import diff
from scrapy import Spider, Request
from urllib.parse import urlparse, parse_qs
from fitness_kg.items import CardioExercise

class  FatSpider(Spider):
    name = 'fat_spider'
    allowed_domains = ['www.fatsecret.com']
    start_urls = [
        'https://www.fatsecret.com/Diary.aspx?pa=aja'
    ]
    
    def parse(self, response):
        tables = response.css("table.lightbordercurvedbox")
        for table in tables:
            curr_intensity = table.css("h2::text").get()
            rows = table.css("tr.row")
            for row in rows:
                cols = row.css("td")
                name = cols[0].css("::text").get().strip().lower()
                link = cols[0].css("a").attrib.get('href', '').strip()
                link = response.urljoin(link)
                calories = cols[1].css("::text").get().strip()
                met = cols[2].css("::text").get().strip()
                yield CardioExercise(
                    id=link,
                    name=name,
                    url=link,
                    calories=calories,
                    met=met,
                    intensity=curr_intensity
                )