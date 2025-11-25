# Customer Portal - Frontend MVVM (React + Vite)
# Puerto: 3000

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
