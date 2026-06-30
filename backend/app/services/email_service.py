import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config.settings import settings


class EmailService:
    """
    Servico simples de envio de e-mail via SMTP.

    Se as credenciais de SMTP nao estiverem configuradas (ex: ambiente
    de desenvolvimento), o e-mail e apenas impresso no console em vez
    de lancar erro, para nao travar o fluxo de recuperacao de senha.
    """

    @staticmethod
    def _smtp_configurado():
        return bool(
            settings.SMTP_HOST
            and settings.SMTP_USER
            and settings.SMTP_PASSWORD
        )

    @staticmethod
    def enviar_email(
        destinatario: str,
        assunto: str,
        corpo_html: str,
        corpo_texto: str | None = None
    ):

        if not EmailService._smtp_configurado():

            #fallback para dev: loga no console em vez de enviar

            print(
                "[EmailService] SMTP nao configurado. "
                f"E-mail nao enviado para {destinatario}.\n"
                f"Assunto: {assunto}\n"
                f"Corpo:\n{corpo_texto or corpo_html}"
            )
            return False

        mensagem = MIMEMultipart("alternative")
        mensagem["Subject"] = assunto
        mensagem["From"] = settings.EMAIL_FROM
        mensagem["To"] = destinatario

        if corpo_texto:
            mensagem.attach(MIMEText(corpo_texto, "plain"))

        mensagem.attach(MIMEText(corpo_html, "html"))

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT
        ) as server:

            if settings.SMTP_USE_TLS:
                server.starttls()

            server.login(
                settings.SMTP_USER,
                settings.SMTP_PASSWORD
            )

            server.sendmail(
                settings.EMAIL_FROM,
                destinatario,
                mensagem.as_string()
            )

        return True

    @staticmethod
    def enviar_email_recuperacao_senha(
        destinatario: str,
        link_reset: str
    ):

        assunto = "Recuperacao de senha"

        corpo_texto = (
            "Recebemos uma solicitacao para redefinir sua senha.\n\n"
            f"Acesse o link abaixo para criar uma nova senha:\n{link_reset}\n\n"
            "Este link expira em 15 minutos e pode ser usado apenas uma vez.\n\n"
            "Se voce nao solicitou esta alteracao, ignore este e-mail."
        )

        corpo_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #1e293b;">
                <p>Recebemos uma solicitacao para redefinir sua senha.</p>
                <p>
                    Clique no botao abaixo para criar uma nova senha:
                </p>
                <p>
                    <a href="{link_reset}"
                       style="background-color:#2563eb;color:#ffffff;
                              padding:10px 20px;border-radius:6px;
                              text-decoration:none;display:inline-block;">
                        Redefinir senha
                    </a>
                </p>
                <p>Ou copie e cole este link no navegador:</p>
                <p>{link_reset}</p>
                <p>
                    Este link expira em <strong>15 minutos</strong> e pode ser
                    usado apenas uma vez.
                </p>
                <p>Se voce nao solicitou esta alteracao, ignore este e-mail.</p>
            </body>
        </html>
        """

        return EmailService.enviar_email(
            destinatario=destinatario,
            assunto=assunto,
            corpo_html=corpo_html,
            corpo_texto=corpo_texto
        )
