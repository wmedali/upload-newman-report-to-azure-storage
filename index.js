const { BlobServiceClient } = require('@azure/storage-blob');
const newman                = require('newman')
const fs                    = require('fs')
require('dotenv').config()

const CONNECTION_STRING     = process.env.CONNECTION_STRING
const REPORT_NAME           = `Postman_echo_report_${new Date().toISOString().replace(/[-.:]/g,'_')}.html`
const CONTAINER_NAME        = 'containerName'
const REPORT_URL            = `https://asticreporter.blob.core.windows.net/${CONTAINER_NAME}/${REPORT_NAME}`

newman.run({
    collection: 'https://www.getpostman.com/collections/deaa9461134ec64565e4',
    reporters: ['cli', 'htmlextra'],
    folder: 'Headers',
    reporter: {
        htmlextra: {
            export: REPORT_NAME
        }
    }
}, async (err) => {
    if (err) throw err
    blobServiceClient  = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    containerClient    = await blobServiceClient.getContainerClient(CONTAINER_NAME);
    blockBlobClient    = await containerClient.getBlockBlobClient(REPORT_NAME)
    uploadBlobResponse = await blockBlobClient.uploadFile(REPORT_NAME, {
        progress: (ev) => console.log('Upload in progress', ev),
        blobHTTPHeaders: { blobContentType: 'text/html' }
    })
    console.log(`ReportURL : ${REPORT_URL} `)
    fs.unlink(REPORT_NAME, (err) => {
        if (err) {
            console.error(err)
          }
        console.log('Report removed from local disk')
    })
})
