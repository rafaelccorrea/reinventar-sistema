# Módulo de Pacientes (Patients) - Refinado

Este módulo é responsável pela gestão de pacientes da clínica de fonoaudiologia, com foco em **segurança de dados e regras de negócio rigorosas**. Permite o cadastro completo, gestão de responsáveis (para menores de idade) e vínculo com unidades (clínicas).

## Endpoints

| Método | URL | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/patients` | `patients:create` | Cria um novo paciente no sistema. |
| `GET` | `/patients` | `patients:read` | Lista todos os pacientes (opcionalmente filtrado por `clinicId`). |
| `GET` | `/patients/:id` | `patients:read` | Obtém detalhes de um paciente específico. |
| `PATCH` | `/patients/:id` | `patients:update` | Atualiza dados de um paciente. |
| `DELETE` | `/patients/:id` | `patients:delete` | Remove um paciente (Soft Delete). |

## Regras de Negócio e Validações

O módulo foi refinado para garantir a máxima integridade e conformidade dos dados:

### 1. Validação de Dados de Entrada (DTOs)
- **CPF**: Validação de formato (`000.000.000-00`) e validação de **autenticidade** (dígito verificador) usando biblioteca externa.
- **Data de Nascimento**: Deve ser uma data válida no formato `YYYY-MM-DD` e **não pode ser uma data futura**.
- **Sanitização**: Um `Pipe` global (`SanitizeStringPipe`) foi aplicado ao `PatientsController` para:
    - Remover espaços em branco no início e fim de todas as *strings*.
    - Substituir múltiplos espaços por um único espaço.

### 2. Regras de Responsabilidade (LGPD e Estatuto da Criança e do Adolescente)
- **Menores de Idade**: Se a data de nascimento indicar que o paciente tem menos de 18 anos, o campo `responsibleId` é **obrigatório**.
- **Idade do Responsável**: O paciente referenciado como `responsibleId` deve ter 18 anos ou mais. O sistema impede o cadastro de um menor de idade cujo responsável também seja menor.

### 3. Segurança e Auditoria
- **ACL**: Todos os endpoints são protegidos pelo `PermissionsGuard` e exigem permissões específicas (`patients:create`, `patients:read`, etc.).
- **Auditoria**: As operações de `POST`, `PATCH` e `DELETE` são auditadas via decorator `@AuditLog()`, registrando a ação, o usuário e o alvo.
- **Soft Delete**: A remoção de pacientes é feita exclusivamente via *soft delete* (`deletedAt`), preservando o histórico para fins de LGPD.
