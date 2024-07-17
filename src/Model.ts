export enum EreadState {
    INIT,
    HEADER,
    DATA,
    SEPARATOR
}

export interface Iheader {
    contentDisposition: string;
    contentType: string;
    byteList: number[];
}

export interface Iinput {
    name: string;
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: string;
}
