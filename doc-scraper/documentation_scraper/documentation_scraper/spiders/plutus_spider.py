import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import subprocess
import time

class PlutusSpider(scrapy.Spider):
    name = "plutus"
    start_urls = ['https://plutus.cardano.intersectmbo.org/docs/']
    visited_urls = set()

    def __init__(self, *args, **kwargs):
        super(PlutusSpider, self).__init__(*args, **kwargs)
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.body_width = 0
        self.pages_scraped = 0

        # Set up Selenium WebDriver
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        # Find the path to google-chrome-stable
        try:
            chrome_path = subprocess.check_output(["which", "google-chrome-stable"]).decode().strip()
            chrome_options.binary_location = chrome_path
        except subprocess.CalledProcessError:
            self.logger.error("Could not find google-chrome-stable. Make sure it's installed and in your PATH.")
            raise

        try:
            self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        except Exception as e:
            self.logger.error(f"Failed to initialize Chrome driver: {e}")
            raise

    def parse(self, response):
        if response.url in self.visited_urls:
            return
        self.visited_urls.add(response.url)
        
        self.logger.info(f"Parsing: {response.url}")

        # Use Selenium to get the page
        self.driver.get(response.url)

        # Wait for the content to load
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.theme-doc-markdown.markdown"))
            )
        except:
            self.logger.info(f"No content div found for {response.url}. This might be a section start page.")
            # Instead of returning, we'll continue to look for links

        # Scroll to the bottom of the page to trigger any lazy-loading
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        
        # Wait for code blocks to load
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "pre code"))
            )
        except:
            self.logger.info(f"No code blocks found or they didn't load in time for {response.url}")

        # Additional wait to ensure all content is loaded
        time.sleep(5)

        # Get the page content after waiting and scrolling
        content = self.driver.find_elements(By.CSS_SELECTOR, "div.theme-doc-markdown.markdown")

        if content:
            item = DocumentationItem()
            item['title'] = self.driver.title
            item['url'] = response.url

            content_html = content[0].get_attribute('outerHTML')
            markdown_content = self.html_converter.handle(content_html)
            # Remove base64 encoded images
            markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
            item['container'] = markdown_content.strip()
            
            self.pages_scraped += 1
            self.logger.info(f"Pages scraped: {self.pages_scraped}")
            yield item
        else:
            self.logger.info(f"No content found for {response.url}")

        # Find all links on the page
        links = self.driver.find_elements(By.CSS_SELECTOR, 'a')
        for link in links:
            href = link.get_attribute('href')
            if href and href.startswith('https://plutus.cardano.intersectmbo.org/docs/'):
                self.logger.info(f"Found link: {href}")
                yield scrapy.Request(href, callback=self.parse)

        self.logger.info(f"Finished parsing: {response.url}")

    def closed(self, reason):
        self.driver.quit()
        self.logger.info(f"Spider closed: {reason}. Total pages scraped: {self.pages_scraped}")
