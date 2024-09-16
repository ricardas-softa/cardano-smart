FROM selenium/standalone-chrome:latest

USER root

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

WORKDIR /app

RUN python3 -m venv /app/venv

COPY documentation_scraper/requirements.txt /app/
RUN . /app/venv/bin/activate && pip install --no-cache-dir -r requirements.txt

COPY documentation_scraper /app

RUN mkdir -p /app/data && chown -R seluser:seluser /app/data

ENV OUTPUT_PATH /app/data

ENV SCRAPY_SETTINGS_MODULE=documentation_scraper.settings

ENV PYTHONPATH=/app

USER seluser

CMD ["/app/venv/bin/python", "run_spiders.py"]
