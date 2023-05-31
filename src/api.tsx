import axios from "axios";
import {
  AgentsApi,
  Configuration,
  ContractsApi,
  DefaultApi,
  FleetApi,
  SystemsApi,
} from "spacetraders-sdk";

class Api {
  private configuration = new Configuration();

  private instance = axios.create({});

  public system = new SystemsApi(this.configuration, undefined, this.instance);
  public contract = new ContractsApi(
    this.configuration,
    undefined,
    this.instance
  );
  public fleet = new FleetApi(this.configuration, undefined, this.instance);
  public agent = new AgentsApi(this.configuration, undefined, this.instance);
  public default = new DefaultApi(undefined, undefined, this.instance); // No config (token not needed)

  constructor() {
    this.updateToken(localStorage.getItem("access-token") || "");

    // TODO use rate limiter instead of retry logic
    // Retry logic for 429 rate-limit errors
    this.instance.interceptors.response.use(
      // response interceptor
      (res) => res,
      // error interceptor
      async (error) => {
        // console.log(JSON.stringify(error.config));
        // console.log(JSON.stringify(error.response.status));
        if (error.response.status === 401) {
          console.log("Bad token");
        }

        const apiError = error.response?.data?.error;

        if (!apiError) {
          // No error data, wait for 10s and retry
          await new Promise((resolve) => {
            setTimeout(resolve, 10 * 1000);
          });

          return this.instance.request(error.config);
        }

        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];

          await new Promise((resolve) => {
            setTimeout(resolve, retryAfter * 1000);
          });

          return this.instance.request(error.config);
        }

        throw error;
      }
    );
  }

  public updateToken(token: string) {
    localStorage.setItem("access-token", token);
    this.configuration = new Configuration({
      accessToken: token,
    });

    this.system = new SystemsApi(this.configuration, undefined, this.instance);
    this.contract = new ContractsApi(
      this.configuration,
      undefined,
      this.instance
    );
    this.fleet = new FleetApi(this.configuration, undefined, this.instance);
    this.agent = new AgentsApi(this.configuration, undefined, this.instance);
    this.default = new DefaultApi(undefined, undefined, this.instance); // No config (token not needed)
  }
}

const api = new Api();

export default api;
