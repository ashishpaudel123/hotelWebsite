import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  TokenPayloadDto,
} from "../dtos/auth.dto";
import { Logger } from "../../../utils/logger";
import { AppError } from "../../../utils/errors";

const logger = new Logger("AuthService");

export class AuthService {
  private authRepository: AuthRepository;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;

  constructor() {
    this.authRepository = new AuthRepository();

    // Validate required environment variables
    const jwtSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    if (!refreshTokenSecret) {
      throw new Error("REFRESH_TOKEN_SECRET environment variable is required");
    }

    // Validate minimum key lengths for security
    if (jwtSecret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }
    if (refreshTokenSecret.length < 32) {
      throw new Error(
        "REFRESH_TOKEN_SECRET must be at least 32 characters long",
      );
    }

    this.JWT_SECRET = jwtSecret;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
    this.REFRESH_TOKEN_SECRET = refreshTokenSecret;
    this.REFRESH_TOKEN_EXPIRES_IN =
      process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    // Find user
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      logger.warn("Login attempt with non-existent email", { email });
      throw new AppError("Invalid credentials", 401, "AUTH_001");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      logger.warn("Login attempt on locked account", {
        email,
        lockUntil: user.lockUntil,
      });
      throw new AppError(
        "Account temporarily locked. Try again later.",
        403,
        "AUTH_003",
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.authRepository.incrementLoginAttempts(user._id.toString());
      logger.warn("Invalid password attempt", { email });
      throw new AppError("Invalid credentials", 401, "AUTH_001");
    }

    // Get user permissions
    const permissions = await this.authRepository.getUserPermissions(
      user._id.toString(),
    );

    // Generate tokens - role is populated from repository
    const userRole = user.role as any;
    const accessToken = this.generateAccessToken(
      user._id.toString(),
      user.email,
      userRole?.slug || "customer",
      permissions,
    );
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Update user
    await this.authRepository.resetLoginAttempts(user._id.toString());
    await this.authRepository.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    logger.info("User logged in successfully", { userId: user._id, email });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60, // Convert minutes to seconds
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.role as any)?.slug || "customer",
        permissions,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const { firstName, lastName, email, password, phone } = dto;

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      logger.warn("Registration attempt with existing email", { email });
      throw new AppError("Email already registered", 409, "AUTH_002");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get default role
    const defaultRole = await this.authRepository.findDefaultUserRole();
    if (!defaultRole) {
      logger.error("Default customer role not found");
      throw new AppError("System configuration error", 500, "SYS_001");
    }

    // Create user
    const user = await this.authRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: defaultRole._id,
      status: "active",
    });

    // Get permissions
    const permissions = await this.authRepository.getUserPermissions(
      user._id.toString(),
    );

    // Generate tokens
    const accessToken = this.generateAccessToken(
      user._id.toString(),
      user.email,
      defaultRole.slug,
      permissions,
    );
    const refreshToken = this.generateRefreshToken(user._id.toString());

    await this.authRepository.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    logger.info("User registered successfully", { userId: user._id, email });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: defaultRole.slug,
        permissions,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    let payload: TokenPayloadDto;

    try {
      payload = jwt.verify(
        refreshToken,
        this.REFRESH_TOKEN_SECRET,
      ) as TokenPayloadDto;
    } catch (error) {
      logger.warn("Invalid refresh token", { error });
      throw new AppError("Invalid refresh token", 401, "AUTH_004");
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      logger.warn("User not found for refresh token", { userId: payload.sub });
      throw new AppError("User not found", 404, "AUTH_005");
    }

    if (user.refreshToken !== refreshToken) {
      logger.warn("Refresh token mismatch", { userId: user._id });
      throw new AppError("Invalid refresh token", 401, "AUTH_004");
    }

    // Get updated permissions
    const permissions = await this.authRepository.getUserPermissions(
      user._id.toString(),
    );

    // Generate new access token - role is populated from repository
    const userRole = user.role as any;
    const accessToken = this.generateAccessToken(
      user._id.toString(),
      user.email,
      userRole?.slug || "customer",
      permissions,
    );

    logger.debug("Access token refreshed", { userId: user._id });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.role as any)?.slug || "customer",
        permissions,
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByEmail(email);

    // Always return success message to prevent email enumeration
    if (!user) {
      logger.debug("Forgot password requested for non-existent email", {
        email,
      });
      return { message: "If the email exists, a reset link has been sent" };
    }

    const resetToken = await this.authRepository.createPasswordResetToken(
      user._id.toString(),
    );

    // Send email with reset token using Notification Service
    // Note: Email service should be implemented before production
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    logger.info(
      "Password reset token created (email notification pending implementation)",
      {
        userId: user._id,
        email,
        resetUrl,
      },
    );

    return { message: "If the email exists, a reset link has been sent" };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findUserByResetToken(token);

    if (!user) {
      logger.warn("Invalid or expired reset token", { token });
      throw new AppError("Invalid or expired reset token", 400, "AUTH_006");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await this.authRepository.updatePassword(
      user._id.toString(),
      hashedPassword,
    );
    await this.authRepository.clearPasswordResetToken(user._id.toString());

    logger.info("Password reset successfully", { userId: user._id });

    return { message: "Password reset successfully" };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.authRepository.updateRefreshToken(userId, null);
    logger.info("User logged out", { userId });
    return { message: "Logged out successfully" };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
    permissions: string[],
  ): string {
    const payload: TokenPayloadDto = {
      sub: userId,
      email,
      role,
      permissions,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayloadDto {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayloadDto;
    } catch (error) {
      logger.error("Token verification failed", { error });
      throw new AppError("Invalid token", 401, "AUTH_007");
    }
  }
}
