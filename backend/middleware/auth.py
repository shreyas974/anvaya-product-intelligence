from fastapi import Request, HTTPException

async def verify_api_key(request: Request, call_next):
    api_key = request.headers.get("x-api-key")
    if api_key != "expected_key":
        raise HTTPException(status_code=403, detail="Invalid API Key")
    response = await call_next(request)
    return response