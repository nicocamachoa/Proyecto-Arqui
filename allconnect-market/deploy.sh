#!/bin/bash

# =============================================================================
# AllConnect Market - Script de Despliegue Automatizado
# Arquitectura: SOA (Service-Oriented Architecture)
# Compatible con: Linux, macOS, Windows (Git Bash/WSL)
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
MAX_RETRIES=30
RETRY_INTERVAL=5

# =============================================================================
# Funciones de utilidad
# =============================================================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║           AllConnect Market - Despliegue Automatizado             ║"
    echo "║                    Plataforma E-commerce SOA                      ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 no está instalado. Por favor instálalo antes de continuar."
        exit 1
    fi
}

wait_for_healthy() {
    local service=$1
    local max_attempts=${2:-$MAX_RETRIES}
    local attempt=1

    log_info "Esperando que $service esté healthy..."

    while [ $attempt -le $max_attempts ]; do
        local status=$(docker inspect --format='{{.State.Health.Status}}' "allconnect-$service" 2>/dev/null || echo "not_found")

        if [ "$status" = "healthy" ]; then
            log_success "$service está healthy"
            return 0
        elif [ "$status" = "not_found" ]; then
            log_warning "$service no encontrado, reintentando..."
        else
            printf "\r  Intento $attempt/$max_attempts - Estado: $status"
        fi

        sleep $RETRY_INTERVAL
        ((attempt++))
    done

    log_error "$service no alcanzó estado healthy después de $max_attempts intentos"
    return 1
}

wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-20}
    local attempt=1

    log_info "Verificando $service_name en $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200\|302"; then
            log_success "$service_name está respondiendo"
            return 0
        fi

        printf "\r  Intento $attempt/$max_attempts"
        sleep 2
        ((attempt++))
    done

    log_warning "$service_name no responde en $url (puede estar iniciando)"
    return 0
}

# =============================================================================
# Funciones de despliegue
# =============================================================================

check_prerequisites() {
    log_step "Paso 1/8: Verificando prerequisitos"

    check_command docker
    check_command docker-compose
    check_command curl

    # Verificar Docker está corriendo
    if ! docker info &> /dev/null; then
        log_error "Docker no está corriendo. Por favor inicia Docker Desktop."
        exit 1
    fi

    log_success "Docker está corriendo ($(docker version --format '{{.Server.Version}}'))"

    # Verificar docker-compose.yml existe
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "No se encontró docker-compose.yml en $SCRIPT_DIR"
        exit 1
    fi

    log_success "Archivo docker-compose.yml encontrado"
}

cleanup_previous() {
    log_step "Paso 2/8: Limpiando despliegue anterior (si existe)"

    cd "$SCRIPT_DIR"

    # Verificar si existe volumen de MySQL
    local mysql_volume=$(docker volume ls -q | grep -E "(mysql-data|mysql_data)" || true)

    if [ -n "$mysql_volume" ] && [ "$FRESH_INSTALL" = false ]; then
        log_warning "¡ATENCIÓN! Se detectó volumen de MySQL existente: $mysql_volume"
        log_warning "El script init-databases.sql NO se ejecutará (solo se ejecuta en volúmenes nuevos)"
        log_warning "Si tienes problemas de login, ejecuta: $0 --fresh"
        echo ""
        read -p "¿Continuar con volumen existente? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Despliegue cancelado. Ejecuta '$0 --fresh' para garantizar login funcional"
            exit 0
        fi
    fi

    # Detener contenedores existentes
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        log_info "Deteniendo contenedores existentes..."
        if [ "$FRESH_INSTALL" = true ]; then
            docker-compose down -v --remove-orphans 2>/dev/null || true
            log_success "Contenedores y volúmenes eliminados"
        else
            docker-compose down --remove-orphans 2>/dev/null || true
            log_success "Contenedores detenidos (volúmenes preservados)"
        fi
    elif [ "$FRESH_INSTALL" = true ] && [ -n "$mysql_volume" ]; then
        log_info "Eliminando volumen de MySQL existente..."
        docker volume rm $mysql_volume 2>/dev/null || true
        log_success "Volumen eliminado"
    fi

    log_success "Limpieza completada"
}

deploy_infrastructure() {
    log_step "Paso 3/8: Desplegando infraestructura base"

    cd "$SCRIPT_DIR"

    log_info "Iniciando MySQL, Redis, Kafka, RabbitMQ, MailDev..."
    docker-compose up -d mysql redis kafka rabbitmq maildev

    # Esperar por servicios críticos
    wait_for_healthy "mysql" 60
    wait_for_healthy "kafka" 60
    wait_for_healthy "redis" 30
    wait_for_healthy "rabbitmq" 30

    log_success "Infraestructura base desplegada"
}

deploy_platform() {
    log_step "Paso 4/8: Desplegando plataforma (Eureka + Gateway)"

    cd "$SCRIPT_DIR"

    log_info "Iniciando Eureka Server..."
    docker-compose up -d eureka
    wait_for_healthy "eureka" 40

    log_info "Iniciando API Gateway..."
    docker-compose up -d gateway
    wait_for_healthy "gateway" 40

    log_success "Plataforma desplegada"
}

deploy_providers() {
    log_step "Paso 5/8: Desplegando Mock Providers (.NET)"

    cd "$SCRIPT_DIR"

    log_info "Iniciando REST, SOAP y gRPC Providers..."
    docker-compose up -d rest-provider soap-provider grpc-provider

    sleep 10

    wait_for_service "http://localhost:4001/api/products" "REST Provider" 15

    log_success "Mock Providers desplegados"
}

deploy_integration() {
    log_step "Paso 6/8: Desplegando Integration Service"

    cd "$SCRIPT_DIR"

    log_info "Iniciando Integration Service..."
    docker-compose up -d integration-service

    sleep 15

    log_success "Integration Service desplegado"
}

deploy_services() {
    log_step "Paso 7/8: Desplegando servicios SOA empresariales"

    cd "$SCRIPT_DIR"

    log_info "Iniciando 8 servicios SOA (esto puede tomar varios minutos en el primer build)..."
    docker-compose up -d \
        security-service \
        customer-service \
        catalog-service \
        order-service \
        payment-service \
        notification-service \
        billing-service \
        recommendation-service

    # Esperar por cada servicio
    local services=("security" "customer" "catalog" "order" "payment" "notification" "billing" "recommendation")

    for service in "${services[@]}"; do
        wait_for_healthy "$service" 60
    done

    log_success "Servicios SOA desplegados"
}

deploy_frontend_observability() {
    log_step "Paso 8/8: Desplegando Frontend y Observabilidad"

    cd "$SCRIPT_DIR"

    log_info "Iniciando Customer Portal, Admin Dashboard..."
    docker-compose up -d customer-portal admin-dashboard

    log_info "Iniciando Prometheus, Grafana, Jaeger..."
    docker-compose up -d prometheus grafana jaeger

    sleep 10

    wait_for_service "http://localhost:3000" "Customer Portal" 15
    wait_for_service "http://localhost:3001" "Grafana" 15
    wait_for_service "http://localhost:9090" "Prometheus" 15

    log_success "Frontend y Observabilidad desplegados"
}

# =============================================================================
# Validación final
# =============================================================================

validate_deployment() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ Validación del Despliegue${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    cd "$SCRIPT_DIR"

    local total=0
    local healthy=0
    local running=0

    echo -e "${BLUE}Estado de contenedores:${NC}\n"

    while IFS= read -r line; do
        ((total++))
        local name=$(echo "$line" | awk '{print $1}')
        local status=$(echo "$line" | awk '{print $2}')

        if [[ "$status" == *"healthy"* ]]; then
            echo -e "  ${GREEN}✓${NC} $name - healthy"
            ((healthy++))
        elif [[ "$status" == *"Up"* ]]; then
            echo -e "  ${YELLOW}●${NC} $name - running"
            ((running++))
        else
            echo -e "  ${RED}✗${NC} $name - $status"
        fi
    done < <(docker-compose ps --format "{{.Name}} {{.Status}}" 2>/dev/null)

    echo -e "\n${BLUE}Resumen:${NC}"
    echo -e "  Total: $total contenedores"
    echo -e "  ${GREEN}Healthy: $healthy${NC}"
    echo -e "  ${YELLOW}Running: $running${NC}"
}

print_urls() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ URLs de Acceso${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${GREEN}Frontend:${NC}"
    echo "  • Customer Portal:    http://localhost:3000"
    echo "  • Admin Dashboard:    http://localhost:3002"

    echo -e "\n${GREEN}Plataforma:${NC}"
    echo "  • Eureka Dashboard:   http://localhost:8761"
    echo "  • API Gateway:        http://localhost:8080"

    echo -e "\n${GREEN}Observabilidad:${NC}"
    echo "  • Grafana:            http://localhost:3001  (admin/admin)"
    echo "  • Prometheus:         http://localhost:9090"
    echo "  • Jaeger:             http://localhost:16686"

    echo -e "\n${GREEN}Herramientas:${NC}"
    echo "  • RabbitMQ UI:        http://localhost:15672 (guest/guest)"
    echo "  • MailDev:            http://localhost:1080"

    echo -e "\n${GREEN}Mock Providers:${NC}"
    echo "  • REST Provider:      http://localhost:4001/api/products"
    echo "  • SOAP Provider:      http://localhost:4002"
    echo "  • gRPC Provider:      http://localhost:4003"
}

print_commands() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ Comandos Útiles${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo "  # Ver estado de contenedores"
    echo "  docker-compose ps"
    echo ""
    echo "  # Ver logs de un servicio"
    echo "  docker-compose logs -f <servicio>"
    echo ""
    echo "  # Reiniciar un servicio"
    echo "  docker-compose restart <servicio>"
    echo ""
    echo "  # Detener todo"
    echo "  docker-compose down"
    echo ""
    echo "  # Detener y eliminar volúmenes"
    echo "  docker-compose down -v"
}

# =============================================================================
# Función principal
# =============================================================================

main() {
    local start_time=$(date +%s)

    print_banner

    # Parsear argumentos
    local FRESH_INSTALL=false
    case "${1:-}" in
        --clean|-c)
            log_info "Modo limpieza: deteniendo todos los contenedores y eliminando volúmenes..."
            cd "$SCRIPT_DIR"
            docker-compose down -v --remove-orphans
            log_success "Limpieza completada (volúmenes eliminados)"
            exit 0
            ;;
        --fresh|-f)
            log_info "Modo fresh install: se eliminarán volúmenes para garantizar datos limpios"
            FRESH_INSTALL=true
            ;;
        --status|-s)
            cd "$SCRIPT_DIR"
            validate_deployment
            print_urls
            exit 0
            ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  (sin opciones)    Despliegue completo del sistema"
            echo "  --fresh, -f       Despliegue limpio (elimina volúmenes, GARANTIZA login funcional)"
            echo "  --clean, -c       Detener y limpiar todos los contenedores y volúmenes"
            echo "  --status, -s      Mostrar estado actual del despliegue"
            echo "  --help, -h        Mostrar esta ayuda"
            echo ""
            echo "IMPORTANTE:"
            echo "  - Usa --fresh en la primera instalación o si tienes problemas de login"
            echo "  - El modo --fresh eliminará volúmenes existentes para garantizar datos limpios"
            exit 0
            ;;
    esac

    # Ejecutar despliegue
    check_prerequisites

    # Exportar variable para funciones
    export FRESH_INSTALL

    cleanup_previous
    deploy_infrastructure
    deploy_platform
    deploy_providers
    deploy_integration
    deploy_services
    deploy_frontend_observability

    # Resumen final
    validate_deployment
    print_urls
    print_commands

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         ¡Despliegue completado exitosamente!                      ║${NC}"
    echo -e "${GREEN}║         Tiempo total: ${minutes}m ${seconds}s                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}\n"
}

# Ejecutar
main "$@"
