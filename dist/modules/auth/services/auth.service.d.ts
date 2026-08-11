import { LoginDto, RegisterDto, AuthResponseDto, TokenPayloadDto } from '../dtos/auth.dto';
export declare class AuthService {
    private authRepository;
    private readonly JWT_SECRET;
    private readonly JWT_EXPIRES_IN;
    private readonly REFRESH_TOKEN_SECRET;
    private readonly REFRESH_TOKEN_EXPIRES_IN;
    constructor();
    login(dto: LoginDto): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<AuthResponseDto>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    verifyToken(token: string): TokenPayloadDto;
}
//# sourceMappingURL=auth.service.d.ts.map