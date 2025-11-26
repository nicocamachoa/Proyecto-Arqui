# Admin Dashboard - Frontend MVVM (React + Vite)
# Puerto: 3002

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Use real API mode (backend admin endpoints are now ready)
# Use localhost:8080 as the browser runs outside Docker
ENV VITE_API_URL=http://localhost:8080/api
ENV VITE_USE_MOCK=false
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
