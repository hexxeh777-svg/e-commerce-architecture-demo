FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
# Удаляем package-lock.json и устанавливаем все зависимости (включая dev), т.к. esbuild-wasm нужен для сборки
RUN rm -f package-lock.json && npm install

# Запускаем сборку
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]