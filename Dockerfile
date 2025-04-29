# 1 этап — билд (Node.js для сборки)
FROM node:20 AS build

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект
COPY . .

# Запускаем сборку через Parcel
RUN npm run build

# 2 этап — чистый nginx для запуска
FROM nginx:alpine

# Копируем готовую сборку в nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]