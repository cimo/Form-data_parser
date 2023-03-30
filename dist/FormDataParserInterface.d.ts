/// <reference types="node" />
export declare enum IreadState {
    INIT = 0,
    HEADER = 1,
    DATA = 2,
    SEPARATOR = 3
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
