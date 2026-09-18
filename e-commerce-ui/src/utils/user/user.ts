export interface LoginResponse {
    id: number;
    role: string;
    success: boolean;
    token: string;
    user: any;
    message: string;
    username: string;
}

export interface UserRegisterDto {
    username: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}