import { Nullable } from "./common";

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

export interface FlashMessages {
    success?: Nullable<string>;
    error?: Nullable<string>;
    status?: Nullable<string>;
}

export interface GuiLink {
    key: string;
    title: string;
    route: string;
    icon?: string;
    resourceName?: string;
    resourcePermission?: string;
}

export interface CommonPageProps {
    auth: AuthContent;
    capabilities: Record<string, Record<string, boolean>>;
    flash: FlashMessages;
    gui: {
        resources: GuiLink[];
        tools: GuiLink[];
    };
}
