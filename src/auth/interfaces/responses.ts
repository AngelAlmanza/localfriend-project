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