# Catalog Service - SOA Enterprise Service
# Puerto: 8092 - Gestión de catálogo multicanal

FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar POM padre y todos los POMs de módulos
COPY pom.xml ./pom.xml
COPY security-service/pom.xml ./security-service/pom.xml
COPY customer-service/pom.xml ./customer-service/pom.xml
COPY catalog-service/pom.xml ./catalog-service/pom.xml
COPY order-service/pom.xml ./order-service/pom.xml
COPY payment-service/pom.xml ./payment-service/pom.xml
COPY notification-service/pom.xml ./notification-service/pom.xml
COPY billing-service/pom.xml ./billing-service/pom.xml
COPY recommendation-service/pom.xml ./recommendation-service/pom.xml

COPY catalog-service/src ./catalog-service/src
RUN mvn clean package -DskipTests -B -pl catalog-service

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/catalog-service/target/*.jar app.jar
EXPOSE 8092
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8092/actuator/health || exit 1
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
