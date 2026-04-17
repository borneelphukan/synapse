export class RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class ForgotPasswordDto {
  email: string;
}

export class ResetPasswordDto {
  token: string;
  password: string;
}
