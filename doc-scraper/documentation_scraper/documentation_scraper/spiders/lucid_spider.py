import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re
from urllib.parse import urljoin
from lxml import etree

class LucidSpider(scrapy.Spider):
    name = "lucid"
    start_urls = ['https://lucid.spacebudz.io/docs/overview/about-lucid/']
    visited_urls = set()

    def __init__(self, *args, **kwargs):
        super(LucidSpider, self).__init__(*args, **kwargs)
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

        main_content = response.css('main.doc-content')
        if main_content:
            # Use lxml to parse the HTML and remove the nav element
            tree = etree.fromstring(main_content.get(), etree.HTMLParser())
            for nav in tree.xpath('//nav'):
                nav.getparent().remove(nav)
            
            # Extract header content
            header = tree.xpath('//header[@class="doc-header"]')
            header_content = ''
            if header:
                header_content = etree.tostring(header[0], encoding='unicode', method='html')

            # Extract doc-body content
            doc_body = tree.xpath('//div[@class="doc-body"]')
            doc_body_content = ''
            if doc_body:
                doc_body_content = etree.tostring(doc_body[0], encoding='unicode', method='html')

            if header_content or doc_body_content:
                content_html = f"{header_content}\n\n{doc_body_content}"
                markdown_content = self.html_converter.handle(content_html)
                # Remove base64 encoded images
                markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
                item['container'] = markdown_content.strip()
                
                self.pages_scraped += 1
                self.logger.info(f"Pages scraped: {self.pages_scraped}")
                yield item
            else:
                self.logger.warning(f"No content found for {response.url}")
        else:
            self.logger.warning(f"No main.doc-content found for {response.url}")

        # Find the next link
        next_link = response.css('a[rel="next"]::attr(href)').get()
        if next_link:
            next_url = urljoin(response.url, next_link)
            self.logger.info(f"Following next page: {next_url}")
            yield scrapy.Request(next_url, callback=self.parse)
        else:
            self.logger.info("No next link found. Reached the end of the documentation.")

    def closed(self, reason):
        self.logger.info(f"Spider closed: {reason}. Total pages scraped: {self.pages_scraped}")
