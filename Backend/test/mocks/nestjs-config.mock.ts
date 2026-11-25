export class ConfigService {
  get<T = unknown>(_key: string, defaultValue?: T): T | undefined {
    return defaultValue;
  }

  getOrThrow<T = unknown>(_key: string): T {
    return '' as T;
  }
}