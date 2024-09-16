FROM python:3.11.6-slim-bookworm as base

# Install poetry
RUN pip install pipx
RUN python3 -m pipx ensurepath
RUN pipx install poetry
ENV PATH="/root/.local/bin:$PATH"
ENV PATH="/usr/local/bin:$PATH"
ENV PATH=".venv/bin/:$PATH"

# https://python-poetry.org/docs/configuration/#virtualenvsin-project
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

FROM base as dependencies
WORKDIR /home/worker/app
COPY pyproject.toml poetry.lock ./

RUN pipx install poetry && poetry install --extras "ui vector-stores-qdrant llms-ollama embeddings-ollama"

FROM base as app

ENV PYTHONUNBUFFERED=1
ENV PORT=8001
EXPOSE 8001

# Prepare a non-root user with a valid shell and home directory
RUN adduser --system --shell /bin/bash --home /home/worker worker
WORKDIR /home/worker/app

# Create directories and set ownership
RUN mkdir local_data && chown worker:nogroup local_data
# RUN mkdir MATERIAL && chown worker:nogroup MATERIAL
RUN mkdir cache && chown worker:nogroup cache
RUN mkdir -p /home/worker/.cache/huggingface/hub && chown -R worker:nogroup /home/worker/.cache

COPY --from=dependencies /home/worker/app/.venv/ .venv
COPY private_gpt/ private_gpt
COPY fern/ fern
COPY *.yaml *.md ./
COPY scripts/ scripts
COPY entrypoint.sh ./entrypoint.sh
COPY ingest.sh ./ingest.sh
COPY prepare_ingest.sh ./prepare_ingest.sh
COPY diff_report.py ./diff_report.py

RUN chown -R worker:nogroup /home/worker/app

ENV PYTHONPATH="$PYTHONPATH:/private_gpt/"
ENV HF_HOME="/home/worker/.cache/huggingface/hub"

USER root
ENTRYPOINT ["/bin/bash", "/home/worker/app/entrypoint.sh"]
