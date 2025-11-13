# app/routes/dialog.py

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.dialog import AssistantDialog
from app.routes.auth import get_current_user
from app.services.profile import read_lead_service
from typing import Optional, List, Dict, Any
import json

router = APIRouter()

class DialogHistoryResponse(BaseModel):
    client_id: int
    history: List[Dict[str, Any]]

@router.get(
    "/history/{client_id}",
    response_model=DialogHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Получить историю диалога по client_id",
    response_description="Возвращает историю диалога клиента из поля `log` в формате JSON",
    responses={
        200: {
            "description": "История диалога успешно получена",
            "content": {
                "application/json": {
                    "example": {
                        "client_id": 7,
                        "history": [
                            {"role": "user", "content": "Здравствуйте"},
                            {"role": "assistant", "content": "Привет! Чем могу помочь?"}
                        ]
                    }
                }
            },
        },
        401: {"description": "Некорректный пользователь или токен"},
        404: {"description": "Диалог не найден"},
        500: {"description": "Ошибка при получении истории диалога"},
    },
)
async def get_dialog_history(
    client_id: int,
    request: Request,
    current_user: str = Depends(get_current_user),
):
    """
    Возвращает историю диалога клиента из поля `log` таблицы `leads`.

    - **client_id** — идентификатор клиента  
    - **history** — список сообщений [{"role": "user"|"assistant", "content": "текст"}]
    """
    
    # Проверяем права доступа: админ может всё, обычный пользователь — только свою историю
    if not current_user.is_admin and client_id != current_user.id:
        await request.app.state.log.log_warning(
            "dialog",
            "Попытка доступа к чужому диалогу",
            {"user": current_user.login, "target_client_id": client_id}
        )
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещён: чужой диалог"
        )    
    
    try:
        lead = await read_lead_service(client_id, request)

        try:
            history_data = json.loads(lead.log) if lead.log else []
        except json.JSONDecodeError:
            history_data = []

        await request.app.state.log.log_info(
            "dialog",
            "История диалога успешно получена",
            {
                "client_id": client_id,
                "user": current_user.login,
                "is_admin": current_user.is_admin
            }
        )

        return {"client_id": client_id, "history": history_data}

    except HTTPException:
        # read_lead_service сам бросает 404, пробрасываем дальше
        raise
    except Exception as e:
        await request.app.state.log.log_error(
            "dialog",
            f"Ошибка при получении истории диалога: {str(e)}",
            {"client_id": client_id},
        )
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении истории диалога: {str(e)}",
        )

class DialogRequest(BaseModel):
    user_input: str
    client_id: Optional[int] = 1


class DialogClear(BaseModel):
    client_id: Optional[int] = 1

class DialogResponse(BaseModel):
    response: str                     # ответ ассистента (текст)
    history: List[Dict[str, Any]]     # история диалога

@router.post(
    "/request",
    summary="Обработать шаг диалога",
    responses={
        200: {"description": "Ответ ассистента успешно сгенерирован"},
        400: {"description": "Некорректный запрос"},
        401: {"description": "Некорректный пользователь или токен"},
        500: {"description": "Ошибка обработки шага диалога"},
    },
)
async def dialog_request(
    request: Request,
    payload: DialogRequest,
    current_user: str = Depends(get_current_user),
) -> DialogResponse:
    
    # Защита от подмены client_id: админ может всё, обычный пользователь — только свой диалог
    if not current_user.is_admin and payload.client_id != current_user.id:
        await request.app.state.log.log_warning(
            "dialog",
            "Попытка запроса к чужому диалогу",
            {
                "user": current_user.login,
                "target_client_id": payload.client_id
            }
        )
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещён: чужой диалог"
        )    
    
    if not payload.user_input.strip():
        await request.app.state.log.log_error(
            "dialog", "Пустой user_input в диалоге", {"client_id": payload.client_id}
        )
        raise HTTPException(status_code=400, detail="Параметр 'user_input' обязателен")

    try:
        dialog = AssistantDialog(client_id=payload.client_id, request=request)
        response = await dialog.step(payload.user_input)
        await request.app.state.log.log_info(
            "dialog",
            "Шаг диалога обработан",
            {
                "client_id": payload.client_id,
                "user": current_user.login,
                "is_admin": current_user.is_admin
            }
        )
        return JSONResponse(
            content={"response": response, "history": dialog.dialog_history},
            status_code=200,
        )
    except Exception as e:
        await request.app.state.log.log_error(
            "dialog",
            f"Ошибка при обработке шага диалога: {str(e)}",
            {"client_id": payload.client_id},
        )
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка обработки шага диалога: {str(e)}",
        )


@router.post(
    "/clear",
    summary="Очистить историю диалога клиента",
    responses={
        200: {"description": "История диалога успешно очищена"},
        401: {"description": "Некорректный пользователь или токен"},
        500: {"description": "Ошибка при очистке диалога"},
    },
)
async def dialog_clear(
    request: Request,
    payload: DialogClear,
    current_user: str = Depends(get_current_user),
):
    
    # Защита от очистки чужого диалога: админ может всё, обычный пользователь — только свой
    if not current_user.is_admin and payload.client_id != current_user.id:
        await request.app.state.log.log_warning(
            "dialog",
            "Попытка очистки чужого диалога",
            {
                "user": current_user.login,
                "target_client_id": payload.client_id
            }
        )
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещён: чужой диалог"
        )    
    
    try:
        dialog = AssistantDialog(client_id=payload.client_id, request=request)
        await dialog.clear_dialog()
        await request.app.state.log.log_info(
            "dialog",
            "История диалога очищена",
            {
                "client_id": payload.client_id,
                "user": current_user.login,
                "is_admin": current_user.is_admin
            }
        )
        return JSONResponse(
            content={"message": f"Диалог для клиента {payload.client_id} очищен"},
            status_code=200,
        )
    except Exception as e:
        await request.app.state.log.log_error(
            "dialog",
            f"Ошибка при очистке диалога: {str(e)}",
            {"client_id": payload.client_id},
        )
        raise HTTPException(
            status_code=500, detail=f"Ошибка при очистке диалога: {str(e)}"
        )
