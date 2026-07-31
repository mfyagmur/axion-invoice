import httpx
from authlib.jose import JsonWebToken, JsonWebKey
from authlib.jose.errors import JoseError

from app.core.config import settings

GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}


class GoogleTokenError(Exception):
    pass


def verify_google_id_token(id_token: str) -> dict:
    """Verifies a Google-issued id_token (from @react-oauth/google on the frontend)
    against Google's published JWKS and returns its claims."""
    resp = httpx.get(GOOGLE_CERTS_URL, timeout=5.0)
    resp.raise_for_status()
    jwk_set = JsonWebKey.import_key_set(resp.json())

    jwt = JsonWebToken(["RS256"])
    try:
        claims = jwt.decode(id_token, key=jwk_set)
        claims.validate()
    except JoseError as exc:
        raise GoogleTokenError(f"Geçersiz Google id_token: {exc}") from exc

    if claims.get("iss") not in GOOGLE_ISSUERS:
        raise GoogleTokenError("Geçersiz token issuer")
    if claims.get("aud") != settings.google_client_id:
        raise GoogleTokenError("Geçersiz token audience")

    return claims
