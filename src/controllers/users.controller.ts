import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  sendFriendRequest = async (req: Request, res: Response) => {
    try {
      const { senderEmail, receiverEmail } = req.body;
      if (!senderEmail || !receiverEmail) {
        return res
          .status(400)
          .json({ message: "Both sender and receiver emails are required" });
      }
      const result = await this.usersService.sendFriendRequest(
        senderEmail,
        receiverEmail
      );
      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ message: "Error sending friend request", error: errorMessage });
    }
  };

  findUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const user = await this.usersService.findUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ message: "Error finding user", error: errorMessage });
    }
  };

  findMatchingUsers = async (req: Request, res: Response) => {
    try {
      const { searchTerm } = req.params;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const users = await this.usersService.findMatchingUsers(searchTerm);
      if (users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(201).json(users);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ message: "Error finding matching users", error: errorMessage });
    }
  };

  getAllFriends = async (req: Request, res: Response) => {
    try {
      const userData = req.cookies?.user;
  
      if (!userData || !userData.user_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const friendsList = await this.usersService.getAllFriends(userData.user_id);
      if (friendsList.length > 0) {
        return res.status(200).json(friendsList);
      } else {
        return res.status(200).json({ message: "No friends found", friends: [] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ message: "Error retrieving friends list", error: errorMessage });
    }
  };
}
