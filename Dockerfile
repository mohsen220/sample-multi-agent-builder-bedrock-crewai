FROM public.ecr.aws/docker/library/python:3.11.10-bookworm

# Set Poetry environment variables to avoid virtual environment issues
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_VIRTUALENVS_IN_PROJECT=false

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy Poetry files first for better caching
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-dev

# Copy application code
COPY ./ /code/

WORKDIR /code

EXPOSE 8000

# Add healthcheck with python instead of curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Use direct uvicorn command instead of poetry run to avoid venv issues
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
