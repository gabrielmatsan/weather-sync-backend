# Weather Sync

## Visão Geral
Weather Sync é uma aplicação climática ambiciosa, projetada para fornecer dados meteorológicos precisos em tempo real. Utilizando a plataforma Elysia, este aplicativo oferece uma experiência rápida e responsiva para monitoramento de condições climáticas.

## Funcionalidades

- Monitoramento climático em tempo real
- Integração com  WhatsApp
- Envio de notificações

## Tecnologias

- [Elysia](https://elysiajs.com/) - Framework web de alto desempenho
- [Bun](https://bun.sh/) - Runtime JavaScript e gerenciador de pacotes
- API de previsão do tempo (integração) => Twilio


## Instalação de Dependências

```bash
bun install
```


## Desenvolvimento

Para iniciar o servidor de desenvolvimento, execute:

```bash
bun run dev
```

Abra http://localhost:8080/ no seu navegador para ver o resultado.

## Estrutura do Projeto

```
weather-sync/
├── public/           # Arquivos estáticos
├── src/                                # Código fonte
│   ├── api/                            # Endpoints da API
│       ├── context/                     # Componentes reutilizáveis
    │       ├── application/            # Componentes
            ├── domain/                 # Páginas da aplicação
    │       └── infrastructure/         # Funções utilitárias
├── package.json      # Dependências e scripts
└── README.md         # Este arquivo
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
API_KEY=sua_chave_api_aqui
PORT=3000
```

## Contribuição

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Email do Projeto: weather-sync@example.com

Link do Projeto: [https://github.com/seu-usuario/weather-sync](https://github.com/seu-usuario/weather-sync)
