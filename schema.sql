-- Schema para PostgreSQL (Neon) - AutoCRM MVP

-- Tabela de Usuários (Gerentes e Vendedores)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(50) NOT NULL CHECK (papel IN ('gerente', 'vendedor')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes (Prospecção)
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    instagram VARCHAR(255),
    cidade VARCHAR(255),
    endereco TEXT,
    data_nascimento DATE,
    etapa_funil VARCHAR(50) DEFAULT 'Lead Novo', -- Lead Novo, Em Negociação, Ficha Aprovada, Vendido, Perdido
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Atendimentos (Histórico de Interações)
CREATE TABLE atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_interacao VARCHAR(50) NOT NULL, -- Ligação, WhatsApp, Visita, Email
    descricao TEXT,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas
CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    mes_ano DATE NOT NULL, -- Ex: 2023-10-01 (sempre o primeiro dia do mês)
    meta_prospeccoes_diarias INT DEFAULT 0,
    meta_vendas_mensal INT DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendedor_id, mes_ano)
);

-- Índices para performance
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);
CREATE INDEX idx_clientes_etapa ON clientes(etapa_funil);
CREATE INDEX idx_atendimentos_cliente ON atendimentos(cliente_id);
CREATE INDEX idx_atendimentos_vendedor ON atendimentos(vendedor_id);
CREATE INDEX idx_metas_vendedor_mes ON metas(vendedor_id, mes_ano);
