import { SystemRole } from "@/src/shared/types/systemRoles"

export interface RegisterDTO {
  name: string
  role: Exclude<SystemRole, "admin">
  email: string
  password: string
  confirmPassword: string
}