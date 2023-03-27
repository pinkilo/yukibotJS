import { Response } from "express";
declare const _default: {
    getCode: (res: Response<any, Record<string, any>>) => void;
    getTokensWithCode: (code: string) => Promise<void>;
    findChat: () => Promise<void>;
    trackChat: () => Promise<void>;
    checkTokens: () => Promise<void>;
};
export default _default;