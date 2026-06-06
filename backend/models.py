from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from datetime import datetime
from database import Base

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(10), nullable=False, default='🍽️')
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

class Dish(Base):
    __tablename__ = 'dishes'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Integer, default=1)  # 1=在售 0=下架
    created_at = Column(DateTime, default=datetime.now)

class Member(Base):
    __tablename__ = 'members'
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), nullable=False)
    role = Column(String(20), default='member')  # member/chef/admin
    family_code = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(20), nullable=False, unique=True)  # 订单号
    member_id = Column(Integer, nullable=False)
    member_name = Column(String(50), nullable=False)
    items = Column(JSON, nullable=False)  # 菜品列表 [{"dish_id":1,"dish_name":"米饭","quantity":2,"unit_price":3.0}]
    total_price = Column(Float, nullable=False)
    remark = Column(Text, nullable=True)
    status = Column(String(20), default='pending')  # pending/cooking/done/cancelled
    created_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
