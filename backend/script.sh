
directories=(
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/Profile/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/Profile/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/chat/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/chat/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/friends/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/friends/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/ft_transcandence/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/ft_transcandence/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/mainApp/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/mainApp/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/Notifications/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/Notifications/migrations"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/myapp/__pycache__"
    "/goinfre/ekenane/ft_transcendence/backend/ft_trans/src/myapp/migrations"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir" && echo "$dir deleted"
    else
        echo "$dir not found"
    fi
done