import { Request, Response } from "express";

class CreateMessageController {
  async handle(request: Request, response: Response) {
    const { message } = request.body;
  }
}

export { CreateMessageController };
