# Módulo de Prontuário Eletrônico (Clinical Evolutions)

Este módulo é o repositório central do histórico clínico do paciente, registrando a evolução de cada atendimento.

## Endpoints

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/clinical-evolutions` | `evolutions:create` | Registra uma nova evolução clínica. |
| `GET` | `/clinical-evolutions` | `evolutions:read` | Lista todas as evoluções (opcionalmente filtrado por `patientId`). |
| `GET` | `/clinical-evolutions/:id` | `evolutions:read` | Obtém detalhes de uma evolução específica. |
| `PATCH` | `/clinical-evolutions/:id` | `evolutions:update` | Atualiza uma evolução (somente se não estiver finalizada). |
| `DELETE` | `/clinical-evolutions/:id` | `evolutions:delete` | Remove uma evolução (Soft Delete). |

## Regras de Negócio e Segurança

### 1. Integridade e Vínculos
- **Vínculo Obrigatório**: Toda evolução deve estar vinculada a um `patientId` e a um `professionalId`.
- **Vínculo com Agendamento**: Opcionalmente, pode ser vinculada a um `appointmentId`, garantindo que um agendamento só tenha uma evolução registrada.
- **Tipos de Evolução**: Suporta diferentes tipos de registro: `Primeira Avaliação`, `Evolução Clínica`, `Reavaliação`, `Alta`.

### 2. Imutabilidade e Segurança de Dados
- **Finalização**: O campo `isFinalized` impede alterações no conteúdo da evolução após o registro ser considerado completo pelo profissional.
- **Proibição de Alteração de Vínculos**: Após a criação, os IDs de paciente, profissional e agendamento não podem ser alterados.
- **ACL**: Acesso rigoroso via `PermissionsGuard` para proteger dados sensíveis.

### 3. Auditoria
- **Soft Delete**: A remoção é feita via *soft delete* (`deletedAt`).
- **Logs**: Operações de `POST`, `PATCH` e `DELETE` são auditadas.
