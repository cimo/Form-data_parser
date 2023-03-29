"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readInput = void 0;
const FormDataParserInterface_1 = require("./FormDataParserInterface");
const createObject = (input, label, value) => {
    Object.defineProperty(input, label, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
};
const processData = (header) => {
    const result = {};
    const contentDispositionSplit = header.contentDisposition.split(";");
    if (contentDispositionSplit) {
        const name = contentDispositionSplit[1] ? contentDispositionSplit[1].split("=")[1].replace(/"/g, "") : "";
        const buffer = Buffer.from(header.byteList);
        const filename = contentDispositionSplit[2];
        createObject(result, "name", name);
        createObject(result, "buffer", buffer);
        if (filename) {
            const filenameSplit = filename.split("=");
            if (filenameSplit[0] && filenameSplit[1]) {
                const label = filenameSplit[0].trim();
                const value = filenameSplit[1].trim();
                const byteList = JSON.parse(value);
                createObject(result, label, byteList);
            }
            const mimeType = header.contentType.split(":")[1] ? header.contentType.split(":")[1].trim() : "";
            createObject(result, "mimeType", mimeType);
        }
    }
    return result;
};
const readInput = (buffer, contentType) => {
    const resultList = [];
    if (contentType) {
        const boundary = contentType.replace("multipart/form-data; boundary=", "");
        let line = "";
        let readState = FormDataParserInterface_1.IreadState.INIT;
        let headerInputList = [];
        let headerContentDisposition = "";
        let headerContentType = "";
        let byteList = [];
        for (let a = 0; a < buffer.length; a++) {
            const byte = buffer[a];
            const prevByte = a > 0 ? buffer[a - 1] : null;
            const characterNewLine = byte === 0x0a || byte === 0x0d;
            const characterReturn = byte === 0x0a && prevByte === 0x0d;
            if (!characterNewLine) {
                line += String.fromCharCode(byte);
            }
            if (characterReturn && readState === FormDataParserInterface_1.IreadState.INIT) {
                if (line == "--" + boundary) {
                    readState = FormDataParserInterface_1.IreadState.HEADER;
                }
                line = "";
            }
            else if (characterReturn && readState === FormDataParserInterface_1.IreadState.HEADER) {
                if (line.length) {
                    headerInputList.push(line);
                }
                else {
                    readState = FormDataParserInterface_1.IreadState.DATA;
                    for (const b of headerInputList) {
                        if (b.toLowerCase().startsWith("content-disposition:")) {
                            headerContentDisposition = b;
                        }
                        else if (b.toLowerCase().startsWith("content-type:")) {
                            headerContentType = b;
                        }
                    }
                    byteList = [];
                }
                line = "";
            }
            else if (readState === FormDataParserInterface_1.IreadState.DATA) {
                if (line.length > boundary.length + 4) {
                    line = "";
                }
                if (line === "--" + boundary) {
                    readState = FormDataParserInterface_1.IreadState.SEPARATOR;
                    const difference = byteList.length - line.length;
                    const byteListSlice = byteList.slice(0, difference - 1);
                    const input = processData({ contentDisposition: headerContentDisposition, contentType: headerContentType, byteList: byteListSlice });
                    resultList.push(input);
                    line = "";
                    headerInputList = [];
                    headerContentDisposition = "";
                    headerContentType = "";
                    byteList = [];
                }
                else {
                    byteList.push(byte);
                }
                if (characterReturn) {
                    line = "";
                }
            }
            else if (characterReturn && readState === FormDataParserInterface_1.IreadState.SEPARATOR) {
                readState = FormDataParserInterface_1.IreadState.HEADER;
            }
        }
    }
    return resultList;
};
exports.readInput = readInput;
//# sourceMappingURL=FormDataParser.js.map