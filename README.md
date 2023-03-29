# Form-data_parser

Parser for the form-data request.

## Setup

1. How to use:

```
import * as FormDataParser from "form-data_parser";

export const execute = (request: Express.Request): void => {
    const chunkList: Buffer[] = [];

    request.on("data", (data: Buffer) => {
        chunkList.push(data);
    });

    request.on("end", () => {
        const buffer = Buffer.concat(chunkList);
        const formDataList = FormDataParser.readInput(buffer, request.headers["content-type"]);

        for (const value of formDataList) {
            if (value.name === "file" && value.filename && value.buffer) {
                ...
            }
        }
    });
};
```
