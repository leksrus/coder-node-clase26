# Desafio Fork / Cluster

## Coder

## Manual de uso

- Nodemon

  > Para ejecutar el proyecto con nodemon en modo escucha
  > `npm run start:nodemon`
- Forever
  > Para ejecutar el proyecto con Forever modo fork
  > `forever start -w  index.js -c '-p 8000'  `
  > Para ejecutar el proyecto con Forever modo Cluster
  > `forever start -w -m 5 index.js -c '-p 8000'  `
- PM2
  > Para ejecutar el proyecto con PM2 modo fork
  > `pm2 start index.js --name="Server1" --watch'  `
  > Para ejecutar el proyecto con PM2 modo Cluster
  > `pm2 start index.js -i max'  `