export class FileBuildError extends Error {
    public readonly fileId: string;
    public readonly provider: string;

    constructor(params: {
        fileId: string;
        provider: string;
        message: string;
        cause?: unknown;
    }) {
        super(params.message);

        this.name = 'FileBuildError';
        this.fileId = params.fileId;
        this.provider = params.provider;

        // optional for debugging / logging
        if (params.cause) {
            (this as any).cause = params.cause;
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            fileId: this.fileId,
            provider: this.provider,
        };
    }
}