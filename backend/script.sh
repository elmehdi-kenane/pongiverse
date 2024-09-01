
directories=(
    "./ft_trans/src/Profile/__pycache__"
    "./ft_trans/src/Profile/migrations"
    "./ft_trans/src/chat/__pycache__"
    "./ft_trans/src/chat/migrations"
    "./ft_trans/src/friends/__pycache__"
    "./ft_trans/src/friends/migrations"
    "./ft_trans/src/ft_transcandence/__pycache__"
    "./ft_trans/src/ft_transcandence/migrations"
    "./ft_trans/src/mainApp/__pycache__"
    "./ft_trans/src/mainApp/migrations"
    "./ft_trans/src/myapp/__pycache__"
    "./ft_trans/src/myapp/migrations"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir" && echo "$dir deleted"
    else
        echo "$dir not found"
    fi
done