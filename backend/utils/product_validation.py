import re


def validate_part_number(part_number: str) -> str:
    value = part_number.strip()

    if not value:
        raise ValueError("Part number cannot be empty")

    if len(value) > 100:
        raise ValueError("Part number cannot exceed 100 characters")

    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]*", value):
        raise ValueError("Part number contains invalid characters")

    return value


def validate_optional_text(
    value: str | None,
    field_name: str,
    max_length: int = 100,
) -> str | None:
    if value is None:
        return None

    value = value.strip()

    if not value:
        return None

    if len(value) > max_length:
        raise ValueError(
            f"{field_name} cannot exceed {max_length} characters"
        )

    return value
