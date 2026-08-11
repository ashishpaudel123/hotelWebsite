import { IUser } from '../../../models/User';
import { IRole } from '../../../models/Role';
export declare class AuthRepository {
    private userModel;
    private roleModel;
    constructor();
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    create(userData: Partial<IUser>): Promise<IUser>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    incrementLoginAttempts(userId: string): Promise<number>;
    resetLoginAttempts(userId: string): Promise<void>;
    findDefaultUserRole(): Promise<IRole | null>;
    getUserPermissions(userId: string): Promise<string[]>;
    createPasswordResetToken(userId: string): Promise<string>;
    findUserByResetToken(token: string): Promise<IUser | null>;
    clearPasswordResetToken(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.repository.d.ts.map