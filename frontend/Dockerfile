# --- Etapa 1: Compilación (Builder Stage) ---
# Usamos una imagen de Node.js que incluye pnpm.
FROM node:18-slim AS builder

# Activamos Corepack para que el comando 'pnpm' esté disponible.
# <-- ¡ESTA ES LA LÍNEA CLAVE DE LA SOLUCIÓN!
RUN corepack enable

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de manifiesto para aprovechar el caché de Docker
COPY package.json pnpm-lock.yaml ./

# Instalamos las dependencias
RUN pnpm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación para producción
RUN pnpm build


# --- Etapa 2: Producción (Runtime Stage) ---
# Usamos un servidor Nginx súper ligero para servir los archivos estáticos.
FROM nginx:1.25-alpine

# Copiamos el resultado de la compilación a la carpeta donde Nginx sirve los archivos.
COPY --from=builder /app/build /usr/share/nginx/html

# Exponemos el puerto 80 que Nginx usa por defecto.
EXPOSE 80