import axios from "axios";
import rateLimit from "axios-rate-limit";
import {
  AgentsApi,
  ContractsApi,
  DefaultApi,
  FleetApi,
  SystemsApi,
} from "./spacetraders-sdk/api";
import { Configuration } from "./spacetraders-sdk/configuration";
import toast from "react-hot-toast";

class Api {
  private configuration = new Configuration();

  private http = rateLimit(axios.create(), {
    maxRequests: 10,
    perMilliseconds: 10000,
  });

  public system = new SystemsApi(this.configuration, undefined, this.http);
  public contract = new ContractsApi(this.configuration, undefined, this.http);
  public fleet = new FleetApi(this.configuration, undefined, this.http);
  public agent = new AgentsApi(this.configuration, undefined, this.http);
  public default = new DefaultApi(undefined, undefined, this.http); // No config (token not needed)

  constructor() {
    this.updateToken(localStorage.getItem("access-token") || "");

    // Retry logic for 429 rate-limit errors
    this.http.interceptors.response.use(
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

          return this.http.request(error.config);
        } else {
          toast.error(apiError.message);
        }

        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];

          await new Promise((resolve) => {
            setTimeout(resolve, retryAfter * 1000);
          });

          return this.http.request(error.config);
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

    this.system = new SystemsApi(this.configuration, undefined, this.http);
    this.contract = new ContractsApi(this.configuration, undefined, this.http);
    this.fleet = new FleetApi(this.configuration, undefined, this.http);
    this.agent = new AgentsApi(this.configuration, undefined, this.http);
    this.default = new DefaultApi(undefined, undefined, this.http); // No config (token not needed)
  }
}

const api = new Api();

export default api;
