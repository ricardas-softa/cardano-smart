FROM selenium/standalone-chrome:latest

USER root

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    python3-pip \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3.11-distutils \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libffi-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3.11 -m venv /app/venv

COPY documentation_scraper/requirements.txt /app/
RUN . /app/venv/bin/activate && pip install --no-cache-dir -r requirements.txt

COPY documentation_scraper /app

RUN mkdir -p /app/data && chown -R 1000:1000 /app/data && chmod -R 777 /app/data

ENV OUTPUT_PATH /app/data
ENV SCRAPY_SETTINGS_MODULE=documentation_scraper.settings
ENV PYTHONPATH=/app

USER 1000

CMD ["/app/venv/bin/python", "run_spiders.py"]
