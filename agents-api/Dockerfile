FROM public.ecr.aws/docker/library/python:3.11.10-slim-bookworm

# Set Poetry environment variables to avoid virtual environment issues
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_VIRTUALENVS_IN_PROJECT=false

# Create non-root user with proper home directory
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

WORKDIR /code

COPY pyproject.toml poetry.lock ./

RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi && \
    pip cache purge

COPY ./ /code/

# Set proper permissions for the appuser
RUN mkdir -p /code/images && \
    chown -R appuser:appuser /code && \
    chown -R appuser:appuser /tmp/poetry_cache

# Switch to non-root user
USER appuser

EXPOSE 8000

# Add healthcheck with python instead of curl (curl not available in slim image)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Use direct uvicorn command instead of poetry run to avoid venv issues
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
