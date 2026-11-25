export declare class ConfigService {
    get<T = unknown>(_key: string, defaultValue?: T): T | undefined;
    getOrThrow<T = unknown>(_key: string): T;
}
