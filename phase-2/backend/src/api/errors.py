
from typing import Optional, Any
from fastapi.responses import JSONResponse

def error_response(status_code: int, message: str, detail: Optional[str] = None) -> JSONResponse:
    content = {"error": message}
    if detail:
        content["detail"] = detail
    return JSONResponse(status_code=status_code, content=content)
