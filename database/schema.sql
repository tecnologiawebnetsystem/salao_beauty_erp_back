-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS klebe351_salaobeleza;
USE klebe351_salaobeleza;

-- -----------------------------------------------------
-- Tabela `usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `tipo` ENUM('admin', 'gerente', 'funcionario') NOT NULL DEFAULT 'funcionario',
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `clientes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `cpf` VARCHAR(14) NULL,
  `endereco` TEXT NULL,
  `data_nascimento` DATE NULL,
  `observacoes` TEXT NULL,
  `ultima_visita` DATETIME NULL,
  `total_gasto` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `qtd_agendamentos` INT NOT NULL DEFAULT 0,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cliente_email` (`email` ASC),
  INDEX `idx_cliente_telefone` (`telefone` ASC),
  INDEX `idx_cliente_cpf` (`cpf` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `categorias_servicos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias_servicos` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `servicos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `servicos` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT NOT NULL,
  `preco` DECIMAL(10,2) NOT NULL,
  `duracao_minutos` INT NOT NULL,
  `categoria_id` VARCHAR(36) NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_servicos_categorias_idx` (`categoria_id` ASC),
  CONSTRAINT `fk_servicos_categorias`
    FOREIGN KEY (`categoria_id`)
    REFERENCES `categorias_servicos` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `funcionarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `funcionarios` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `cpf` VARCHAR(14) NULL,
  `endereco` TEXT NULL,
  `data_nascimento` DATE NULL,
  `cargo` VARCHAR(50) NOT NULL DEFAULT 'Cabeleireiro',
  `taxa_comissao` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `observacoes` TEXT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `imagem_perfil` VARCHAR(255) NULL,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  INDEX `idx_funcionario_telefone` (`telefone` ASC),
  INDEX `idx_funcionario_cpf` (`cpf` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `funcionarios_especialidades`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `funcionarios_especialidades` (
  `id` VARCHAR(36) NOT NULL,
  `funcionario_id` VARCHAR(36) NOT NULL,
  `especialidade` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_especialidades_funcionarios_idx` (`funcionario_id` ASC),
  CONSTRAINT `fk_especialidades_funcionarios`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `funcionarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `funcionarios_servicos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `funcionarios_servicos` (
  `funcionario_id` VARCHAR(36) NOT NULL,
  `servico_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`funcionario_id`, `servico_id`),
  INDEX `fk_funcionarios_servicos_servicos_idx` (`servico_id` ASC),
  INDEX `fk_funcionarios_servicos_funcionarios_idx` (`funcionario_id` ASC),
  CONSTRAINT `fk_funcionarios_servicos_funcionarios`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `funcionarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_funcionarios_servicos_servicos`
    FOREIGN KEY (`servico_id`)
    REFERENCES `servicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `horarios_trabalho`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `horarios_trabalho` (
  `id` VARCHAR(36) NOT NULL,
  `funcionario_id` VARCHAR(36) NOT NULL,
  `dia_semana` ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fim` TIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_horarios_funcionarios_idx` (`funcionario_id` ASC),
  CONSTRAINT `fk_horarios_funcionarios`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `funcionarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `pacotes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pacotes` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT NOT NULL,
  `preco_pacote` DECIMAL(10,2) NOT NULL,
  `preco_regular` DECIMAL(10,2) NOT NULL,
  `validade_dias` INT NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `itens_pacote`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itens_pacote` (
  `id` VARCHAR(36) NOT NULL,
  `pacote_id` VARCHAR(36) NOT NULL,
  `servico_id` VARCHAR(36) NOT NULL,
  `quantidade` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `fk_itens_pacote_pacotes_idx` (`pacote_id` ASC),
  INDEX `fk_itens_pacote_servicos_idx` (`servico_id` ASC),
  CONSTRAINT `fk_itens_pacote_pacotes`
    FOREIGN KEY (`pacote_id`)
    REFERENCES `pacotes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_itens_pacote_servicos`
    FOREIGN KEY (`servico_id`)
    REFERENCES `servicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `assinaturas_pacote`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assinaturas_pacote` (
  `id` VARCHAR(36) NOT NULL,
  `cliente_id` VARCHAR(36) NOT NULL,
  `pacote_id` VARCHAR(36) NOT NULL,
  `nome_pacote` VARCHAR(100) NOT NULL,
  `data_inicio` DATETIME NOT NULL,
  `data_fim` DATETIME NOT NULL,
  `preco` DECIMAL(10,2) NOT NULL,
  `status` ENUM('ativo', 'expirado', 'cancelado') NOT NULL DEFAULT 'ativo',
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_assinaturas_clientes_idx` (`cliente_id` ASC),
  INDEX `fk_assinaturas_pacotes_idx` (`pacote_id` ASC),
  CONSTRAINT `fk_assinaturas_clientes`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `clientes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_assinaturas_pacotes`
    FOREIGN KEY (`pacote_id`)
    REFERENCES `pacotes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `agendamentos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `agendamentos` (
  `id` VARCHAR(36) NOT NULL,
  `cliente_id` VARCHAR(36) NOT NULL,
  `servico_id` VARCHAR(36) NOT NULL,
  `funcionario_id` VARCHAR(36) NOT NULL,
  `data_hora` DATETIME NOT NULL,
  `status` ENUM('agendado', 'confirmado', 'concluido', 'cancelado', 'faltou') NOT NULL DEFAULT 'agendado',
  `assinatura_pacote_id` VARCHAR(36) NULL,
  `observacoes` TEXT NULL,
  `pago` TINYINT(1) NOT NULL DEFAULT 0,
  `valor_pago` DECIMAL(10,2) NULL,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_agendamentos_clientes_idx` (`cliente_id` ASC),
  INDEX `fk_agendamentos_servicos_idx` (`servico_id` ASC),
  INDEX `fk_agendamentos_funcionarios_idx` (`funcionario_id` ASC),
  INDEX `fk_agendamentos_assinaturas_idx` (`assinatura_pacote_id` ASC),
  INDEX `idx_agendamentos_data` (`data_hora` ASC),
  INDEX `idx_agendamentos_status` (`status` ASC),
  CONSTRAINT `fk_agendamentos_clientes`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `clientes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_agendamentos_servicos`
    FOREIGN KEY (`servico_id`)
    REFERENCES `servicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_agendamentos_funcionarios`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `funcionarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_agendamentos_assinaturas`
    FOREIGN KEY (`assinatura_pacote_id`)
    REFERENCES `assinaturas_pacote` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `usos_pacote`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usos_pacote` (
  `id` VARCHAR(36) NOT NULL,
  `assinatura_pacote_id` VARCHAR(36) NOT NULL,
  `servico_id` VARCHAR(36) NOT NULL,
  `servico_nome` VARCHAR(100) NOT NULL,
  `data_uso` DATETIME NOT NULL,
  `agendamento_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_usos_assinaturas_idx` (`assinatura_pacote_id` ASC),
  INDEX `fk_usos_servicos_idx` (`servico_id` ASC),
  INDEX `fk_usos_agendamentos_idx` (`agendamento_id` ASC),
  CONSTRAINT `fk_usos_assinaturas`
    FOREIGN KEY (`assinatura_pacote_id`)
    REFERENCES `assinaturas_pacote` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_usos_servicos`
    FOREIGN KEY (`servico_id`)
    REFERENCES `servicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_usos_agendamentos`
    FOREIGN KEY (`agendamento_id`)
    REFERENCES `agendamentos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `transacoes_financeiras`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transacoes_financeiras` (
  `id` VARCHAR(36) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `data` DATETIME NOT NULL,
  `tipo` ENUM('receita', 'despesa') NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `agendamento_id` VARCHAR(36) NULL,
  `assinatura_pacote_id` VARCHAR(36) NULL,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_transacoes_agendamentos_idx` (`agendamento_id` ASC),
  INDEX `fk_transacoes_assinaturas_idx` (`assinatura_pacote_id` ASC),
  INDEX `idx_transacoes_data` (`data` ASC),
  INDEX `idx_transacoes_tipo` (`tipo` ASC),
  INDEX `idx_transacoes_categoria` (`categoria` ASC),
  CONSTRAINT `fk_transacoes_agendamentos`
    FOREIGN KEY (`agendamento_id`)
    REFERENCES `agendamentos` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_transacoes_assinaturas`
    FOREIGN KEY (`assinatura_pacote_id`)
    REFERENCES `assinaturas_pacote` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela `configuracoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracoes` (
  `chave` VARCHAR(50) NOT NULL,
  `valor` TEXT NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
