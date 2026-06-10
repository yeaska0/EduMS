#!/bin/bash
echo "🚀 EduMS іске қосылуда..."
docker compose up --build -d
echo ""
echo "✅ Дайын!"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8080"
echo "   Swagger:   http://localhost:8080/swagger-ui.html"
echo ""
echo "Логтарды көру үшін: docker compose logs -f"
echo "Тоқтату үшін:       docker compose down"
