import { Agent } from "./spacetraders-sdk";
import EventEmitter from "eventemitter3";
import api from "./api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

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

function useAgent(): [Agent, React.Dispatch<React.SetStateAction<Agent>>] {
  const [agent, setAgent] = useState<Agent>(AgentDB.getMyAgent());

  useEffect(() => {
    function agentUpdateCallback(newAgent: Agent) {
      setAgent(newAgent);
    }
    AgentDB.addListener("update", agentUpdateCallback);

    return () => {
      AgentDB.removeListener("update", agentUpdateCallback);
    };
  }, []);

  return [agent, setAgent];
}

const AgentDB = new AgentDatabase();

// Trigger initial fetch
// AgentDB.update();

export { AgentDB, useAgent };
