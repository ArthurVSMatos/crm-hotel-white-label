import re

#valida o cpf
def is_valid_cpf(
    cpf: str
):
    cpf = re.sub(
        r"\D",
        "",
        cpf
    )
    return len(cpf) == 11

#valida o cnpj
def is_valid_cnpj(
    cnpj: str
):
    cnpj = re.sub(
        r"\D",
        "",
        cnpj
    )
    return len(cnpj) == 14

#valida email
def is_valid_email(
    email: str
):
    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    return bool(
        re.match(
            pattern,
            email
        )
    )