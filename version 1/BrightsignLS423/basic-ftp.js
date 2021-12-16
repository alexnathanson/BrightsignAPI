/*https://www.npmjs.com/package/basic-ftp*/

console.log("Basic FTP!")

const ftp = require("basic-ftp")

let localDir = "/storage/sd/";

let remoteDST = "192.168.1.231"

example()

async function example() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: remoteDST
            /*port: 21,*/
            /*user: "very",
            password: "password",*/
            /*secure: false*/
        })
        console.log(await client.list())
        await client.downloadTo(localDir + "beambot-pcb-lowres.png", "beambot-pcb-lowres.png")
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}