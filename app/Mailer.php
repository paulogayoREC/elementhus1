<?php

declare(strict_types=1);

function email_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function clean_header_value(string $value): string
{
    return trim(str_replace(["\r", "\n"], '', $value));
}

function clean_email_address(string $value): string
{
    $email = normalize_email($value);

    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
}

function site_config(): array
{
    static $config = null;

    if ($config === null) {
        $config = require dirname(__DIR__) . '/config/legal.php';
    }

    return $config;
}

function site_origin(): string
{
    $config = site_config();
    $domain = strtolower((string) ($config['domain'] ?? 'encontreaquitech.com'));
    $domain = preg_replace('/[^a-z0-9.-]/', '', $domain) ?: 'encontreaquitech.com';

    return 'https://' . $domain;
}

function build_site_url(string $path): string
{
    return rtrim(site_origin(), '/') . '/' . ltrim($path, '/');
}

function mail_settings(): array
{
    $config = site_config();
    $domain = strtolower((string) ($config['domain'] ?? 'encontreaquitech.com'));
    $domain = preg_replace('/[^a-z0-9.-]/', '', $domain) ?: 'encontreaquitech.com';

    $fromEmail = clean_email_address((string) getenv('EAT_MAIL_FROM'));
    if ($fromEmail === '') {
        $fromEmail = 'seguranca@' . $domain;
    }

    $replyTo = clean_email_address((string) getenv('EAT_MAIL_REPLY_TO'));
    if ($replyTo === '') {
        $replyTo = clean_email_address((string) ($config['contact_email'] ?? ''));
    }

    $fromName = getenv('EAT_MAIL_FROM_NAME');
    if ($fromName === false || $fromName === '') {
        $fromName = (string) ($config['site_name'] ?? 'Encontre Aqui Tech');
    }

    return [
        'from_name' => clean_header_value((string) $fromName),
        'from_email' => $fromEmail,
        'reply_to' => $replyTo,
    ];
}

function encode_mail_subject(string $subject): string
{
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
    }

    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function send_html_mail(string $toEmail, string $subject, string $htmlBody, string $textBody): bool
{
    $toEmail = clean_email_address($toEmail);
    if ($toEmail === '') {
        return false;
    }

    $settings = mail_settings();
    $boundary = 'eat_' . bin2hex(random_bytes(12));
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        'From: ' . $settings['from_name'] . ' <' . $settings['from_email'] . '>',
        'X-Mailer: PHP/' . phpversion(),
    ];

    if ($settings['reply_to'] !== '') {
        $headers[] = 'Reply-To: ' . $settings['reply_to'];
    }

    $message = implode("\r\n", [
        '--' . $boundary,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        $textBody,
        '',
        '--' . $boundary,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        $htmlBody,
        '',
        '--' . $boundary . '--',
    ]);

    return mail($toEmail, encode_mail_subject($subject), $message, implode("\r\n", $headers));
}

function render_security_email(array $content): string
{
    $siteName = email_escape((string) ($content['site_name'] ?? 'Encontre Aqui Tech'));
    $kicker = email_escape((string) ($content['kicker'] ?? 'Conta Tech'));
    $title = email_escape((string) ($content['title'] ?? 'Segurança da conta'));
    $lead = email_escape((string) ($content['lead'] ?? ''));
    $body = email_escape((string) ($content['body'] ?? ''));
    $buttonLabel = email_escape((string) ($content['button_label'] ?? 'Abrir'));
    $buttonUrl = email_escape((string) ($content['button_url'] ?? build_site_url('/')));
    $note = email_escape((string) ($content['note'] ?? ''));
    $supportEmail = email_escape((string) ($content['support_email'] ?? 'contato@encontreaquitech.com'));

    return '<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>' . $title . '</title>
  </head>
  <body style="margin:0;background:#100d0b;color:#faebd1;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">' . $lead . '</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#100d0b;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border:1px solid rgba(37,125,167,.72);border-radius:8px;overflow:hidden;background:#080706;box-shadow:0 20px 55px rgba(0,0,0,.34);">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,#257da7,#c29f73);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 26px 12px;">
                <p style="margin:0 0 8px;color:#c29f73;font:800 12px/1.2 monospace;text-transform:uppercase;">' . $kicker . '</p>
                <h1 style="margin:0;color:#faebd1;font:800 26px/1.18 monospace;">' . $title . '</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 22px;">
                <p style="margin:0 0 14px;color:rgba(250,235,209,.82);font-size:15px;line-height:1.7;">' . $lead . '</p>
                <p style="margin:0;color:rgba(250,235,209,.78);font-size:14px;line-height:1.7;">' . $body . '</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 24px;">
                <a href="' . $buttonUrl . '" style="display:inline-block;border-radius:8px;background:#faebd1;color:#100d0b;font:800 14px/1 monospace;text-decoration:none;padding:15px 20px;">' . $buttonLabel . '</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 24px;">
                <div style="border:1px solid rgba(37,125,167,.34);border-radius:8px;background:rgba(37,125,167,.1);padding:14px 15px;">
                  <p style="margin:0;color:#faebd1;font:800 13px/1.45 monospace;">Segurança premium</p>
                  <p style="margin:6px 0 0;color:rgba(250,235,209,.74);font-size:13px;line-height:1.65;">' . $note . '</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 28px;">
                <p style="margin:0;color:rgba(250,235,209,.58);font-size:12px;line-height:1.7;">Se o botão não funcionar, copie e cole este link no navegador:<br><span style="color:#63d0ff;word-break:break-all;">' . $buttonUrl . '</span></p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid rgba(250,235,209,.12);padding:22px 26px 26px;background:rgba(250,235,209,.035);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:48px;vertical-align:top;">
                      <div style="width:40px;height:40px;border:1px solid rgba(37,125,167,.7);border-radius:8px;background:#faebd1;color:#100d0b;font:900 14px/40px monospace;text-align:center;">EAT</div>
                    </td>
                    <td style="vertical-align:top;">
                      <p style="margin:0;color:#faebd1;font:800 13px/1.4 monospace;">Equipe de Segurança<br>' . $siteName . '</p>
                      <p style="margin:7px 0 0;color:rgba(250,235,209,.62);font-size:12px;line-height:1.6;">Conteúdo útil, proteção digital e tecnologia com responsabilidade.<br>Contato: ' . $supportEmail . '</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>';
}

function password_reset_email(array $user, string $resetUrl, int $expiresMinutes): array
{
    $config = site_config();
    $siteName = (string) ($config['site_name'] ?? 'Encontre Aqui Tech');
    $supportEmail = (string) ($config['contact_email'] ?? 'contato@encontreaquitech.com');
    $name = get_first_name((string) ($user['name'] ?? ''));
    $subject = 'Redefinição segura de senha | ' . $siteName;
    $lead = 'Olá, ' . $name . '. Recebemos uma solicitação para redefinir a senha da sua Conta Tech.';
    $body = 'Use o botão abaixo para criar uma nova senha. O link é pessoal, expira em ' . $expiresMinutes . ' minutos e só pode ser usado uma vez.';
    $note = 'Nunca pediremos sua senha por e-mail. Se você não solicitou esta redefinição, ignore esta mensagem: sua senha atual continuará ativa e nenhum acesso será liberado por este link.';

    return [
        'subject' => $subject,
        'html' => render_security_email([
            'site_name' => $siteName,
            'kicker' => 'Conta Tech',
            'title' => 'Redefinição segura de senha',
            'lead' => $lead,
            'body' => $body,
            'button_label' => 'Redefinir minha senha',
            'button_url' => $resetUrl,
            'note' => $note,
            'support_email' => $supportEmail,
        ]),
        'text' => implode("\n\n", [
            $lead,
            $body,
            'Link seguro: ' . $resetUrl,
            'Segurança premium: ' . $note,
            'Equipe de Segurança - ' . $siteName,
            'Contato: ' . $supportEmail,
        ]),
    ];
}

function password_changed_email(array $user): array
{
    $config = site_config();
    $siteName = (string) ($config['site_name'] ?? 'Encontre Aqui Tech');
    $supportEmail = (string) ($config['contact_email'] ?? 'contato@encontreaquitech.com');
    $name = get_first_name((string) ($user['name'] ?? ''));
    $subject = 'Sua senha foi alterada | ' . $siteName;
    $lead = 'Olá, ' . $name . '. A senha da sua Conta Tech foi alterada com sucesso.';
    $body = 'Se foi você, nenhuma ação adicional é necessária. Caso não reconheça esta alteração, entre em contato imediatamente com nossa equipe.';
    $note = 'Por segurança, nunca compartilhe senhas, códigos ou links de acesso. Revise seus dispositivos e use uma senha exclusiva para sua conta.';

    return [
        'subject' => $subject,
        'html' => render_security_email([
            'site_name' => $siteName,
            'kicker' => 'Alerta de Segurança',
            'title' => 'Senha alterada com sucesso',
            'lead' => $lead,
            'body' => $body,
            'button_label' => 'Acessar o site',
            'button_url' => build_site_url('/'),
            'note' => $note,
            'support_email' => $supportEmail,
        ]),
        'text' => implode("\n\n", [
            $lead,
            $body,
            'Acesse: ' . build_site_url('/'),
            'Segurança premium: ' . $note,
            'Equipe de Segurança - ' . $siteName,
            'Contato: ' . $supportEmail,
        ]),
    ];
}

function get_first_name(string $name): string
{
    $name = clean_text($name, 80);
    if ($name === '') {
        return 'visitante';
    }

    $parts = preg_split('/\s+/', $name);
    return $parts[0] ?? 'visitante';
}
