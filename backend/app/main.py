from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.admin_templates import router as admin_templates_router
from app.api.v1.auth import router as auth_router
from app.api.v1.customers import router as customers_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.plans import router as plans_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.templates import router as templates_router
from app.api.v1.webhooks import router as webhooks_router
from app.core.config import settings

app = FastAPI(title="Axion Invoice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(templates_router, prefix="/api/v1")
app.include_router(admin_templates_router, prefix="/api/v1")
app.include_router(customers_router, prefix="/api/v1")
app.include_router(invoices_router, prefix="/api/v1")
app.include_router(plans_router, prefix="/api/v1")
app.include_router(subscriptions_router, prefix="/api/v1")
app.include_router(webhooks_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
