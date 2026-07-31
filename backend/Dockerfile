FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install --with-deps chromium

COPY . .

# Playwright's browser download lands under /root, which a non-root user can't traverse
# (mode 0700) even if its contents are chowned — copy it into appuser's own home instead.
RUN useradd --create-home --uid 1000 appuser \
    && chown -R appuser:appuser /app \
    && mkdir -p /home/appuser/.cache \
    && cp -r /root/.cache/ms-playwright /home/appuser/.cache/ \
    && chown -R appuser:appuser /home/appuser/.cache
USER appuser
ENV PLAYWRIGHT_BROWSERS_PATH=/home/appuser/.cache/ms-playwright

EXPOSE 8000

# Dev overrides this via docker-compose.yml's `command:` (uvicorn --reload); this is the
# production default — gunicorn managing uvicorn worker processes, no --reload.
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--workers", "4", "--bind", "0.0.0.0:8000"]
