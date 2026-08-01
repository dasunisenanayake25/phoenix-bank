FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN apk update && apk upgrade --no-cache && apk add --no-cache python3 make g++
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk update && apk upgrade --no-cache && apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]