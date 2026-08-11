export declare class Logger {
    private logger;
    constructor(module: string);
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    verbose(message: string, meta?: any): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map