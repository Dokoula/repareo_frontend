import {User} from './user.model';
export interface LoginResponse {
  access :string;
  refresh :string;
  user: User;
}