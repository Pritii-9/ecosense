import re

NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z\s'-]{1,49}$")
EMAIL_PATTERN = re.compile(r"^(?=.{6,254}$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
CODE_PATTERN = re.compile(r"^\d{6}$")


def is_valid_name(name: str) -> bool:
    return bool(NAME_PATTERN.fullmatch(name.strip()))


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_PATTERN.fullmatch(email.strip()))


def is_valid_password(password: str) -> bool:
    if len(password) < 8 or len(password) > 64:
        return False

    has_lower = any(character.islower() for character in password)
    has_upper = any(character.isupper() for character in password)
    has_digit = any(character.isdigit() for character in password)
    has_special = any(not character.isalnum() and not character.isspace() for character in password)

    return has_lower and has_upper and has_digit and has_special


def is_valid_code(code: str) -> bool:
    return bool(CODE_PATTERN.fullmatch(code.strip()))
