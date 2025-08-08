from dotenv import load_dotenv
import os

load_dotenv()

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient
import httpx
import json
from crewai import Agent, Task, Crew, LLM
from textwrap import dedent
import boto3
import time
from tools import ImageGeneratorTool, TimeoutCodeInterpreterTool
import os

app = FastAPI()
ssm = boto3.client('ssm')

def get_endpoint(param_name):
    try:
        response = ssm.get_parameter(Name=param_name)
        return response['Parameter']['Value']
    except Exception as e:
        print(f"Error fetching {param_name}: {e}")
        return None

# Get API endpoints from environment variables
API_ENDPOINT = get_endpoint('/api/endpoint')
LLM_API = get_endpoint('/agent-api/endpoint')

# Define specific allowed origins
origins = [
    "http://localhost:3000",  # Local development
    "https://your-production-domain.com"  # Replace with your actual production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

claude_haiku = LLM(
    model="bedrock/anthropic.claude-3-haiku-20240307-v1:0",
    temperature=0.5
)

image_generator = ImageGeneratorTool(result_as_answer=True)

os.makedirs("./images", exist_ok=True)

async def fetch_mission(id):
    print(f"Fetching API Endpoint: {API_ENDPOINT}")
    print(f"Fetching LLM Endpoint: {LLM_API}")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_ENDPOINT}/missions")
        response.raise_for_status()
        missions = response.json()['body']
        missions_list = json.loads(missions)

        mission = None
        for m in missions_list:
            if m['id']['S'] == id:
                mission = m
                break

        if mission:
            return mission
        else:
            error_message = f"No mission found with ID: {id}"
            print(error_message)
            raise ValueError(error_message)

async def fetch_mission_tasks(tasks):
    
    mission_tasks = []

    async with httpx.AsyncClient() as client:
        print(f"Fetching API Endpoint IN FETCH MISSIONS TASKS: {API_ENDPOINT}")
        print(f"Fetching LLM Endpoint: {LLM_API}")
        response = await client.get(f"{API_ENDPOINT}/tasks")
        response.raise_for_status()
        tasks_data = response.json()['body']
        tasks_list = json.loads(tasks_data)

        for task in tasks['L']:
            for t in tasks_list:
                if t['id']['S'] == task['S']:
                    mission_tasks.append(t)

    print(f"Mission tasks: {mission_tasks}") 
    return mission_tasks


async def fetch_mission_agents(agents):
    mission_agents = []

    async with httpx.AsyncClient() as client:
        print(f"Fetching API Endpoint in MISSIONS AGENTS: {API_ENDPOINT}")
        print(f"Fetching LLM Endpoint: {LLM_API}")
        response = await client.get(f"{API_ENDPOINT}/agents")
        response.raise_for_status()
        agents_data = response.json()['body']
        agents_list = json.loads(agents_data)

        for a in agents_list:
            for agent in agents['L']:
                if a['id']['S'] == agent['S']:
                    mission_agents.append(a)
        
    return mission_agents

def format_agents(agents, llm, mission=None):
    formatted_agents = []
    tools = []  # Initialize tools list here

    for agent in agents:
        try:
            if 'tools' in agent and agent['tools']['L']:
                tools = []  # Reset tools for each agent
                for tool in agent['tools']['L']:
                    if tool['S'] == 'ImageGenerator':
                            tools.append(image_generator)
                    elif tool['S'] == 'CodeInterpreter':
                        tools.append(TimeoutCodeInterpreterTool(timeout=180))

            formatted_agent = Agent(
                role=agent['role']['S'],
                goal=agent['goal']['S'],
                backstory=dedent(agent['backstory']['S']),
                allow_delegation=agent['allow_delegation']['BOOL'],
                verbose=True,
                llm=llm,
                tools=tools 
            )
            formatted_agents.append(formatted_agent)
        except KeyError as e:
            print(f"KeyError: Missing key {e} in agent data")
        except Exception as e:
            print(f"An error occurred while processing agent: {e}")
            
    return formatted_agents

def get_manager_agent(agents):
    for agent in agents:
        if agent['allow_delegation']['BOOL'] == True:
            return agent
    return None

def get_formatted_agent(id, agents, llm):
    agent = None
    for agent in agents:
        if agent['id']['S'] == id:
            agent = agent
            break
    
    try:
        tools = []  # Initialize tools list
        if 'tools' in agent and agent['tools']['L']:
            for tool in agent['tools']['L']:
                if tool['S'] == 'ImageGenerator':
                    tools.append(image_generator)
                elif tool['S'] == 'CodeInterpreter':
                    tools.append(TimeoutCodeInterpreterTool(timeout=180))

        formatted_agent = Agent(
            role=agent['role']['S'],
            goal=agent['goal']['S'],
            backstory=dedent(agent['backstory']['S']),
            allow_delegation=agent['allow_delegation']['BOOL'],
            verbose=True,
            tools=tools,
            llm=llm,
        )

        return formatted_agent
    except KeyError as e:
        print(f"KeyError: Missing key {e} in agent data")
    except Exception as e:
        print(f"An error occurred while processing agent: {e}")

def format_tasks(tasks, agents, game, llm):
    formatted_tasks = []
    for task in tasks:
        try:
            task_id = task['id']['S'] 
            agent = get_formatted_agent(task['agent']['S'], agents, llm)
            
            formatted_task = Task(
                description=dedent(task['description']['S'] + "\n This is one of the tasks for the following project: " + game),
                expected_output=dedent(task['expected_output']['S']),
                agent=agent,
                verbose=True,
                context=formatted_tasks, 
                tools=agent.tools
            )
            formatted_tasks.append(formatted_task)
                        
        except KeyError as e:
            print(f"KeyError: Missing key {e} in task data")
        except Exception as e:
            print(f"An error occurred while processing task: {e}")

    return formatted_tasks

def is_json(my_string):
    try:
        json_object = json.loads(my_string)
        print(json_object)
        if not isinstance(json_object, (dict, list)):
            return False
        return True
    except ValueError:
        return False


@app.get("/")
def read_root():
    return {"status": "ok", "message": "ok"}

@app.post("/results")
async def results(request: Request) -> Response:
    start_time = time.time()
    request_data = await request.json()
    id = request_data['id']
    api_endpoint = request_data['apiEndpoint'].rstrip('/')  # Remove trailing slash if present
    
    print(f"Processing request for mission {id} using API endpoint: {api_endpoint}")

    try:
        mission = await fetch_mission(id)
        llm = claude_haiku
        print("Received request data:", request_data) 


        tasks = await fetch_mission_tasks(mission['tasks'])
        print("Tasks fetched!")
        print(tasks)
        print("Processing mission ID:", id) 


        agents = await fetch_mission_agents(mission['agents'])
        print("Agents fetched!")
        print(agents)

        formatted_agents = format_agents(agents, llm, mission)
        formatted_tasks = format_tasks(tasks, agents, mission['game']['S'], llm)
        print("Tasks and agents formatted!")
        print(formatted_tasks)

        print(f"Process type: {mission['process']['S'].lower()}")

        if (mission['process']['S'].lower() == 'hierarchical'):
            manager_agent = get_manager_agent(agents)

            if manager_agent is None:
                crew = Crew(
                    agents=formatted_agents,
                    tasks=formatted_tasks,
                    process=mission['process']['S'].lower(),
                    verbose=True,
                    manager_llm=llm,
                )       
            else:
                manager_agent_formatted = get_formatted_agent(manager_agent['id']['S'], agents, llm)
                crew = Crew(
                    agents=formatted_agents,
                    tasks=formatted_tasks,
                    process=mission['process']['S'].lower(),
                    verbose=True,
                    manager_agent=manager_agent_formatted,
                )
        else:
            crew = Crew(
                agents=formatted_agents,
                tasks=formatted_tasks,
                process=mission['process']['S'].lower(),
                verbose=True,
            )

        response = crew.kickoff()

        task_outputs = []
        for task in formatted_tasks:
            output = task.output.raw

            print(f"Task output: {output}")

            if is_json(output):
                with open("images/" + json.loads(output)["image_file_name"], "r") as file:
                    image_data = file.read()  
                task_outputs.append(json.dumps({
                    "type": "image",
                    "data": image_data 
                }))
            else:
                task_outputs.append(json.dumps({
                    "type": "text",
                    "data": output
                }))
                
        end_time = time.time()
        execution_time = end_time - start_time

        return JSONResponse(content={
            "results": response.raw,
            "task_outputs": task_outputs,
            "execution_time": execution_time
        })

    except httpx.HTTPStatusError as exc:
        return JSONResponse(content={"error": str(exc)}, status_code=exc.response.status_code)
    except Exception as e:
        print(e)
        return JSONResponse(content={"error": str(e)}, status_code=500)

client = TestClient(app)

def test_main():
    response = client.post("/results", json={
        "id": "1",
        "apiEndpoint": "http://localhost:3000/api"
    })

# test_main()
