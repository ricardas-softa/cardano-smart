import scrapy
from documentation_scraper.items import DocumentationItem
from bs4 import BeautifulSoup

class DocsSpider(scrapy.Spider):
    name = "docs"
    start_urls = [
        'https://docs.cardano.org/about-cardano/introduction/',
        'https://docs.cardano.org/developer-resources/welcome/',
        'https://developers.cardano.org/docs/get-started/',
        'https://developers.cardano.org/changelog/'
    ]

    # List of URLs to exclude
    exclude_urls = [
        # 'https://developers.cardano.org/changelog/' # Removing this from exclusion as it is handled separately
    ]

    def parse(self, response):
        if response.url == 'https://developers.cardano.org/changelog/':
            return self.parse_changelog(response)
        else:
            return self.parse_default(response)

    def parse_default(self, response):
        item = DocumentationItem()
        item['title'] = response.css('title::text').get()

        # Use BeautifulSoup to clean the content
        soup = BeautifulSoup(response.text, 'html.parser')
        content = soup.find('main').get_text(separator=' ', strip=True)
        item['container'] = content

        if content:  # Only yield if content is not empty
            yield item

        # Follow the "Next" button link
        next_page = response.css('a.pagination-nav__link--next::attr(href)').get()
        if next_page is not None and next_page not in self.exclude_urls:
            yield response.follow(next_page, self.parse, dont_filter=True)

        # Follow sidebar links
        for href in response.css('nav.menu a::attr(href)').getall():
            if href not in self.exclude_urls:
                yield response.follow(href, self.parse, dont_filter=True)

    def parse_changelog(self, response):
        item = DocumentationItem()
        item['title'] = response.css('title::text').get().strip()
        
        container = response.css('div.changelog-container::text').getall()
        container = [text.strip() for text in container if text.strip()]
        container = ' '.join(container)

        if container:  # Only yield if container is not empty
            item['container'] = container
            yield item
