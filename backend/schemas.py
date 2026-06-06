from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 菜单相关
class MenuCreate(BaseModel):
    name: str
    category: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

class MenuResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: Optional[str]
    image_url: Optional[str]
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True

# 订单相关
class OrderCreate(BaseModel):
    dish_id: int
    quantity: int = 1
    note: Optional[str] = None
    member_name: str

class OrderResponse(BaseModel):
    id: int
    dish_id: int
    dish_name: str
    quantity: int
    price: float
    total: float
    note: Optional[str]
    member_name: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
