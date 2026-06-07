from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import uuid
import secrets

from database import get_db, engine, Base
from models import Category, Dish, Member, Order

Base.metadata.create_all(bind=engine)

app = FastAPI(title="家庭点单系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 菜品管理 ==========

@app.get("/api/dishes")
def get_dishes(status: Optional[int] = None, category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Dish)
    if status is not None:
        query = query.filter(Dish.status == status)
    if category_id is not None:
        query = query.filter(Dish.category_id == category_id)
    dishes = query.all()
    
    # 获取分类信息
    categories = {c.id: c.name for c in db.query(Category).all()}
    
    return {"code": 0, "data": [{
        "id": d.id,
        "name": d.name,
        "category_id": d.category_id,
        "category": categories.get(d.category_id, ''),
        "description": d.description,
        "status": d.status,
    } for d in dishes]}

@app.post("/api/dishes")
def create_dish(body: dict, db: Session = Depends(get_db)):
    dish = Dish(
        name=body['name'],
        category_id=body['categoryId'],
        description=body.get('description', ''),
    )
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return {"code": 0, "data": {"id": dish.id}}

@app.put("/api/dishes/{dish_id}")
def update_dish(dish_id: int, body: dict, db: Session = Depends(get_db)):
    dish = db.query(Dish).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail='菜品不存在')
    if 'name' in body: dish.name = body['name']
    if 'categoryId' in body: dish.category_id = body['categoryId']
    if 'description' in body: dish.description = body['description']
    if 'status' in body: dish.status = body['status']
    db.commit()
    return {"code": 0}

@app.delete("/api/dishes/{dish_id}")
def delete_dish(dish_id: int, db: Session = Depends(get_db)):
    dish = db.query(Dish).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail='菜品不存在')
    db.delete(dish)
    db.commit()
    return {"code": 0}

# ========== 分类管理 ==========

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order).all()
    return {"code": 0, "data": [{
        "id": c.id,
        "name": c.name,
        "icon": c.icon,
        "sort_order": c.sort_order,
        "dish_count": db.query(Dish).filter(Dish.category_id == c.id).count(),
    } for c in categories]}

@app.post("/api/categories")
def create_category(body: dict, db: Session = Depends(get_db)):
    cat = Category(name=body['name'], icon=body.get('icon', '🍽️'), sort_order=body.get('sortOrder', 0))
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"code": 0, "data": {"id": cat.id}}

@app.put("/api/categories/{cat_id}")
def update_category(cat_id: int, body: dict, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail='分类不存在')
    if 'name' in body: cat.name = body['name']
    if 'icon' in body: cat.icon = body['icon']
    if 'sortOrder' in body: cat.sort_order = body['sortOrder']
    db.commit()
    return {"code": 0}

@app.delete("/api/categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail='分类不存在')
    # 同时删除该分类下的菜品
    db.query(Dish).filter(Dish.category_id == cat_id).delete()
    db.delete(cat)
    db.commit()
    return {"code": 0}

# ========== 订单管理 ==========

@app.get("/api/orders")
def get_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).all()
    return {"code": 0, "data": [{
        "id": o.id,
        "order_no": o.order_no,
        "member_name": o.member_name,
        "items": o.items,
        "remark": o.remark,
        "status": o.status,
        "created_at": o.created_at.strftime('%Y-%m-%d %H:%M'),
    } for o in orders]}

@app.post("/api/orders")
def create_order(body: dict, db: Session = Depends(get_db)):
    member_name = body.get('member_name', '').strip()
    if not member_name:
        raise HTTPException(status_code=400, detail='请输入昵称')
    
    items = body['items']
    
    order_no = datetime.now().strftime('%Y%m%d%H%M%S') + secrets.token_hex(3).upper()
    order = Order(
        order_no=order_no,
        member_name=member_name,
        items=items,
        remark=body.get('remark'),
        status='pending'
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return {"code": 0, "data": {"order_no": order.order_no, "id": order.id}}

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, body: dict, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail='订单不存在')
    order.status = body['status']
    if body['status'] == 'done':
        order.completed_at = datetime.now()
    db.commit()
    return {"code": 0}

# 健康检查
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
