import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re
from urllib.parse import urlparse

class AikenSpider(scrapy.Spider):
    name = "aiken"
    start_urls = ['https://aiken-lang.org/installation-instructions']
    visited_urls = set()

    def __init__(self, *args, **kwargs):
        super(AikenSpider, self).__init__(*args, **kwargs)
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.body_width = 0

    def parse(self, response):
        if response.url in self.visited_urls:
            return
        self.visited_urls.add(response.url)
        
        self.logger.info(f"Parsing: {response.url}")

        item = DocumentationItem()
        item['title'] = response.css('title::text').get()
        item['url'] = response.url

        article = response.css('article')
        if article:
            main_content = article.css('main').get()
            if main_content:
                markdown_content = self.html_converter.handle(main_content)
                markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
                item['container'] = markdown_content.strip()
                yield item
            else:
                self.logger.warning(f"No <main> tag found in <article> for {response.url}")
        else:
            self.logger.warning(f"No <article> tag found for {response.url}")

        # Find the last div in the main content
        nav_div = response.css('main > div:last-child')
        
        next_url = None
        if nav_div:
            # Check if there are two links (back and next)
            links = nav_div.css('a')
            if len(links) == 2:
                next_url = links[1].attrib['href']
            # If there's only one link, check if it's a "next" link
            elif len(links) == 1 and 'ltr:nx-ml-auto' in links[0].attrib.get('class', ''):
                next_url = links[0].attrib['href']

        if next_url:
            next_url = response.urljoin(next_url)
            self.logger.info(f"Following next page: {next_url}")
            yield scrapy.Request(next_url, callback=self.parse)
        else:
            self.logger.info("No next button found. Looking for next section.")
            # Look for the next section in the sidebar
            sidebar_links = response.css('nav.nx-flex a')
            current_path = urlparse(response.url).path
            current_link = sidebar_links.xpath(f'//a[contains(@class, "nx-font-medium") and @href="{current_path}"]')
            if current_link:
                current_index = sidebar_links.index(current_link[0])
                if current_index < len(sidebar_links) - 1:
                    next_section = sidebar_links[current_index + 1]
                    next_url = next_section.attrib['href']
                    next_url = response.urljoin(next_url)
                    self.logger.info(f"Following next section: {next_url}")
                    yield scrapy.Request(next_url, callback=self.parse)
                else:
                    self.logger.info("Reached the end of all sections.")
            else:
                self.logger.warning("Couldn't find current page in sidebar.")

        # Follow any remaining sidebar links
        for href in response.css('nav.nx-flex a::attr(href)').getall():
            if href not in self.visited_urls:
                yield response.follow(href, self.parse)
