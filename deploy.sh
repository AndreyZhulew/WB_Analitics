#!/usr/bin/env sh

# остановить публикацию при ошибках
set -e

# сборка
npm run build

# переход в каталог сборки
cd dist

# если используешь кастомный домен
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# пуш в ветку gh-pages
git push -f https://github.com/AndreyZhulew/WB_Analitics.git main:gh-pages

cd -