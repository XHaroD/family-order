"""修复菜品分类"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = 'mysql+pymysql://family_user:***@172.17.0.3:3306/family_order'
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def fix_categories():
    with engine.connect() as conn:
        # 获取分类ID映射
        categories = {}
        for row in conn.execute(text("SELECT id, name FROM categories")):
            categories[row[1]] = row[0]
        
        print("分类映射:", categories)
        
        # 更新菜品分类
        updates = [
            ('米饭', '主食'),
            ('红烧肉', '荤菜'),
            ('西红柿炒蛋', '素菜'),
            ('紫菜蛋花汤', '汤'),
            ('可乐', '饮料'),
            ('宫保鸡丁', '荤菜'),
        ]
        
        for dish_name, cat_name in updates:
            cat_id = categories.get(cat_name)
            if cat_id:
                conn.execute(
                    text("UPDATE dishes SET category_id = :cat_id WHERE name = :name"),
                    {"cat_id": cat_id, "name": dish_name}
                )
                print(f"  {dish_name} -> {cat_name} (ID: {cat_id})")
        
        conn.commit()
        print("✅ 分类修复完成")

if __name__ == '__main__':
    fix_categories()
