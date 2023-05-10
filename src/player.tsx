import axios, { AxiosHeaders, AxiosResponse } from 'axios'

const apiToken = process.env.REACT_APP_API_TOKEN
const config = { headers: { Authorization: "Bearer " + apiToken } }

interface AgentInfoCallback {
    (symbol: string, headquarters: string, credits: number): void;
}

async function getAgentInfo(callback: AgentInfoCallback = () => {}) {
    return axios
      .get("https://api.spacetraders.io/v2/my/agent", config)
      .then((res) => {
        console.log(res.data.data.symbol)
        const json = res.data.data
        return callback(json.symbol, json.headquarters, json.credits)
      })
      .catch((err) => {
        console.log(err)
      })
}

export default { apiToken, config, getAgentInfo }