import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginDto, RegisterDto } from "../types/auth.types";
import { validateToken } from "@/middleware/auth.middleware";

export class UserController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const userData: RegisterDto = req.body;
      const result = await this.authService.register(userData);
      res.cookie("chat-auth-acs", result.tokens.accessToken);
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
  };
  async login(req: Request, res: Response) {
    try {
      const authService = new AuthService();
      const { user, tokens } = await authService.login(req.body);

      res.cookie("access_token", tokens.accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production" ? true : false,
        secure: false,
        sameSite: "lax", // Prevents cross-site issues but allows subdomains
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
      res.cookie("user", user);

      return res.status(200).json({ user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(401).json({ message: errorMessage });
    }
  }
  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("access_token");
      res.clearCookie("user");
  
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during logout",
      });
    }
  }
  validateUser = async (req: Request, res: Response) => {
    try {
      const accessToken = req.cookies?.access_token;
      const userCookie = req.cookies?.user;
      
      if (!accessToken) {
        return res.status(401).json({ message: "Access token is required" });
      }
      
      const decoded = validateToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      );
  
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      return res.status(200).json({ message: "Token is valid", user: userCookie });
    } catch (error) {
      console.error("Token validation error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
