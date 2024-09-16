import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re
from urllib.parse import urljoin

class HaskellSpider(scrapy.Spider):
    name = "haskell"
    start_urls = ['https://learnyouahaskell.github.io/introduction.html']
    visited_urls = set()

    def __init__(self, *args, **kwargs):
        super(HaskellSpider, self).__init__(*args, **kwargs)
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.body_width = 0
        self.pages_scraped = 0

    def parse(self, response):
        if response.url in self.visited_urls:
            return
        self.visited_urls.add(response.url)
        
        self.logger.info(f"Parsing: {response.url}")

        item = DocumentationItem()
        item['title'] = response.css('title::text').get()
        item['url'] = response.url

        content = response.css('div#content')
        if content:
            # Extract the content as a string
            content_html = content.get()
            
            # Remove the top footdiv
            content_html = re.sub(r'<div class="footdiv".*?</div>', '', content_html, count=1, flags=re.DOTALL)
            
            # Remove the bottom footdiv
            content_html = re.sub(r'<div class="footdiv".*?</div>\s*</div>$', '</div>', content_html, flags=re.DOTALL)
            
            if content_html:
                markdown_content = self.html_converter.handle(content_html)
                # Remove images
                markdown_content = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_content)
                item['container'] = markdown_content.strip()
                self.pages_scraped += 1
                self.logger.info(f"Pages scraped: {self.pages_scraped}")
                yield item
            else:
                self.logger.warning(f"No content found for {response.url}")
        else:
            self.logger.warning(f"No #content div found for {response.url}")

        # Find the next link
        next_link = response.css('a.nxtlink::attr(href)').get()
        if next_link:
            next_url = urljoin(response.url, next_link)
            self.logger.info(f"Following next page: {next_url}")
            yield scrapy.Request(next_url, callback=self.parse)
        else:
            self.logger.info("No next link found. Reached the end of the documentation.")

    def closed(self, reason):
        self.logger.info(f"Spider closed: {reason}. Total pages scraped: {self.pages_scraped}")