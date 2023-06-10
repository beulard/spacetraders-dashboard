import { Agent } from "./spacetraders-sdk";
import EventEmitter from "eventemitter3";
import api from "./api";
import toast from "react-hot-toast";

class AgentDatabase extends EventEmitter {
  private agent: Agent | null = null;

  // Force a refetch of current ships
  public async update() {
    try {
      const res = await api.agent.getMyAgent();
      this.agent = res.data.data;
      // Notify every listener
      this.emit("update", this.agent);
    } catch (err) {
      console.log(err);
    }
    return this.agent;
  }

  public getMyAgent(): Agent {
    return this.agent!;
  }
}

// TODO make a custom hook for subscribing to agent db events
// export function useFleet () {}

const AgentDB = new AgentDatabase();

export default AgentDB;
