import { Environment } from "../constants/Environment";

export class AppLogger {
  static log(message: string) {
    // Check if the environment is development
    // if (Environment.NODE_ENV !== "development") return
    console.log(message)
  }

  static error(message: string) {
    // Check if the environment is development
    // if (Environment.NODE_ENV !== "development") return
    console.error(message)
  }
}