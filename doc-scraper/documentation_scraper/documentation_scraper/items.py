# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy

class DocumentationItem(scrapy.Item):
    title = scrapy.Field()
    container = scrapy.Field()

