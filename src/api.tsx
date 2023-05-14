import axios from "axios";
import {
  AgentsApi,
  Configuration,
  ContractsApi,
  FleetApi,
  SystemsApi,
} from "spacetraders-sdk";

const configuration = new Configuration({
  accessToken: process.env.REACT_APP_API_TOKEN,
});

export const instance = axios.create({});

// Retry logic for 429 rate-limit errors
instance.interceptors.response.use(undefined, async (error) => {
  const apiError = error.response?.data?.error;
  console.log(apiError);

  if (error.response?.status === 429) {
    const retryAfter = error.response.headers["retry-after"];

    await new Promise((resolve) => {
      setTimeout(resolve, retryAfter * 1000);
    });

    return instance.request(error.config);
  }

  throw error;
});

const api = {
  system: new SystemsApi(configuration, undefined, instance),
  contract: new ContractsApi(configuration, undefined, instance),
  fleet: new FleetApi(configuration, undefined, instance),
  agent: new AgentsApi(configuration, undefined, instance),
};

export default api;
