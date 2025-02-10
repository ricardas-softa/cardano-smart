FROM python:3.11.6-slim-bookworm as base

USER root

# Install poetry
RUN pip install pipx
RUN python3 -m pipx ensurepath
RUN pipx install poetry==1.8.3
ENV PATH="/root/.local/bin:$PATH"
ENV PATH=".venv/bin/:$PATH"

# https://python-poetry.org/docs/configuration/#virtualenvsin-project
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

FROM base as dependencies
WORKDIR /home/worker/app
COPY pyproject.toml poetry.lock ./

ARG POETRY_EXTRAS="ui vector-stores-qdrant llms-ollama embeddings-ollama"
RUN poetry install --no-root --extras "${POETRY_EXTRAS}"

FROM base as app
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV APP_ENV=prod
ENV PYTHONPATH="$PYTHONPATH:/home/worker/app/private_gpt/"
EXPOSE 8080

# Prepare a non-root user
# More info about how to configure UIDs and GIDs in Docker:
# https://github.com/systemd/systemd/blob/main/docs/UIDS-GIDS.md


ARG UID=1000
ARG GID=1000

# Create the group first, then the user
RUN groupadd --gid ${GID} worker && \
    adduser --system --gid ${GID} --uid ${UID} --home /home/worker worker

WORKDIR /home/worker/app

RUN chown worker /home/worker/app
RUN mkdir -p local_data/private_gpt
RUN chown -R worker local_data
RUN mkdir models && chown worker models
RUN chmod -R 777 /home/worker/app/local_data
RUN mkdir -p /mnt/shared/ingestive && chmod -R 777 /mnt/shared
COPY --chown=worker --from=dependencies /home/worker/app/.venv/ .venv
COPY --chown=worker private_gpt/ private_gpt
COPY --chown=worker *.yaml .
COPY --chown=worker scripts/ scripts
COPY entrypoint.sh ./entrypoint.sh
COPY ingest.sh ./ingest.sh
COPY prepare_ingest.sh ./prepare_ingest.sh
COPY diff_report.py ./diff_report.py

USER worker
ENTRYPOINT ["/bin/bash", "/home/worker/app/entrypoint.sh"]
