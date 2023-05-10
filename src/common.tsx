export interface DisplayMessageFunc {
    (message: string, variant: string, timeout: number): void;
}