# Admin Dashboard - Frontend MVVM (React + Vite)
# Puerto: 3002

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Use mock mode (admin endpoints not yet implemented in backend)
# TODO: Change to false when backend admin endpoints are ready
ENV VITE_API_URL=http://host.docker.internal:8080/api
ENV VITE_USE_MOCK=true
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
