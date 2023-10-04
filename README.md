# Form-data_parser

Parser for the form-data request.

## Publish

1. npm run build
2. npm login --auth-type=legacy
3. npm publish --auth-type=legacy --access public

## Installation

1. Link for npm package -> https://www.npmjs.com/package/@cimo/websocket

## Server - Example with "NodeJs Express"

-   Server.ts

```
...

import * as ControllerTest from "../Controller/Test";

...

server.listen(8080, () => {

    ...

    ControllerTest.api(app);
});

...
```

-   ControllerTest.ts

```
...

import * as ControllerUpload from "../Controller/Upload";

export const api = (app: Express.Express): void => {
    app.post("/upload", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request, false)
                .then((resultList) => {
                    let fileName = "";

                    for (const value of resultList) {
                        if (value.name === "file" && value.filename) {
                            fileName = value.filename;
                        }
                    }

                    response.status(200).send({ fileName: `${fileName}` });
                })
                .catch((error: Error) => {
                    response.status(500).send({ Error: "Upload failed." });
                });
        })();
    });
};

...
```

-   ControllerUpload.ts

```
...

import * as FormDataParser from "@cimo/form-data_parser";

export const execute = (request: Express.Request, fileExists: boolean): Promise<FormDataParser.Iinput[]> => {
    return new Promise((resolve, reject) => {
        const chunkList: Buffer[] = [];

        request.on("data", (data: Buffer) => {
            chunkList.push(data);
        });

        request.on("end", () => {
            const buffer = Buffer.concat(chunkList);
            const formDataList = FormDataParser.readInput(buffer, request.headers["content-type"]);

            for (const value of formDataList) {
                if (value.name === "file" && value.filename && value.buffer) {
                    const input = `/home/root/file/input/${value.filename}`;

                    if (fileExists && Fs.existsSync(input)) {
                        reject("Upload.ts - execute() - request.on('end' - reject error: File exists.");

                        break;
                    } else {
                        resolve(formDataList);

                        break;
                    }
                }
            }
        });

        request.on("error", (error: Error) => {
            reject(error);
        });
    });
};

...
```
