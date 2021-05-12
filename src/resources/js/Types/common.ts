export type Nullable<T> = T | null | undefined;

export interface Collection<T> {
    data: T[];
    links: {
        first: Nullable<string>;
        last: Nullable<string>;
        next: Nullable<string>;
        prev: Nullable<string>;
    };
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        per_page: number;
        total: number;
        path: string;
        links: {
            url: Nullable<string>;
            label: string;
            active: boolean;
        }[];
    };
}
