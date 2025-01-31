from fastapi import FastAPI, HTTPException, Path, Query, Body, Depends
from typing import Optional, List, Dict, Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext # библиотека для ХЕША паролей 

#импорт наших классов
from .models import Base, User
from .database import engine, session_local
from .schemas import UserCreate, User as DbUser # "as" создает песевдоним для того что бы названия не конфликтовали 


app = FastAPI()

# Импортируем CORSMiddleware для разрешения кросс-доменных запросов
# CORS (Cross-Origin Resource Sharing) нужно, чтобы фронтенд с другого домена/порта мог отправлять запросы на наш сервер
from fastapi.middleware.cors import CORSMiddleware

# Разрешаем все источники для теста
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST, и т.д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #Настройка контекста для bcrypt


# функция ХЕШИРОВАНИЯ 
def hash_password(password: str) -> str:
    return pwd_context.hash(password)



# функция создает сессию для подключения к ДБ
def get_db():
    db = session_local()
    try:
        yield db 
    finally:
        db.close()


@app.post("/users/", response_model=DbUser) # response_model=DbUser указывает, что ответ на запрос будет соответствовать модели DbUser(User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)) -> DbUser:   
     # Проверяем, есть ли уже пользователь с таким именем
    existing_user = db.query(User).filter(User.name == user.name).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")  
    
    # Хешируем пароль
    hashed_password = hash_password(user.password)
    
    # Создаем пользователя с хешированным паролем
    db_user = User(name=user.name, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# Дополнительный маршрут, который будет проверять, существует ли пользователь
# Этот эндпоинт вернет {"exists": True}, если пользователь есть, и 404, если его нет.
@app.get("/users/{name}")
async def check_user(name: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == name).first()
    if user:
        return {"exists": True}
    raise HTTPException(status_code=404, detail="Пользователь не найден")


# Вывод всех данных
@app.get("/users/", response_model=List[DbUser])
async def users(db: Session = Depends(get_db)):
    return db.query(User).all()



# Самостоятельная работа, я захотел попробовать сделать вывод конкретных пользователей и постов по id
@app.get("/user/{id}", response_model=DbUser)
async def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


