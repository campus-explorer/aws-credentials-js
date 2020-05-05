export function getProfileCredentials(
    profile: string,
    options?: {
        cacheDir: string;
        duration: number;
        getMfaToken: (mfaSerial: string) => Promise<{ token: string }>;
    },
): Promise<AWS.Credentials>;

export function getProfileConfig(profile: string): Record<string, string>;

export function useProfile(
    profile: string,
    AWS: object,
    options?: {
        cacheDir: string;
        duration: number;
        getMfaToken: (mfaSerial: string) => Promise<{ token: string }>;
    },
): Promise<void>;
