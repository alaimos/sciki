export function filterByKey<T>(
    raw: T,
    callback: (k: keyof T) => boolean
): Partial<T> {
    return Object.keys(raw)
        .filter((k) => callback(k as keyof T))
        .reduce((obj, key) => {
            return {
                ...obj,
                [key]: raw[key as keyof T],
            };
        }, {}) as unknown as Partial<T>;
}
