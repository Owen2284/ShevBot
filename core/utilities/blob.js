const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

function getBlobServiceClient() {
    // Enter your storage account name
    const account = process.env.BLOB_STORAGE_ACCOUNT_NAME;
    const accessKey = process.env.BLOB_STORAGE_ACCESS_KEY;

    const sharedKeyCredential = new StorageSharedKeyCredential(account, accessKey);

    const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential);

    return blobServiceClient;
}

async function readBlobFile(path) {
    // Get client
    const client = getBlobServiceClient();

    // Get container
    const containerName = process.env.BLOB_STORAGE_CONTAINER_NAME;
    const container = client.getContainerClient(containerName);

    // Get blob
    const blob = container.getBlobClient(path);
    const downloadBlockBlobResponse = await blob.download();
    const downloaded = (
        await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
    ).toString();

    return downloaded;
}

// A helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

async function writeBlobFile(path, content) {
    // Get client
    const client = getBlobServiceClient();

    // Get container
    const containerName = process.env.BLOB_STORAGE_CONTAINER_NAME;
    const container = client.getContainerClient(containerName);

    // Upload blob
    const blob = container.getBlockBlobClient(path);
    const response = await blob.upload(content, content.length);

    return response._response.status >= 200 && response._response.status <= 299;
}

module.exports = {
    readBlobFile,
    writeBlobFile
}