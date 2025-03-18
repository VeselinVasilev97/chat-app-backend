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
      res.cookie("chat-auth-ref", result.tokens.refreshToken);
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

  login = async (req: Request, res: Response) => {
    try {
      const loginData: LoginDto = req.body;
      const result = await this.authService.login(loginData);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
  };

  validateUser = async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];

      if (!accessToken) {
        return res.status(401).json({ message: "Access token is required" });
      }
      const decoded = validateToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      );
      console.log(decoded);
      
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      return res.status(200).json({ message: "Token is valid", user: decoded });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
