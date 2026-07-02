#!/bin/bash
# StudyFlow AI — автоматты іске қосу скрипті

cd "$(dirname "$0")"

# iTerm немесе Terminal арқылы терезелер ашу
osascript <<'EOF'
tell application "Terminal"
    activate

    -- 1) Backend
    set backendWin to do script "cd ~/EduMS/backend && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./mvnw spring-boot:run"
    set custom title of backendWin to "🟢 EduMS Backend"

    delay 1

    -- 2) ngrok
    set ngrokWin to do script "sleep 12 && ngrok http 8080 --domain=doorknob-calzone-busybody.ngrok-free.app 2>/dev/null || ngrok http 8080"
    set custom title of ngrokWin to "🔗 ngrok tunnel"

    delay 1

    -- 3) Frontend dev (локально ашу үшін)
    -- set frontWin to do script "cd ~/EduMS/frontend && npm run dev && open http://localhost:5173"
    -- set custom title of frontWin to "⚛️ Frontend"

    -- Сайтты браузерде аш
    delay 15
    do script "open https://edu-ms.vercel.app"
end tell
EOF

echo "✅ StudyFlow AI іске қосылуда..."
echo "   Backend: http://localhost:8080"
echo "   Сайт:    https://edu-ms.vercel.app"
echo ""
echo "Жабу үшін осы терезені жап."
