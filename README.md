# Form-data_parser

Parser for the form-data request.

## Publish on npm

1. Write on terminal:

```
npm publish --auth-type=legacy --access public
```

## Setup

1. Link for npm package -> https://www.npmjs.com/package/@cimo/form-data_parser

2. Example for use it with "NodeJs Express":

-   Server.ts

```
...

server.listen(ControllerHelper.SERVER_PORT, () => {
    ...

    ControllerTest.execute(app);
});

...
```

-   ControllerTest.ts

```
...

import * as ControllerUpload from "../Controller/Upload";

export const execute = (app: Express.Express): void => {
    app.post("/uploadFile", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    response.status(200).send({ Response: `${result.filename} - ${result.buffer}` });
                })
                .catch(() => {
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

export const execute = (request: Express.Request): Promise<Record<string, string>> => {
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
                    resolve({ filename: value.filename, buffer: value.buffer });

                    break;
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
