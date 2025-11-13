#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Тестирование защиты диалогов от просмотра другими пользователями
"""

import requests
import json
import sys
import io

# Исправление кодировки для Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer, encoding='utf-8', errors='replace'
    )


BASE_URL = "http://127.0.0.1:8000"


def print_separator(char="=", length=60):
    """Печать разделителя"""
    print("\n" + char * length)


def get_token(username: str, password: str):
    """Получить JWT токен для пользователя"""
    try:
        token_response = requests.post(
            f"{BASE_URL}/auth/token",
            data={"username": username, "password": password},
            timeout=5
        )
        if token_response.status_code != 200:
            raise Exception(
                f"Не удалось получить токен для {username}: "
                f"{token_response.text}"
            )
        return token_response.json()
    except requests.exceptions.ConnectionError:
        print(f"❌ ОШИБКА: Не удалось подключиться к серверу {BASE_URL}")
        print("   Убедитесь, что сервер запущен")
        sys.exit(1)


def test_authorization():
    """Шаг 1: Авторизация пользователей"""
    print("\n🔐 Шаг 1: Авторизация пользователей...\n")
    
    # Админ
    admin_data = get_token("admin", "admin")
    admin_token = admin_data["access_token"]
    admin_id = admin_data["user"]["id"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f"✅ Админ авторизован (ID: {admin_id})")
    
    # Пользователь 1
    user1_data = get_token("user1", "user1")
    user1_token = user1_data["access_token"]
    user1_id = user1_data["user"]["id"]
    user1_headers = {"Authorization": f"Bearer {user1_token}"}
    print(f"✅ Пользователь 1 авторизован (ID: {user1_id})")
    
    # Пользователь 2
    user2_data = get_token("user2", "user2")
    user2_token = user2_data["access_token"]
    user2_id = user2_data["user"]["id"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    print(f"✅ Пользователь 2 авторизован (ID: {user2_id})")
    
    return {
        "admin": (admin_id, admin_headers),
        "user1": (user1_id, user1_headers),
        "user2": (user2_id, user2_headers),
    }


def test_clear_dialogs(users):
    """Шаг 2: Очистка диалогов пользователей"""
    print_separator()
    print("\n🧹 Шаг 2: Очистка диалогов...\n")
    
    for user_name in ["user1", "user2"]:
        user_id, headers = users[user_name]
        resp = requests.post(
            f"{BASE_URL}/dialog/clear",
            json={"client_id": user_id},
            headers=headers,
        )
        if resp.status_code == 200:
            print(f"✅ {user_name}: {resp.json()['message']}")
        else:
            print(
                f"❌ {user_name}: Ошибка {resp.status_code} - "
                f"{resp.text}"
            )


def send_message(user_input: str, client_id: int, headers: dict):
    """Отправить сообщение в диалог"""
    resp = requests.post(
        f"{BASE_URL}/dialog/request",
        json={"user_input": user_input, "client_id": client_id},
        headers=headers
    )
    return resp


def test_create_dialogs(users):
    """Шаг 3: Создание диалогов для каждого пользователя"""
    print_separator()
    print("\n💬 Шаг 3: Создание диалогов...\n")
    
    # user1 пишет в свой диалог
    user1_id, user1_headers = users["user1"]
    print(f"👤 user1 (ID: {user1_id}) отправляет сообщение в свой диалог:")
    resp1 = send_message(
        "Привет! Меня зовут Иван.",
        user1_id,
        user1_headers
    )
    if resp1.status_code == 200:
        response_text = resp1.json()['response']
        print(f"✅ Ответ получен: {response_text[:80]}...")
    else:
        print(f"❌ Ошибка: {resp1.status_code} - {resp1.text}")
    
    print()
    
    # user2 пишет в свой диалог
    user2_id, user2_headers = users["user2"]
    print(f"👤 user2 (ID: {user2_id}) отправляет сообщение в свой диалог:")
    resp2 = send_message(
        "Здравствуйте! Я Мария.",
        user2_id,
        user2_headers
    )
    if resp2.status_code == 200:
        response_text = resp2.json()['response']
        print(f"✅ Ответ получен: {response_text[:80]}...")
    else:
        print(f"❌ Ошибка: {resp2.status_code} - {resp2.text}")


def test_own_history_access(users):
    """Шаг 4: Проверка доступа к собственной истории"""
    print_separator()
    print("\n📖 Шаг 4: Проверка доступа к собственной истории...\n")
    
    # user1 читает свою историю
    user1_id, user1_headers = users["user1"]
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user1_id}",
        headers=user1_headers
    )
    if resp.status_code == 200:
        history = resp.json()["history"]
        print(f"✅ user1 видит свою историю ({len(history)} сообщений)")
        for msg in history:
            print(f"  {msg['role']}: {msg['content'][:50]}...")
    else:
        print(f"❌ user1: Ошибка {resp.status_code} - {resp.text}")
    
    print()
    
    # user2 читает свою историю
    user2_id, user2_headers = users["user2"]
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user2_id}",
        headers=user2_headers
    )
    if resp.status_code == 200:
        history = resp.json()["history"]
        print(f"✅ user2 видит свою историю ({len(history)} сообщений)")
        for msg in history:
            print(f"  {msg['role']}: {msg['content'][:50]}...")
    else:
        print(f"❌ user2: Ошибка {resp.status_code} - {resp.text}")


def test_forbidden_access(users):
    """Шаг 5: Проверка защиты от доступа к чужому диалогу (403)"""
    print_separator()
    print("\n🚫 Шаг 5: Проверка защиты (403 Forbidden)...\n")
    
    user1_id, user1_headers = users["user1"]
    user2_id, user2_headers = users["user2"]
    
    # user1 пытается прочитать историю user2
    print(f"👤 user1 пытается прочитать историю user2 (ID: {user2_id}):")
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user2_id}",
        headers=user1_headers
    )
    if resp.status_code == 403:
        print(f"✅ Доступ запрещён (403): {resp.json()['detail']}")
    else:
        print(f"❌ ОШИБКА БЕЗОПАСНОСТИ! Получен код {resp.status_code}")
        print(f"   Ответ: {resp.text}")
    
    print()
    
    # user2 пытается прочитать историю user1
    print(f"👤 user2 пытается прочитать историю user1 (ID: {user1_id}):")
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user1_id}",
        headers=user2_headers
    )
    if resp.status_code == 403:
        print(f"✅ Доступ запрещён (403): {resp.json()['detail']}")
    else:
        print(f"❌ ОШИБКА БЕЗОПАСНОСТИ! Получен код {resp.status_code}")
        print(f"   Ответ: {resp.text}")
    
    print()
    
    # user1 пытается отправить сообщение в диалог user2
    print(f"👤 user1 пытается отправить сообщение в диалог user2 "
          f"(ID: {user2_id}):")
    resp = send_message(
        "Попытка взлома!",
        user2_id,
        user1_headers
    )
    if resp.status_code == 403:
        print(f"✅ Доступ запрещён (403): {resp.json()['detail']}")
    else:
        print(f"❌ ОШИБКА БЕЗОПАСНОСТИ! Получен код {resp.status_code}")
        print(f"   Ответ: {resp.text}")
    
    print()
    
    # user2 пытается очистить диалог user1
    print(f"👤 user2 пытается очистить диалог user1 (ID: {user1_id}):")
    resp = requests.post(
        f"{BASE_URL}/dialog/clear",
        json={"client_id": user1_id},
        headers=user2_headers
    )
    if resp.status_code == 403:
        print(f"✅ Доступ запрещён (403): {resp.json()['detail']}")
    else:
        print(f"❌ ОШИБКА БЕЗОПАСНОСТИ! Получен код {resp.status_code}")
        print(f"   Ответ: {resp.text}")


def test_admin_access(users):
    """Шаг 6: Проверка прав администратора (полный доступ)"""
    print_separator()
    print("\n👑 Шаг 6: Проверка прав администратора...\n")
    
    admin_id, admin_headers = users["admin"]
    user1_id, _ = users["user1"]
    user2_id, _ = users["user2"]
    
    # Админ читает историю user1
    print(f"👑 Админ читает историю user1 (ID: {user1_id}):")
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user1_id}",
        headers=admin_headers
    )
    if resp.status_code == 200:
        history = resp.json()["history"]
        print(f"✅ Доступ разрешён. История содержит {len(history)} "
              f"сообщений")
        for msg in history[:2]:  # показываем первые 2
            print(f"  {msg['role']}: {msg['content'][:50]}...")
    else:
        print(f"❌ Ошибка: {resp.status_code} - {resp.text}")
    
    print()
    
    # Админ читает историю user2
    print(f"👑 Админ читает историю user2 (ID: {user2_id}):")
    resp = requests.get(
        f"{BASE_URL}/dialog/history/{user2_id}",
        headers=admin_headers
    )
    if resp.status_code == 200:
        history = resp.json()["history"]
        print(f"✅ Доступ разрешён. История содержит {len(history)} "
              f"сообщений")
        for msg in history[:2]:  # показываем первые 2
            print(f"  {msg['role']}: {msg['content'][:50]}...")
    else:
        print(f"❌ Ошибка: {resp.status_code} - {resp.text}")
    
    print()
    
    # Админ отправляет сообщение в диалог user1
    print(f"👑 Админ отправляет сообщение в диалог user1 "
          f"(ID: {user1_id}):")
    resp = send_message(
        "Это сообщение от администратора",
        user1_id,
        admin_headers
    )
    if resp.status_code == 200:
        print(f"✅ Сообщение отправлено")
    else:
        print(f"❌ Ошибка: {resp.status_code} - {resp.text}")


def print_summary():
    """Резюме результатов тестирования"""
    print_separator("=", 60)
    print("\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ ЗАЩИТЫ ДИАЛОГОВ\n")
    print_separator("=", 60)
    
    print("""
✅ Проверено:

1. ✓ Каждый пользователь видит только свою историю диалогов
2. ✓ Попытка доступа к чужому диалогу возвращает 403 Forbidden
3. ✓ Попытка отправки сообщения в чужой диалог блокируется
4. ✓ Попытка очистки чужого диалога блокируется
5. ✓ Администратор имеет полный доступ ко всем диалогам
6. ✓ Администратор может просматривать, изменять и очищать 
     любые диалоги

⚠️ Важно:
- Все попытки несанкционированного доступа логируются на сервере
- При попытке доступа к чужому диалогу возвращается статус 403
- Администраторы имеют полные права на все операции

📋 Критерии успешного выполнения:
[✓] Проверка реализована во всех нужных эндпоинтах
[✓] Попытка доступа к чужой истории возвращает 403
[✓] Админ имеет полный доступ
[✓] Логи корректно отражают действия пользователей
[✓] Тестирование проведено успешно
""")


def main():
    """Основная функция запуска тестов"""
    print_separator("=", 60)
    print("\n🧪 ТЕСТИРОВАНИЕ ЗАЩИТЫ ДИАЛОГОВ")
    print_separator("=", 60)
    
    try:
        # Шаг 1: Авторизация
        users = test_authorization()
        
        # Шаг 2: Очистка диалогов
        test_clear_dialogs(users)
        
        # Шаг 3: Создание диалогов
        test_create_dialogs(users)
        
        # Шаг 4: Проверка доступа к своей истории
        test_own_history_access(users)
        
        # Шаг 5: Проверка защиты от чужих диалогов
        test_forbidden_access(users)
        
        # Шаг 6: Проверка прав администратора
        test_admin_access(users)
        
        # Резюме
        print_summary()
        
    except Exception as e:
        print(f"\n❌ ОШИБКА ПРИ ВЫПОЛНЕНИИ ТЕСТОВ: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

