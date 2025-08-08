// Log all environment variables for debugging
console.log("NODE_ENV:", process.env.NODE_ENV);

// Get API URLs with fallbacks to empty strings
const llm_api = process.env.REACT_APP_LLM_API || "";
const api = process.env.REACT_APP_API || "";

export async function getAgents() {
  const response = await fetch(api + "/agents");
  let data = await response.json();
  data = JSON.parse(data.body);

  const transformedData = data.map((agent) => ({
    allow_delegation: agent.allow_delegation.BOOL,
    backstory: agent.backstory.S,
    goal: agent.goal.S,
    id: agent.id.S,
    role: agent.role.S,
    tools: agent?.tools?.L ?? [],
  }));

  return transformedData;
}

export async function updateAgent(agent) {
  const response = await fetch(api + "/agents", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agent),
  });

  const data = await response.json();
  return data;
}

export async function createAgent(agent) {
  const response = await fetch(api + "/agents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agent),
  });

  const data = await response.json();
  return data;
}

export async function deleteAgents(agents) {
  const ids = agents.map((agent) => agent.id);
  const response = await fetch(api + "/agents", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: ids }),
  });

  const data = await response.json();
  return data;
}

export async function getMissions() {
  const url = `${api}/missions`;
  const response = await fetch(url);
  let data = await response.json();
  data = JSON.parse(data.body);

  const transformedData = await Promise.all(
    data.map(async (mission) => ({
      id: mission?.id?.S ?? "",
      name: mission?.name?.S ?? "",
      game: mission?.game?.S ?? "",
      agents: mission?.agents?.L ?? [],
      tasks: mission?.tasks?.L ?? [],
      results: mission?.results?.S ?? "",
      process: mission?.process?.S ?? "",
    }))
  );

  return transformedData;
}

export async function deleteMissions(missions) {
  const ids = missions.map((mission) => mission.id);
  console.warn(ids);
  const response = await fetch(api + "/missions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: ids }),
  });
  const data = await response.json();
  return data;
}

export async function editMission(mission) {
  const response = await fetch(api + "/missions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mission),
  });

  const data = await response.json();
  return data;
}

export async function getTasks() {
  const response = await fetch(api + "/tasks");
  let data = await response.json();
  data = JSON.parse(data.body);

  const transformedData = data.map((task) => ({
    id: task.id.S,
    task: task.task.S,
    agent: task.agent.S,
    description: task.description.S,
    expected_output: task.expected_output.S,
  }));

  return transformedData;
}

export async function createTask(task) {
  const response = await fetch(`${api}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const data = await response.json();
  return data;
}

export async function deleteTask(task) {
  const response = await fetch(`${api}/tasks`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: task.id }),
  });

  const data = await response.json();
  return data;
}

export async function addMission(mission) {
  const response = await fetch(`${api}/missions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mission),
  });

  const data = await response.json();
  return data;
}

export async function getMissionResult(missionId) {
  try {
    const url = `${llm_api}/results`;
    console.log("Fetching from:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: missionId,
        apiEndpoint: api,
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      if (response.status === 504) {
        console.log("Handling 504 error gracefully");
        return {
          results: "Request timed out. The mission too complex for the current timeout settings.",
          task_outputs: [],
          execution_time: 60
        };
      }
      return {
        results: `Error: HTTP status ${response.status}`,
        task_outputs: [],
        execution_time: 0
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Handling fetch error gracefully:", error);
    // Don't rethrow the error, return a result object instead
    return {
      results: error.name === 'AbortError' 
        ? "Request timed out. The mission too complex for the current timeout settings."
        : `Error: ${error.message}`,
      task_outputs: [],
      execution_time: 0
    };
  }
}
