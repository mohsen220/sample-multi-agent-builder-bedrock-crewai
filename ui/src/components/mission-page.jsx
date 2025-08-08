import React from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Container, Multiselect, Button, Textarea } from '@cloudscape-design/components';
import {
PageHeader,
} from './common-components.tsx';
import Header from "@cloudscape-design/components/header";
import { CodeView } from '@cloudscape-design/code-view';
import pythonHighlight from "@cloudscape-design/code-view/highlight/python";
import LoadingBar from "@cloudscape-design/chat-components/loading-bar";
import Box from "@cloudscape-design/components/box";

import TasksList from './tasks-list.jsx';
import { getTasks, getAgents, editMission, getMissionResult  } from './server.jsx'; // Updated to getMissions
import CreateTaskPage from './create-task-page.jsx';

export const COLUMN_DEFINITIONS = [

  {
    id: 'task',
    header: 'Task Name',
    cell: item => item.task,
    isRowHeader: true,
  },
  {
    id: 'mission',
    header: 'Mission', // Updated header
    cell: item => item.mission, // Updated cell
    isRowHeader: true,
  },
  {
    id: 'description',
    header: 'Description',
    cell: item => item.description,
  },
  {
    id: 'expected_output',
    header: 'expected Output',
    cell: item => item.expected_output,
  },
];

class Mission extends React.Component {
  constructor(props) {
    super(props);
    let initialSelectedAgents = [];
    if (props.mission.agents) {
      initialSelectedAgents = props.mission.agents.map(agent => ({
        value: agent.id,
        label: agent.role
      }));
    }

    this.state = {
      selectedAgents: initialSelectedAgents,
      agentsOpen: false,
      isEditing: false,
      isCreate: false,
      missionTasks: props.mission.tasks || [],
      tasks: [],
      results: props.mission.results || "// No results yet",
      game: props.mission.game || "",
      isLoadingResult: false,
      agents: [],
      isLoading: true,
      isModalVisible: false,
      selectedProcess: props.mission.process == "Sequential"? {label: 'Sequential', value: '1'} : {label: 'Hierarchical', value: '2'},
      taskOutputs: []
    };
  }


  async componentDidMount() {
    try {
      const agents = await getAgents();
      const tasks = await getTasks();
  
      const filteredTasks = this.state.missionTasks.map(taskId => {
        return tasks.find(task => task.id === taskId.S);
      }).filter(task => task !== undefined);
  
      // Set agents and tasks first
      this.setState({
        agents: agents,
        tasks: filteredTasks,
        isLoading: false
      }, () => {
  
        // Now call getSelectedAgents and update the selectedAgents state
        const newSelectedAgents = this.getSelectedAgents(this.props.mission.agents);
        this.setSelectedAgents(newSelectedAgents);
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      this.setState({ isLoading: false });
    }
  }
  

  getSelectedAgents = (inputAgents) => {
    if (!inputAgents) {
      return [];
    }
    var selectedAgents = inputAgents.map(agentId => {
      const findAgent = this.state.agents.find(agent => {
        const agentIdS = agentId?.S?.trim(); 
        const agentIdValue = agent?.id?.trim(); 
  
        return agentIdValue && agentIdS && agentIdValue === agentIdS; 
      });
  
      return findAgent;
    }).filter(agent => agent !== undefined);
  
    selectedAgents = selectedAgents.map(agent => ({
      value: agent.id,
      label: agent.role,
    }));
  
    return selectedAgents;
  }

  setSelectedAgents = (inputAgents) => {
    this.setState({ selectedAgents: inputAgents });
  }

  onClickEdit = () => {
    this.setState({ isEditing: true });
  }

  onClickCancel = () => {
    this.setState({ isEditing: false });
  }

  onClickSave = () => {
    this.setState({
      isEditing: false,
    });
    
    const mission = {
      id: this.props.mission.id,
      name: this.props.mission.name,
      game: this.state.game,
      agents: this.state.selectedAgents.map(agent => agent.value),
      tasks: this.state.tasks.map(task => task.id),
      results: this.state.results,
      process: this.state.selectedProcess.label
    }

    editMission(mission).then(() => console.log('Mission updated successfully'))
  }

  onClickRun = async () => {
    this.setState({
      isLoadingResult: true, 
      isEditing: false
    });
    const results = await getMissionResult(this.props.mission.id)

    this.setState({
      results: results["results"],
      taskOutputs: results["task_outputs"],
      execution_time: results["execution_time"]
    }, () => {
      this.setState({ isLoadingResult: false });
    });

    const mission = {
      id: this.props.mission.id,
      name: this.props.mission.name,
      game: this.state.game,
      agents: this.state.selectedAgents.map(agent => agent.value),
      tasks: this.state.tasks.map(task => task.id),
      results: results,
      process: this.state.selectedProcess.label
    }

    await editMission(mission)
  }

  handleGameChange = (value) => {
    this.setState({ game: value });
  }

  getAgentOptions = () => {
    const options = this.state.agents.map(agent => ({
      value: agent.id,
      label: agent.role,
    }));
    return options;
  }


  addTasks = (newTask) => {
    this.setState(prevState => ({
      tasks: [...prevState.tasks, newTask]
    }), () => {

      const mission = {
        id: this.props.mission.id,
        name: this.props.mission.name,
        game: this.state.game,
        agents: this.state.selectedAgents.map(agent => agent.value),
        tasks: this.state.tasks.map(task => task.id),
        results: this.state.results,
        process: this.state.selectedProcess.label
      }
  
      editMission(mission).then(() => console.log('Mission updated successfully'))
    });
  }

  onCreate = () => {
    this.setState({ isModalVisible: true });
  };

    
  closeCreateModal = () => {
    this.setState({ isModalVisible: false });
  };

  setSelectedProcess = (process) => {
    this.setState({ selectedProcess: process });
  }

  deleteMissionTask = (deleteItem) => {
    // remove task item from state
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(task => task.id !== deleteItem.id)
    }), () => {
      const mission = {
        id: this.props.mission.id,
        name: this.props.mission.name,
        game: this.state.game,
        agents: this.state.selectedAgents.map(agent => agent.value),
        tasks: this.state.tasks.map(task => task.id),
        results: this.state.results,
        process: this.state.selectedProcess.label
      }

      editMission(mission).then(() => console.log('Mission updated successfully'))
    })
  }

  render() {
    return (
      <SpaceBetween size="m">
        <PageHeader
          buttons={[{ text: 'Edit', onClick: this.onClickEdit }]}
          title={"Mission: " + this.props.mission.name}
        />
        <Container
                header={
                    <Header
                    variant="h2"
                    description="Describe the game"
                    >
                      Game
                    </Header>
                }
                >
                {
                    this.state.isEditing ? (
                        <Textarea
                        size="lg" // Options might include xs, sm, md, lg
                        value={this.state.game}
                            placeholder="This is a placeholder"
                            onChange={({ detail }) => this.handleGameChange(detail.value)}
                        />
                    ) : (
                        <span style={{ whiteSpace: 'pre-line' }}>{this.state.game}</span>
                    )
                }

            </Container>
            <Container
              header={
                <Header variant="h2" description="Choose the agents">
                  Agents
                </Header>
              }
            >
              {this.state.isLoading ? (
                <div>Loading agents...</div> // Display loading message
              ) : (
                <Multiselect
                  readOnly={!this.state.isEditing}
                  selectedOptions={this.state.selectedAgents}
                  onChange={({ detail }) =>
                    this.setSelectedAgents(detail.selectedOptions)
                  }
                  options={this.getAgentOptions()} // Call getAgentOptions only when agents are loaded
                  placeholder="Choose options"
                />
              )}
            </Container>

            <TasksList
              isEditing={this.state.isEditing}
              tasks={this.state.tasks}
              taskOutputs={this.state.taskOutputs}
              selectedProcess={this.state.selectedProcess}
              agents={this.state.agents} 
              onCreate={this.onCreate} 
              setSelectedProcess={this.setSelectedProcess}
              deleteMissionTask={this.deleteMissionTask}
              isLoadingResult={this.state.isLoadingResult}
            />

            <Container
                header={
                    <Header
                    variant="h2"
                    description="Results of the mission"
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button onClick={this.onClickRun}>Run</Button>
                        </SpaceBetween>
                    }
                    >
                    Results
                    </Header>
                }
                >
                  {
                    this.state.execution_time ? 
                    (
                      <p>Execution time: {this.state.execution_time.toFixed(2)} seconds</p>
                    ) :
                    (
                      <p></p>
                    )
                  }
                    {
                        this.state.isLoadingResult ? 
                        (
                            <div aria-live="polite">
                            <Box
                              margin={{ bottom: "xs", left: "l" }}
                              color="text-body-secondary"
                            >
                              Loading results...
                            </Box>
                            <LoadingBar variant="gen-ai" />
                          </div>
                        ) :
                        (
                            <CodeView
                                content={this.state.results || ""}
                                highlight={pythonHighlight} 
                                lineNumbers 
                            /> 

                        )
                    }
                    
            </Container>




            {
                this.state.isEditing ? (
                    <SpaceBetween size="m">
                        <Button variant="link" onClick={this.onClickCancel}>Cancel</Button>
                        <Button variant="primary" onClick={this.onClickSave}>Save</Button>
                    </SpaceBetween>
                    
                ) : null
            }
              {
                this.state.isModalVisible ? 
                  <CreateTaskPage visible={this.state.isModalVisible} onDismiss={this.closeCreateModal} addTasks={this.addTasks} missionAgents={this.state.agents}/>
                : 
                <div></div>
              }
        </SpaceBetween>
    )

}

}

Mission.propTypes = {
  mission: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    agents: PropTypes.array,
    tasks: PropTypes.array,
    results: PropTypes.string,
    game: PropTypes.string,
    process: PropTypes.string
  }).isRequired
};

export default Mission;
