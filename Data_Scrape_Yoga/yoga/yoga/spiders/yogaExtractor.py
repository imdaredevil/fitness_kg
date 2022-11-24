from dis import Instruction
import scrapy
import re
from scrapy import Request
from ..items import YogaCategory, PoseByAnatomy, Poses, PoseTable, Meditation, MeditationDetails

class YogaExtractor(scrapy.Spider):
    name = 'yogaExtractor'
    allowed_domains = ['www.yogajournal.com']
    # start_urls = ['https://www.yogajournal.com/poses/anatomy/']
    start_urls = ['https://www.yogajournal.com/pose-finder/pose-finder/']


    def parse(self,response):
        for row in response.xpath('/html/body/main/div[1]/div/article/section/div/div[2]/table[1]/tbody/tr'):
            pose_url = row.xpath('td[1]/a/@href').get()
            yield PoseTable(
            english_Name = row.xpath('td[1]//text()').get(),
            sanskrit_Name = row.xpath('td[2]//text()').get(),
            pose_Type = row.xpath('td[3]//text()').getall(),
            url = pose_url
            )
            yield Request(pose_url, self.parse_poseDetails)

        for row in response.xpath('/html/body/main/div[1]/div/article/section/div/div[2]/table[2]/tbody/tr'):
            
            pose_url2 = row.xpath('td[1]/a/@href').get()
            yield Meditation(
            english_Name = row.xpath('td[1]//text()').get(),
            sanskrit_Name = row.xpath('td[2]//text()').get(),
            meditation_Type = row.xpath('td[3]//text()').get(),
            url = pose_url2
            )
            print("1,", pose_url2)
            yield Request(pose_url2, self.meditationDetails)

        additional_url = "https://www.yogajournal.com/poses/anatomy/"
        yield Request(additional_url, self.parse2)

    def parse2(self, response):

        yogaMainList = response.xpath('/html/body/main/div[1]/div[3]/nav/ul/li/a/@href').getall()
        yogaDropDownlist = response.xpath('/html/body/main/div[1]/div[3]/nav/ul/li/ul/li/a/@href').getall()
        yogaMainNames = response.xpath('/html/body/main/div[1]/div[3]/nav/ul/li/a/span/text()').getall()
        yogaDropDownNames =  response.xpath('/html/body/main/div[1]/div[3]/nav/ul/li/ul/li/a/span/text()').getall()

        # print("Mainlist: ", yogaMainList)
        # print("Dropdown list:", yogaDropDownlist)
        # print("MainNames:", yogaMainNames)
        # print("dropdownnames: ", yogaDropDownNames)

        yogaMainNames.extend(yogaDropDownNames)
        yogaMainList.extend(yogaDropDownlist)

        for name,yoga_url in zip(yogaMainNames, yogaMainList):
            muscle = name.split(" ")[-1]

            yield YogaCategory(
                anatomy = muscle,
                url = yoga_url

            )

            yield Request(yoga_url, self.parse_getPoses)

    def parse_getPoses(self, response):
        muscle = response.xpath('/html/body/main/div[1]/div[1]/div/header/h1/text()').get().split(" ")[-1]

        for poses in response.xpath('/html/body/main/div[1]/div[3]/div[1]/div/section/div/article/div/div/h3/a'):
            pose_url = poses.xpath("..//@href").get()
            pose_name = poses.xpath("..//a/text()").get().strip()

            yield PoseByAnatomy(
                anatomy = muscle,
                pose_name = pose_name,
                url = pose_url
            )

    def parse_poseDetails(self, response):
        #//ul/descendant::*/text()

        name =  response.xpath('/html/body/main/div[1]/div/article/header/div[2]/div[2]/div[2]/hgroup/h1/text()').get()
        if not name:
            name = response.xpath("/html/body/main/article/div[1]/div[2]/div/div/hgroup/h2/text()").get().strip()

        description =  response.xpath("//p[following-sibling::h2[contains(text(),'basics')]]/text()").getall()
        if not description:
            description =  response.xpath("//hgroup/div/*/text()").getall()
            if not description:
                pass
                # print("1.", name)

        target_area_tag = response.xpath("//*[child::*[(contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'target area')) or (contains(text(),'Targets:'))]]")
        target_areas = target_area_tag.css("::text").getall()
        if not target_areas:
            pass
        
        benefits = response.xpath("//*[child::*[(self::strong or self::b) and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'benefits')]]")
        benedata = benefits.css("::text").getall()
        if not benedata:
            benefits =  response.xpath("//*[preceding-sibling::*[(self::h3 or self::h2) and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'benefits')]]")
            if benefits:
                benedata = benefits[0].css("::text").getall()
        # elif benedata[0]=='Pose benefits':
        elif 'benefits' in benedata[0].lower():
            required_text = benefits.xpath("following-sibling::p")
            benedata = [required_text.css("::text").get()]
        

        preparatory_tag = response.xpath("//*[contains(text(),'Preparatory')]")
        preparatory_data = preparatory_tag.xpath("following-sibling::*[self::ul or self::p]") #preparatory_tag.xpath("following-sibling::ul")
        if preparatory_data:
            if len(preparatory_data)>0:
                preparatory_data = preparatory_data[0].css("::text").getall()
            else:
                pass
                # print("1.", name)
        else: 
            some_data = response.xpath("//*[(self::h3 or self::h2) and child::*[contains(text(),'Preparatory')]]")
            if len(some_data)>0:
                preparatory_data = some_data.xpath("following-sibling::p")[0].css("::text").getall()
            else:
                # print("2.",name)     
                pass

            

        followUp_data = response.xpath("//p[(preceding-sibling::*[(self::h3 or self::h2) and contains(text(),'Counter')]) and (following-sibling::*[(self::h3 or self::h2) and contains(text(),'Anatomy')])]//text()").getall()
        if not followUp_data:
            followUp_tag = response.xpath("//*[(contains(text(),'Follow')) or (contains(text(),'Counter')) or (child::*[(contains(text(),'Follow')) or (contains(text(),'Counter'))])]")
            followUp_data = followUp_tag.xpath("following-sibling::*[self::ul or self::p]")
            if len(followUp_data)>0:
                followUp_data = followUp_data[0].css("::text").getall()
            else:
                some_data = response.xpath("//*[(self::h3 or self::h2) and child::*[contains(text(),'counter')]]")
                if len(some_data)>0:
                    preparatory_data = some_data.xpath("following-sibling::p")[0].css("::text").getall()
                else:
                    pass
        elif len(followUp_data)<1: 
            pass

        variation = response.xpath("//*[preceding-sibling::h2[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'variations')] and following-sibling::h2[contains(text(), 'Why we love')]]")
        if variation:
            variation = variation.css("::text").getall()
            if len(variation)<1:
                # print("1.", name)
                pass
        else:
            some_data = response.xpath("//p[preceding-sibling::*[(self::h2 or self::h3) and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'variation')]]")
            if len(some_data)>0:
                variation = some_data[0].css("::text").getall()
            else:
                # print("2.", name)
                some_data = response.xpath("//p[preceding-sibling::h2[child::strong[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'variation')]]  and following-sibling::h2[contains(text(), 'Why we love')]]")
                variation = some_data.css("::text").getall()
                
        instructions = response.xpath("//*[(not(self::a)) and ((contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'how to')) or (contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'instructions')))]")
        if instructions:
            inst_set = instructions.xpath("//following-sibling::ol")
            if len(inst_set)>0:
                instructions = inst_set[-1].css("::text").getall()
            else:
                inst_set = instructions.xpath("//p[(preceding-sibling::h2) and (following-sibling::h2)]")
                instructions = inst_set.css("::text").getall()
                if not inst_set or len(inst_set)<1:
                    # print("1. ", name)
                    pass

        url = response.url
        
        yield Poses(
            name = name,
            description = description,
            target_areas = target_areas,
            benefits = benedata,
            preparatory_poses = preparatory_data,
            followup_poses = followUp_data,
            intructions = instructions,
            variation = variation,
            url = url
        )

    def meditationDetails(self, response):
        name = response.xpath("//*[@class='c-article-headings u-spacing u-center-block']/*").css("::text").get()
        print("Name: ", name)
        if not name:
            print("2.", response.url)

        some_data = response.xpath("//*[contains(text(),'Step by Step') or child::*[contains(text(),'Step by Step')]]")
        if some_data:
            instructions = some_data[0].xpath("//p[following-sibling::h2[contains(text(),'Information')]]").css("::text").getall()
            if not instructions:
                instructions = some_data[0].xpath("//ol").css("::text").getall()
                if not instructions:
                    print("1.",name)
        else:
            instructions = []

        yield MeditationDetails(
            name = name,
            instructions = instructions
        )
            



           

