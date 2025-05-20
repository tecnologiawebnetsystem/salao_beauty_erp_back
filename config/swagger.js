import swaggerJSDoc from "swagger-jsdoc"

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Salão de Beleza",
    version: "1.0.0",
    description: "API RESTful para aplicativo de Salão de Beleza",
    contact: {
      name: "Suporte",
      email: "suporte@salaodebeleza.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Servidor de Desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Autenticação",
      description: "Endpoints para autenticação de usuários",
    },
    {
      name: "Usuários",
      description: "Endpoints para gerenciamento de usuários",
    },
    {
      name: "Clientes",
      description: "Endpoints para gerenciamento de clientes",
    },
    {
      name: "Categorias de Serviços",
      description: "Endpoints para gerenciamento de categorias de serviços",
    },
    {
      name: "Serviços",
      description: "Endpoints para gerenciamento de serviços",
    },
    {
      name: "Funcionários",
      description: "Endpoints para gerenciamento de funcionários",
    },
    {
      name: "Pacotes",
      description: "Endpoints para gerenciamento de pacotes",
    },
    {
      name: "Assinaturas",
      description: "Endpoints para gerenciamento de assinaturas de pacotes",
    },
    {
      name: "Agendamentos",
      description: "Endpoints para gerenciamento de agendamentos",
    },
    {
      name: "Transações Financeiras",
      description: "Endpoints para gerenciamento de transações financeiras",
    },
    {
      name: "Configurações",
      description: "Endpoints para gerenciamento de configurações do sistema",
    },
  ],
}

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js", "./controllers/*.js", "./models/*.js"],
}

export const swaggerSpec = swaggerJSDoc(options)
