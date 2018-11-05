const request = require('request')
const { StringDecoder } = require('string_decoder');

// TODO Generate this at https://nebula.fleet.space
const token = ""

const existingDevices = new Set()

const callApi = (path, method, token, requestBody) => new Promise((resolve, reject) => {
    const option = {
        url: `https://api.fleet.space${path}`,
        method,
        headers: { 'access-key': token },
        json: true,
        body: requestBody,
    }
    request(option, (error, response, respBody) => {
        if (error) {
            reject(new Error('Network connection error'))
        } else if (response.statusCode === 200) {
            if (respBody.err) {
                reject(new Error(respBody.err))
            } else {
                resolve(respBody)
            }
        } else if (response.statusCode === 401 || response.statusCode === 403) {
            reject(new Error(respBody.err))
        } else {
            reject(new Error('Unknown error', response.statusCode))
        }
    })
})


let isWorking = false


const renderValue = (value) => {
    if (value && value.type === 'Buffer') {
        try {
            const buffer = Buffer.from(value.data)
            result = new StringDecoder('utf8').write(buffer)
            result = result.replace(/"/gi, "")
            return result
        } catch (error) {
            console.error(`Error decoding bytes: ${error}`)
            return value.data.join(', ')
        }
    } else {
        return value
    }
}

const addReading = async (reading) => {
    // Example reading

    // { value: { type: 'Buffer', data: [Array] },
    // timestamp: '2018-09-14T11:48:48+00:00',
    // generic_sensor_type: 0,
    // portal: '300434063436990',
    // pk: '300434063436990_5_1',
    // sensor: '5',
    // sensor_type: 'temperature' },

    if (reading.sensor_type != 'temperature') {
        return
    }

    const device_id = `${reading.portal}_${reading.sensor}`

    const data = {
        [reading.sensor_type]: renderValue(reading.value),
    }

    const timestamp = new Date(reading.timestamp)

    console.log("Sending message: ", device_id, timestamp, data, reading.timestamp)


    await sendMessage(device_id, timestamp, data)

}

const poll = async () => {
    if (isWorking) {
        return
    }

    isWorking = true

    const after = await getLastMessageTime()

    console.log("Last message time: ", after)

    let data
    if (after) {
        data = await callApi(`/data/mine?after=${after.toISOString()}`, 'GET', token)
    } else {
        data = await callApi(`/data/mine`, 'GET', token)
    }


    // console.log("Got data", data)
    for (reading of data) {
        await addReading(reading)
    }
    isWorking = false


}

const dowork = () => {
    poll()
    setInterval(poll, 1000 * 10)

}

const getLastMessageTime = async () => {
    // TODO implement this in your API
    return new Date(0)
}

const sendMessage = async (device_id, timestamp, data) => {
    // TODO implement this in your API
    return true
}


module.exports = dowork
