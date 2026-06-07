#!/bin/bash
# 启动家庭点单系统后端服务

echo "🚀 启动家庭点单系统..."

# 检查 Python 环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -r backend/requirements.txt -q

# 初始化数据库
echo "🗄️ 初始化数据库..."
cd backend
python init_db.py
cd ..

# 启动服务
echo "✅ 启动服务在 http://0.0.0.0:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
