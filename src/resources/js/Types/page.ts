export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role_id: number;
    avatar: {
        small: string;
        medium: string;
        large: string;
    };
}

export interface AuthContent {
    check: boolean;
    user: AuthUser | null | undefined;
}

export interface CommonPageProps {
    auth: AuthContent;
}
