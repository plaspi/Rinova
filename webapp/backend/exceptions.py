from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized access"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class InternalServerErrorException(HTTPException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Conflict occurred"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden access"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ServiceUnavailableException(HTTPException):
    def __init__(self, detail: str = "Service unavailable"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)

class TimeoutException(HTTPException):
    def __init__(self, detail: str = "Request timeout"):
        super().__init__(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail=detail)

class UnprocessableEntityException(HTTPException):
    def __init__(self, detail: str = "Unprocessable entity"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class TooManyRequestsException(HTTPException):
    def __init__(self, detail: str = "Too many requests"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)
