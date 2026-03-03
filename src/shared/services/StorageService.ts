import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"

export class StorageService {
  static getPathFromUrl(url: string, bucket: string): string | null {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.slice(idx + marker.length)
  }

  static async uploadFile(
    file: File,
    bucket: string,
    path: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, string>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false })

      if (error) {
        return { left: { message: error.message, code: "STORAGE_UPLOAD_ERROR" } }
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { right: data.publicUrl }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async deleteFile(
    bucket: string,
    path: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) {
        return { left: { message: error.message, code: "STORAGE_DELETE_ERROR" } }
      }
      return { right: true }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}
