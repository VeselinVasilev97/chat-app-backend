import bcrypt from "bcrypt";
import { query } from "@/config/database";
import { LoginDto, RegisterDto, AuthResponse } from "../types/auth.types";
import { TokenService } from "./token.service";

export class AuthService {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await query(
      "SELECT * FROM chatuser.users WHERE email = $1",
      [dto.email]
    );
    if (existingUser.rows.length) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const result = await query(
      "INSERT INTO chatuser.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email",
      [dto.username, dto.email, hashedPassword]
    );

    const user = result.rows[0];
    const tokens = this.tokenService.generateTokens({
      sub: user.user_id,
      email: user.email,
      username: user.username,
      role: "user",
    });

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const result = await query(
      "SELECT * FROM chatuser.users WHERE email = $1",
      [dto.email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new Error("Invalid credentials");
    }

    const tokens = this.tokenService.generateTokens({
      sub: user.user_id,
      email: user.email,
      username: user.username,
      role: "user",
    });

    return { user: this.sanitizeUser(user), tokens };
  }

  private sanitizeUser(user: any) {
    const {
      password_hash,
      last_active_at,
      created_at,
      updated_at,
      ...sanitizedUser
    } = user;
    return sanitizedUser;
  }
}

// Express API Handler for setting cookies
import { Request, Response } from "express";

export async function loginHandler(req: Request, res: Response) {
  try {
    const authService = new AuthService();
    const { user, tokens } = await authService.login(req.body);

    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Disabled in dev
      sameSite: "lax", // Prevents cross-site issues but allows subdomains
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Disabled in dev
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ user });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(401).json({ message: errorMessage });
  }
}
