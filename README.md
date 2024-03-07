# Form-data_parser

Parser for the form-data request. Light, fast and secure.
Write with native Typescript code and no dependencies is used.

## Publish

1. npm run build
2. npm login --auth-type=legacy
3. npm publish --auth-type=legacy --access public

## Installation

1. Link for npm package -> https://www.npmjs.com/package/@cimo/form-data_parser

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

                            break;
                        }
                    }

                    response.status(200).send({ fileName: `${fileName}` });
                })
                .catch((error: Error) => {
                    response.status(200).send({ Error: "Upload failed." });
                });
        })();
    });
};

...
```

-   ControllerUpload.ts

```
...

import { Cfdp, CfdpInterface } from "@cimo/form-data_parser";

export const execute = (request: Express.Request, fileExists: boolean): Promise<CfdpInterface.Iinput[]> => {
    return new Promise((resolve, reject) => {
        const chunkList: Buffer[] = [];

        request.on("data", (data: Buffer) => {
            chunkList.push(data);
        });

        request.on("end", () => {
            const buffer = Buffer.concat(chunkList);
            const formDataList = Cfdp.readInput(buffer, request.headers["content-type"]);

            for (const value of formDataList) {
                if (value.name === "file" && value.filename && value.buffer) {
                    const input = `/home/root/file/input/${value.filename}`;

                    if (fileExists && Fs.existsSync(input)) {
                        reject("File exists.");

                        break;
                    } else {
                        // Write the file "value.buffer"

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
