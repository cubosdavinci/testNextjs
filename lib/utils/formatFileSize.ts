export function formatFileSize(bytes?: string | number): string {
    if (bytes === undefined || bytes === null) return 'N/A';

    const size = typeof bytes === 'string' ? Number(bytes) : bytes;

    if (!size || isNaN(size)) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));

    const value = size / Math.pow(1024, i);

    return `${parseFloat(value.toFixed(i === 0 ? 0 : 2))} ${units[i]}`;
}