import axios, { AxiosError } from "axios";
import { config } from "process";
import {
  AgentsApi,
  Configuration,
  ContractsApi,
  FleetApi,
  SystemsApi,
  DefaultApi,
} from "spacetraders-sdk";

const configuration = new Configuration({
  accessToken: localStorage.getItem("access-token") || "",
});

export const instance = axios.create({});

// Retry logic for 429 rate-limit errors
instance.interceptors.response.use(
  // response interceptor
  (res) => res,
  // error interceptor
  async (error) => {
    // console.log(JSON.stringify(error.config));
    // console.log(JSON.stringify(error.response.status));
    if (error.response.status === 401) {
      console.log("Bad token");

      window.location.href = "/login";
    }

    const apiError = error.response?.data?.error;

    if (!apiError) {
      // No error data, wait for 10s and retry
      await new Promise((resolve) => {
        setTimeout(resolve, 10 * 1000);
      });

      return instance.request(error.config);
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];

      await new Promise((resolve) => {
        setTimeout(resolve, retryAfter * 1000);
      });

      return instance.request(error.config);
    }

    throw error;
  }
);

const api = {
  system: new SystemsApi(configuration, undefined, instance),
  contract: new ContractsApi(configuration, undefined, instance),
  fleet: new FleetApi(configuration, undefined, instance),
  agent: new AgentsApi(configuration, undefined, instance),
  default: new DefaultApi(configuration, undefined, instance),
};

export default api;
