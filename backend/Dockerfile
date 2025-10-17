# backend/Dockerfile

# --- Etapa 1: Compilación (Builder Stage) ---
# Usamos una imagen oficial de Go con Alpine Linux. Alpine es ligera,
# lo que hace que incluso esta etapa de compilación sea más rápida y pequeña.
FROM golang:1.25-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos los archivos de gestión de dependencias de Go.
# Al copiarlos primero y descargar los módulos, aprovechamos el caché de Docker.
# Docker no volverá a ejecutar 'go mod download' si estos archivos no cambian.
COPY go.mod go.sum ./
RUN go mod download

# Copiamos el resto del código fuente de la aplicación al contenedor.
COPY . .

# Compilamos la aplicación.
# - CGO_ENABLED=0: Crea un binario estáticamente enlazado, sin dependencias de C.
#   Esto es crucial para que el ejecutable funcione en una imagen base mínima como Alpine o Scratch.
# - -o ./out/main: Especifica la ruta y el nombre del archivo de salida.
# - -ldflags="-w -s": Optimización para producción.
#   -w: Omite la información de depuración DWARF.
#   -s: Omite la tabla de símbolos.
#   Estos flags reducen significativamente el tamaño del binario final.
RUN CGO_ENABLED=0 GOOS=linux go build -o ./out/main -ldflags="-w -s" .


# --- Etapa 2: Final (Runtime Stage) ---
# Empezamos desde una imagen base de Alpine Linux, que es extremadamente ligera (~5MB).
# Es una base segura y mínima para ejecutar nuestra aplicación.
FROM alpine:latest

# Establecemos el directorio de trabajo.
WORKDIR /app

# Copiamos ÚNICAMENTE el binario compilado de la etapa 'builder'.
# No incluimos el SDK de Go, ni el código fuente, ni ninguna dependencia de compilación.
COPY --from=builder /app/out/main .

# Exponemos el puerto 8080, que es donde nuestro servidor Gin escuchará las peticiones.
# Esto es más bien una documentación; el mapeo real se hace en docker-compose.yml.
EXPOSE 8080

# El comando que se ejecutará cuando el contenedor se inicie.
# Simplemente ejecuta nuestro binario compilado.
CMD ["./main"]