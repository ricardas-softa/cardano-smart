import os
import re
import unicodedata

class TextFileWriterPipeline:

    def open_spider(self, spider):
        self.base_folder = os.environ.get('OUTPUT_PATH', 'data')
        os.makedirs(self.base_folder, exist_ok=True)
        self.spider_folder = os.path.join(self.base_folder, spider.name)
        os.makedirs(self.spider_folder, exist_ok=True)
        self.file_counter = 1

    def process_item(self, item, spider):
        safe_title = self.sanitize_filename(item['title'])

        if not safe_title:
            safe_title = f"file_{self.file_counter}"
            self.file_counter += 1

        # Change the file extension to .md and use the spider-specific folder
        file_path = os.path.join(self.spider_folder, f"{safe_title}.md")

        with open(file_path, 'w', encoding='utf-8') as file:
            # Write content in Markdown format
            file.write(f"# {item['title']}\n\n")
            file.write(f"URL: {item['url']}\n\n")
            file.write(f"{item['container']}")

        return item

    def close_spider(self, spider):
        pass

    @staticmethod
    def sanitize_filename(title):
        if not title:
            return ''

        normalized = unicodedata.normalize('NFKD', title)
        ascii_title = normalized.encode('ascii', 'ignore').decode('ascii')
        safe_title = re.sub(r'\s+', '_', ascii_title)
        safe_title = re.sub(r'[^A-Za-z0-9_-]', '', safe_title)
        safe_title = re.sub(r'_+', '_', safe_title)
        safe_title = safe_title.strip('_-')
        return safe_title[:80]
