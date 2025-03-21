import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  findUserByUsername = async (req: Request, res: Response) => {
    try {
    const result = await this.usersService.getUserByEmail(req.body.email);
    if (result.length === 0) {
        res.status(201).json({
          success: false,
          user: null,
          error: {
            message: "User not found",
          },
        });
      } else {
        res.status(200).json({
          success: true,
          user: result[0],
          error: {
            message: "User found",
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        success: true,
        user: {},
        error: {
          message: "User found",
        },
      });
    }

  };
}
