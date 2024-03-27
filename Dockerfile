# Use uma imagem Node.js
FROM node:latest

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o arquivo de definição de dependências e instale as dependências
COPY package*.json ./
RUN npm install

# Copie todos os arquivos do projeto para o contêiner
COPY . .

# Exponha a porta em que o servidor Nest.js está escutando
EXPOSE 3000

# Comando para iniciar o servidor Nest.js
CMD ["npm", "run", "start:prod"]
