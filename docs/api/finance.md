# Módulo Financeiro e de Faturamento (Finance)

Este módulo gerencia as transações financeiras da clínica, incluindo a gestão de convênios e o faturamento automático de sessões.

## Endpoints

### Convênios (`/finance/insurances`)

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/insurances` | `insurances:create` | Cadastra um novo convênio. |
| `GET` | `/insurances` | `insurances:read` | Lista todos os convênios ativos. |
| `PATCH` | `/insurances/:id` | `insurances:update` | Atualiza dados de um convênio. |
| `DELETE` | `/insurances/:id` | `insurances:delete` | Remove um convênio (Soft Delete). |

### Transações (`/finance/transactions`)

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/transactions` | `transactions:create` | Registra uma nova transação (Receita/Despesa). |
| `GET` | `/transactions` | `transactions:read` | Lista todas as transações financeiras. |
| `PATCH` | `/transactions/:id` | `transactions:update` | Atualiza dados de uma transação. |
| `DELETE` | `/transactions/:id` | `transactions:delete` | Remove uma transação (Soft Delete). |

### Faturamento (`/finance/invoice`)

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/invoice/:appointmentId` | `transactions:create` | Gera uma transação de faturamento (Receita) para um agendamento realizado. |

## Regras de Negócio e Integração

### 1. Faturamento Automático
- O endpoint `/invoice/:appointmentId` verifica se o agendamento está com o status **"Realizado"**.
- Se estiver, ele gera uma transação de `RECEITA` com o valor:
    - **Convênio**: Busca o valor da sessão no convênio vinculado ao paciente.
    - **Particular**: Utiliza um valor padrão (atualmente R$ 150,00 - valor de exemplo).
- Garante que um agendamento só seja faturado uma única vez.

### 2. Integridade de Dados
- **Unicidade**: O nome do convênio deve ser único.
- **Imutabilidade**: Não é permitido alterar o agendamento vinculado a uma transação após a criação.
- **Soft Delete**: Todas as entidades financeiras utilizam *soft delete*.
