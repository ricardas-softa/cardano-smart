import scrapy
from documentation_scraper.items import DocumentationItem
import html2text
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import subprocess
import time

class MeshSpider(scrapy.Spider):
    name = "mesh"
    start_urls = [
        'https://meshjs.dev/guides/nextjs',
        'https://meshjs.dev/guides/minting-on-nodejs',
        'https://meshjs.dev/guides/multisig-minting',
        'https://meshjs.dev/guides/prove-wallet-ownership',
        'https://meshjs.dev/guides/custom-provider',
        'https://meshjs.dev/guides/smart-contract-transactions',
        'https://meshjs.dev/guides/aiken',
        'https://meshjs.dev/guides/standalone',
        'https://meshjs.dev/guides/vesting'
    ]

    def __init__(self, *args, **kwargs):
        super(MeshSpider, self).__init__(*args, **kwargs)
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.body_width = 0
        self.html_converter.ignore_images = True
        self.html_converter.ignore_tables = False
        self.html_converter.unicode_snob = True
        self.pages_scraped = 0

        # Set up Selenium WebDriver
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
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
        self.logger.info(f"Parsing: {response.url}")

        self.driver.get(response.url)

        try:
            # Wait for the article to be present
            article = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "article.format"))
            )

            # Scroll to the bottom of the page to trigger any lazy-loading
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            
            # Additional wait to ensure all content is loaded
            time.sleep(5)

            item = DocumentationItem()
            item['title'] = self.driver.title
            item['url'] = response.url

            content_html = article.get_attribute('outerHTML')
            # Remove any script tags
            content_html = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', content_html)
            markdown_content = self.html_converter.handle(content_html)
            # Remove base64 encoded images
            markdown_content = re.sub(r'!\[.*?\]\(data:image/[^;]+;base64,([a-zA-Z0-9+/]+={0,2})\)', '', markdown_content)
            # Clean up extra newlines
            markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
            item['container'] = markdown_content.strip()
            
            self.pages_scraped += 1
            self.logger.info(f"Pages scraped: {self.pages_scraped}")
            yield item
        except Exception as e:
            self.logger.error(f"Error parsing {response.url}: {e}")
            # If there's an error, try one more time
            try:
                self.logger.info(f"Retrying {response.url}")
                time.sleep(10)  # Wait for 10 seconds before retrying
                self.driver.get(response.url)
                article = WebDriverWait(self.driver, 30).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article.format"))
                )
                # ... (rest of the content extraction code)
            except Exception as e:
                self.logger.error(f"Failed to parse {response.url} after retry: {e}")

    def closed(self, reason):
        self.driver.quit()
        self.logger.info(f"Spider closed: {reason}. Total pages scraped: {self.pages_scraped}")
