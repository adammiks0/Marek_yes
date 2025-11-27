FROM golang:alpine

WORKDIR /app

# Skopiuj pliki go mod
COPY go.mod go.sum ./
RUN go mod download

# Skopiuj resztę kodu
COPY . .

# Build
RUN go build -o main .

# Utwórz katalog uploads z odpowiednimi uprawnieniami
RUN mkdir -p /app/uploads && chmod 777 /app/uploads
# Expose port
EXPOSE 8080

# Uruchom aplikację
CMD ["./main"]
