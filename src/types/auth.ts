// Authentication DTOs

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    userType: string;
    message: string;
    success: boolean;
    organizationId?: number;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordResetRequest {
    email: string;
    newPassword: string;
    token: string;
}

export interface PasswordVerificationRequest {
    email: string;
    password: string;
}
