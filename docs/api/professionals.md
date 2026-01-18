# Módulo de Profissionais (Professionals)

Este módulo é responsável pela gestão dos profissionais de saúde (fonoaudiólogos, terapeutas, etc.) que atuam nas clínicas. Ele estabelece a relação entre um usuário do sistema e seus dados profissionais, incluindo o registro no conselho e o vínculo com múltiplas clínicas.

## Endpoints

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/professionals` | `professionals:create` | Cria um novo registro profissional e o associa a um usuário existente. |
| `GET` | `/professionals` | `professionals:read` | Lista todos os profissionais cadastrados. |
| `GET` | `/professionals/:id` | `professionals:read` | Obtém detalhes de um profissional específico. |
| `PATCH` | `/professionals/:id` | `professionals:update` | Atualiza dados do profissional, incluindo o vínculo com clínicas. |
| `DELETE` | `/professionals/:id` | `professionals:delete` | Remove um profissional (Soft Delete). |

## Regras de Negócio e Validações

### 1. Vínculo com Usuário
- Um registro de profissional (`Professional`) deve estar obrigatoriamente vinculado a um usuário (`User`) existente no sistema.
- A relação é 1:1, ou seja, um usuário só pode ser um profissional.

### 2. Validação de Registro Profissional
- O campo `registrationNumber` (número de registro) e `council` (conselho, ex: CREFONO, CRM) são obrigatórios.
- O sistema suporta os seguintes conselhos: `CREFONO`, `CRM`, `CRP`, `COREN`, `OUTRO`.

### 3. Suporte Multi-Clínica
- Um profissional pode ser vinculado a **múltiplas clínicas** através da relação N:M (`professional_clinics`).
- O profissional deve estar vinculado a **pelo menos uma clínica** no momento da criação.

### 4. Segurança e Auditoria
- **ACL**: Todos os endpoints são protegidos pelo `PermissionsGuard` e exigem permissões específicas (`professionals:create`, `professionals:read`, etc.).
- **Auditoria**: As operações de `POST`, `PATCH` e `DELETE` são auditadas via decorator `@AuditLog()`.
- **Soft Delete**: A remoção de profissionais é feita exclusivamente via *soft delete* (`deletedAt`).
