// interfaces/SignIn.ts
export interface SignInInterface {
    email: string;
    password: string;
}

// interfaces/User.ts
export interface User {
    ID?: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

// interfaces/AuthResponse.ts
export interface AuthResponse {
    status: number;
    data: {
        token: string;
        token_type: string;
        role: string;
        id: string;
        message?: string;
        error?: string;
        user?: User;
    };
}