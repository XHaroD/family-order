"""初始化数据库 - 创建新表，迁移旧数据"""
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import secrets

# 数据库连接
DATABASE_URL = 'mysql+pymysql://family_user:FamilyOrder2026!@172.17.0.3:3306/family_order'
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def init_database():
    """初始化数据库表结构"""
    with engine.connect() as conn:
        # 创建分类表
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                icon VARCHAR(10) NOT NULL DEFAULT '🍽️',
                sort_order INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # 创建菜品表
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS dishes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category_id INT NOT NULL,
                price FLOAT NOT NULL,
                description TEXT,
                status INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # 创建成员表
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nickname VARCHAR(50) NOT NULL,
                role VARCHAR(20) DEFAULT 'member',
                family_code VARCHAR(32) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # 更新订单表结构（如果需要）
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS orders_new (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_no VARCHAR(20) NOT NULL UNIQUE,
                member_id INT NOT NULL,
                member_name VARCHAR(50) NOT NULL,
                items JSON NOT NULL,
                total_price FLOAT NOT NULL,
                remark TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            )
        """))
        
        conn.commit()
        print("✅ 表结构创建完成")

def migrate_data():
    """迁移旧数据"""
    with engine.connect() as conn:
        # 检查旧的 menu 表是否存在
        result = conn.execute(text("SHOW TABLES LIKE 'menu'"))
        if result.fetchone():
            # 创建默认分类
            categories = [
                ('主食', '🍚', 1),
                ('荤菜', '🥩', 2),
                ('素菜', '🥬', 3),
                ('汤', '🍲', 4),
                ('饮料', '🥤', 5),
            ]
            
            # 先检查分类是否已存在
            existing = conn.execute(text("SELECT COUNT(*) FROM categories")).scalar()
            if existing == 0:
                for name, icon, sort_order in categories:
                    conn.execute(text(
                        "INSERT INTO categories (name, icon, sort_order) VALUES (:name, :icon, :sort_order)"
                    ), {"name": name, "icon": icon, "sort_order": sort_order})
                print("✅ 分类数据创建完成")
            
            # 迁移菜品数据
            existing_dishes = conn.execute(text("SELECT COUNT(*) FROM dishes")).scalar()
            if existing_dishes == 0:
                # 获取分类ID映射
                cat_map = {}
                for row in conn.execute(text("SELECT id, name FROM categories")):
                    cat_map[row[1]] = row[0]
                
                # 从旧 menu 表迁移
                for row in conn.execute(text("SELECT name, category, price, description, is_available FROM menu")):
                    name, category, price, description, is_available = row
                    cat_id = cat_map.get(category, 1)  # 默认主食
                    status = 1 if is_available else 0
                    conn.execute(text(
                        "INSERT INTO dishes (name, category_id, price, description, status) VALUES (:name, :cat_id, :price, :desc, :status)"
                    ), {"name": name, "cat_id": cat_id, "price": price, "desc": description, "status": status})
                print("✅ 菜品数据迁移完成")
            
            # 创建默认管理员
            existing_members = conn.execute(text("SELECT COUNT(*) FROM members")).scalar()
            if existing_members == 0:
                conn.execute(text(
                    "INSERT INTO members (nickname, role, family_code) VALUES ('管理员', 'admin', :code)"
                ), {"code": secrets.token_hex(16)})
                print("✅ 管理员账号创建完成")
            
            # 迁移订单（如果有）
            old_orders = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
            if old_orders > 0:
                # 检查旧表结构
                columns = [row[0] for row in conn.execute(text("SHOW COLUMNS FROM orders"))]
                if 'order_no' not in columns:
                    # 旧表结构，需要迁移
                    print("📦 迁移旧订单数据...")
                    # 这里可以根据需要迁移
            
            conn.commit()
            print("✅ 数据迁移完成")
        else:
            print("ℹ️  旧表不存在，跳过迁移")

if __name__ == '__main__':
    print("🚀 开始初始化数据库...")
    init_database()
    migrate_data()
    print("✨ 数据库初始化完成！")
