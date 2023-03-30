import { IreadState, Iheader, Iinput } from "./FormDataParserInterface";

const createObject = (input: Iinput, label: string, value: Buffer | Record<string, number> | string | number): void => {
    Object.defineProperty(input, label, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
};

const processData = (header: Iheader): Iinput => {
    const result = {} as Iinput;

    const contentDispositionSplit = header.contentDisposition.split(";");

    if (contentDispositionSplit) {
        const name = contentDispositionSplit[1] ? contentDispositionSplit[1].split("=")[1].replace(/"/g, "").trim() : "";
        const buffer = Buffer.from(header.byteList);
        const filename = contentDispositionSplit[2] ? contentDispositionSplit[2].split("=")[1].trim() : "";

        createObject(result, "name", name);

        createObject(result, "buffer", buffer);

        if (filename) {
            const byteList = JSON.parse(filename) as Record<string, number>;
            createObject(result, "filename", byteList);

            const mimeType = header.contentType.split(":")[1] ? header.contentType.split(":")[1].trim() : "";
            createObject(result, "mimeType", mimeType);

            const size = Buffer.byteLength(buffer);
            createObject(result, "size", size);
        }
    }

    return result;
};

export const readInput = (buffer: Buffer, contentType: string | undefined): Iinput[] => {
    const resultList: Iinput[] = [];

    if (contentType) {
        const boundary = contentType.replace("multipart/form-data; boundary=", "");

        let line = "";
        let readState = IreadState.INIT;
        let headerInputList: string[] = [];
        let headerContentDisposition = "";
        let headerContentType = "";
        let byteList: number[] = [];

        for (let a = 0; a < buffer.length; a++) {
            const byte = buffer[a];
            const prevByte = a > 0 ? buffer[a - 1] : null;
            // 0x0a - LF => \n
            // 0x0d - CR => \r
            const characterNewLine = byte === 0x0a || byte === 0x0d;
            const characterReturn = byte === 0x0a && prevByte === 0x0d;

            if (!characterNewLine) {
                line += String.fromCharCode(byte);
            }

            if (characterReturn && readState === IreadState.INIT) {
                if (line == "--" + boundary) {
                    readState = IreadState.HEADER;
                }

                line = "";
            } else if (characterReturn && readState === IreadState.HEADER) {
                if (line.length) {
                    headerInputList.push(line);
                } else {
                    readState = IreadState.DATA;

                    for (const b of headerInputList) {
                        if (b.toLowerCase().startsWith("content-disposition:")) {
                            headerContentDisposition = b;
                        } else if (b.toLowerCase().startsWith("content-type:")) {
                            headerContentType = b;
                        }
                    }

                    byteList = [];
                }

                line = "";
            } else if (readState === IreadState.DATA) {
                if (line.length > boundary.length + 4) {
                    line = "";
                }

                if (line === "--" + boundary) {
                    readState = IreadState.SEPARATOR;

                    const difference = byteList.length - line.length;
                    const byteListSlice = byteList.slice(0, difference - 1);

                    const input = processData({ contentDisposition: headerContentDisposition, contentType: headerContentType, byteList: byteListSlice });

                    resultList.push(input);

                    line = "";
                    headerInputList = [];
                    headerContentDisposition = "";
                    headerContentType = "";
                    byteList = [];
                } else {
                    byteList.push(byte);
                }

                if (characterReturn) {
                    line = "";
                }
            } else if (characterReturn && readState === IreadState.SEPARATOR) {
                readState = IreadState.HEADER;
            }
        }
    }

    return resultList;
};
