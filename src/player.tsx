import axios, { AxiosHeaders, AxiosResponse } from 'axios'

const apiToken = process.env.REACT_APP_API_TOKEN
const config = { headers: { Authorization: "Bearer " + apiToken } }

interface AgentInfoCallback {
    (symbol: string, headquarters: string, credits: number): void;
}

function getAgentInfo() {
    return axios
      .get("https://api.spacetraders.io/v2/my/agent", config)
}

export default { apiToken, config, getAgentInfo }