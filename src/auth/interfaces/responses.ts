import { SystemRole } from "@/src/shared/types/systemRoles";
import { Session, User } from "@supabase/supabase-js";

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    session: Session | null;
    user: User | null;
  }
}

export interface LoginResponse {
  session: {
    session: Session | null;
    user: User | null;
    role: SystemRole
  }
}