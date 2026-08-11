#!/usr/bin/env node
declare const BASE = "http://localhost:5001/api/v1";
declare let authToken: string;
declare let adminToken: string;
declare let passed: number;
declare let failed: number;
declare function runTest(name: any, fn: any): Promise<void>;
declare function assert(condition: any, message: any): void;
declare function run(): Promise<void>;
//# sourceMappingURL=test-api.d.ts.map