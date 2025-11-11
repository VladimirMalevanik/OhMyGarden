"""
Проверка подписи initData для Telegram WebApp:
https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
"""
import hmac
import hashlib
import urllib.parse
import os

def check_init_data(init_data: str) -> bool:
    if not init_data:
        return False
    bot_token = os.getenv("BOT_TOKEN")
    if not bot_token:
        # без токена считаем недействительным (или поставьте True для отладки)
        return False

    parsed = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
    data = {k: v for k, v in parsed}
    hash_recv = data.pop("hash", None)
    if not hash_recv:
        return False

    # data-check-string
    check_items = []
    for k in sorted(data.keys()):
        check_items.append(f"{k}={data[k]}")
    check_string = "\n".join(check_items)

    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc_hash = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(calc_hash, hash_recv)
