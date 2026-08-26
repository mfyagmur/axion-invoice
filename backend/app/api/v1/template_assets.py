import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/template-assets", tags=["template-assets"])

MAX_TEMPLATE_ASSET_SIZE_BYTES = 2 * 1024 * 1024
ALLOWED_TEMPLATE_ASSET_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
}
TEMPLATE_ASSET_MAGIC_BYTES = {
    "image/png": b"\x89PNG",
    "image/jpeg": b"\xff\xd8\xff",
}


@router.post("")
async def upload_template_asset(
    current_user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
) -> dict[str, str]:
    content_type = file.content_type
    if content_type not in ALLOWED_TEMPLATE_ASSET_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece PNG, JPG veya SVG formatları desteklenir",
        )

    contents = await file.read()
    if len(contents) > MAX_TEMPLATE_ASSET_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Görsel dosyası 2MB'den büyük olamaz",
        )

    magic_bytes = TEMPLATE_ASSET_MAGIC_BYTES.get(content_type)
    if magic_bytes is not None and not contents.startswith(magic_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dosya içeriği belirtilen formatla eşleşmiyor",
        )

    storage_dir = Path(settings.template_asset_storage_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)

    extension = ALLOWED_TEMPLATE_ASSET_TYPES[content_type]
    filename = f"{uuid.uuid4()}.{extension}"
    (storage_dir / filename).write_bytes(contents)

    return {"url": f"/static/template-assets/{filename}"}
