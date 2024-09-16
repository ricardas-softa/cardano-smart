import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re

class DocsSpider(scrapy.Spider):
    name = "docs"
    start_urls = [
        'https://docs.cardano.org/about-cardano/introduction/',
        'https://docs.cardano.org/developer-resources/welcome/',
        'https://developers.cardano.org/docs/get-started/',
        'https://developers.cardano.org/changelog/'
    ]

    exclude_urls = []
    visited_urls = set()

    def __init__(self, *args, **kwargs):
        super(DocsSpider, self).__init__(*args, **kwargs)
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.body_width = 0

    def parse(self, response):
        self.logger.info(f"Visiting: {response.url}")
        self.visited_urls.add(response.url)

        if response.url == 'https://developers.cardano.org/changelog/':
            return self.parse_changelog(response)
        else:
            return self.parse_default(response)

    def parse_default(self, response):
        item = DocumentationItem()
        item['title'] = response.css('title::text').get()
        item['url'] = response.url

        main_content = response.css('main').get()
        if main_content:
            markdown_content = self.html_converter.handle(main_content)
            # Remove base64 encoded images
            markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
            item['container'] = markdown_content.strip()
            yield item

        next_page = response.css('a.pagination-nav__link--next::attr(href)').get()
        if next_page and next_page not in self.exclude_urls and next_page not in self.visited_urls:
            self.logger.info(f"Following next page: {next_page}")
            yield response.follow(next_page, self.parse)

        for href in response.css('nav.menu a::attr(href)').getall():
            if href not in self.exclude_urls and href not in self.visited_urls:
                self.logger.info(f"Following sidebar link: {href}")
                yield response.follow(href, self.parse)

    def parse_changelog(self, response):
        item = DocumentationItem()
        item['title'] = response.css('title::text').get().strip()
        item['url'] = response.url

        changelog_content = response.css('div.changelog-container').get()
        if changelog_content:
            markdown_content = self.html_converter.handle(changelog_content)
            # Remove base64 encoded images
            markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
            item['container'] = markdown_content.strip()
            yield item
