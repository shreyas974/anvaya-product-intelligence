
class ANVAYAException(Exception):
    """Base exception for ANVAYA backend errors."""


class ProductNotFoundError(ANVAYAException):
    """Raised when a requested product does not exist."""