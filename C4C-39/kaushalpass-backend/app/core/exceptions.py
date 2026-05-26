"""Application exceptions."""

from fastapi import HTTPException, status


class AuthError(HTTPException):
    def __init__(self, detail: str = "Invalid or missing authentication") -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class QuotaError(HTTPException):
    def __init__(self, detail: str = "Daily assessment quota exceeded") -> None:
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
        )


class DuplicateMediaError(HTTPException):
    def __init__(self, detail: str = "Duplicate media detected") -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class ServiceError(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_502_BAD_GATEWAY) -> None:
        super().__init__(status_code=status_code, detail=detail)
