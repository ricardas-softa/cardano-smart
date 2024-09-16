import os
import re

class TextFileWriterPipeline:

    def open_spider(self, spider):
        self.base_folder = 'data'
        if not os.path.exists(self.base_folder):
            os.makedirs(self.base_folder)
        self.spider_folder = os.path.join(self.base_folder, spider.name)
        if not os.path.exists(self.spider_folder):
            os.makedirs(self.spider_folder)
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
        safe_title = re.sub(r'[<>:"/\\|?*]', '', title)
        safe_title = safe_title.replace(' ', '_')
        safe_title = safe_title.strip()
        return safe_title[:100]
