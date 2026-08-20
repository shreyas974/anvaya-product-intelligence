class FileValidationError(ValueError):
    """Raised when an uploaded file fails validation."""


class UnsupportedFileTypeError(FileValidationError):
    """Raised when the uploaded file type is not supported."""


class FileTooLargeError(FileValidationError):
    """Raised when the uploaded file exceeds the size limit."""