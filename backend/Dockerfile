FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN apk update && apk upgrade --no-cache && apk add --no-cache python3 make g++
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk update && apk upgrade --no-cache && apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4001
CMD ["node", "dist/main"]
