# Módulo de Agendamentos (Appointments)

Este módulo é o centro da operação da clínica, responsável por gerenciar a agenda de atendimentos, integrando pacientes, profissionais e clínicas.

## Endpoints

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/appointments` | `appointments:create` | Cria um novo agendamento. |
| `GET` | `/appointments` | `appointments:read` | Lista todos os agendamentos. |
| `GET` | `/appointments/:id` | `appointments:read` | Obtém detalhes de um agendamento específico. |
| `PATCH` | `/appointments/:id` | `appointments:update` | Atualiza dados e status de um agendamento. |
| `DELETE` | `/appointments/:id` | `appointments:delete` | Remove um agendamento (Soft Delete). |

## Regras de Negócio e Validações

### 1. Validação de Conflito de Horário
- **Profissional**: O sistema verifica se o profissional já possui outro agendamento que se sobreponha ao período solicitado (`startTime` e `endTime`).
- **Paciente**: O sistema verifica se o paciente já possui outro agendamento que se sobreponha ao período solicitado.
- **Validação de Data/Hora**: O `endTime` deve ser obrigatoriamente posterior ao `startTime`.

### 2. Vínculo e Integridade
- **Vínculo Profissional-Clínica**: Um agendamento só pode ser criado em uma `clinicId` onde o `professionalId` esteja vinculado.
- **Status**: O agendamento possui um ciclo de vida com os seguintes status: `Agendado`, `Confirmado`, `Realizado`, `Cancelado`, `Falta`.

### 3. Segurança e Auditoria
- **ACL**: Todos os endpoints são protegidos pelo `PermissionsGuard` e exigem permissões específicas (`appointments:create`, `appointments:read`, etc.).
- **Auditoria**: As operações de `POST`, `PATCH` e `DELETE` são auditadas via decorator `@AuditLog()`.
- **Soft Delete**: A remoção de agendamentos é feita exclusivamente via *soft delete* (`deletedAt`).
