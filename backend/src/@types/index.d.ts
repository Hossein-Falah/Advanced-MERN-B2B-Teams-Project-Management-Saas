import { UserDocument } from "../modules/user/interfaces/user.interface";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
    }
  }
}
