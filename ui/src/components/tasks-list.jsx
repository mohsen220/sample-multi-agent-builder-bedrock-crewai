import React from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Input, Modal, Box, Button, Container, Tabs} from '@cloudscape-design/components';
import Select from "@cloudscape-design/components/select";

import Header from "@cloudscape-design/components/header";
import { deleteTask, getAgents } from './server.jsx';
import ImageViewer from './image-viewer.jsx';

class TasksList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currTask: null,
      selectedTasks: [],
      showDeleteModal: false,
      selectedProcess: props.selectedProcess,
      agents: [],
      deleteTask: null,
      isEditing: false,
      description: '',
      expectedOutput: ''
    };
  }

  async componentDidMount() {
    try {
      const agents = await getAgents();
      this.setState({ agents: agents });
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }

  setCurrTask = (task) => {
    this.setState(prevState => ({
      ...prevState,
      currTask: task,
    }));
  }

  setShowDeleteModal = (task) => {
    this.setState({ showDeleteModal: true, deleteTask: task });
  }

  onClickDelete = () => {
    this.setState({ showDeleteModal: true });
  }

  onClickConfirmDelete = () => {
    this.closeDeleteModal();
    deleteTask(this.state.deleteTask)
    this.props.deleteMissionTask(this.state.deleteTask)
  }

  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  }

  setSelectedProcess = (item) => {
    console.warn(item)
    this.setState({ selectedProcess: item });
    this.props.setSelectedProcess(item)
  }

  handleDescriptionChange = (value) => {
    this.setState({ description: value });
  }

  handleExpectedOutputChange = (value) => {
    this.setState({ expectedOutput: value });
  }

  renderOutput = (output) => {
    try {
      const outputJson = JSON.parse(output);
  
      if (outputJson.type === 'image') {
        // For image outputs, use the ImageViewer component which includes download functionality
        return (
          <ImageViewer 
            imageData={outputJson.data} 
            fileName={`generated-image-${Date.now()}.png`}
          />
        );
      }
      
      // For text outputs
      return <span style={{ whiteSpace: 'pre-line' }}>{outputJson.data}</span>;
    } catch (error) {
      // If parsing fails, treat it as plain text
      console.error("Error parsing task output:", error);
      return <span style={{ whiteSpace: 'pre-line' }}>{output}</span>;
    }
  };

  getSelectedOption = (taskAgent) => {
    const agent = this.state.agents.find(agent => agent.id === taskAgent);
    return agent ? { value: agent.id, label: agent.role } : null;
  };

  setSelectedOption = (option) => {
    console.log(option);
  };

  handleDeleteTask = (task) => {
    this.setShowDeleteModal(task);
  };

  renderTasksTabs() {
    return (
      <Tabs
        tabs={this.props.tasks.map((task, index) => ({
          label: task.task,
          id: `task-${index}`,
          dismissible: true,
          onDismiss: () => this.handleDeleteTask(task),
          content: (
            <div key={index}>
              <h4>Agent</h4>
              <Select
                readOnly={!this.props.isCreate}
                selectedOption={this.getSelectedOption(task.agent)}
                onChange={({ detail }) =>
                  this.setSelectedOption(detail.selectedOption)
                }
                options={this.state.agents.map(agent => ({
                  value: agent.id,
                  label: agent.role,
                }))}
              />
              <h4>Description</h4>
              {
                this.state.isEditing ? (
                  <Input
                    value={task.description}
                    placeholder="Enter description"
                    onChange={({ detail }) => this.handleDescriptionChange(detail.value)}
                  />
                ) : (
                  <p>{task.description}</p>
                )
              }
              <h4>Expected Output</h4>
              {
                this.state.isEditing ? (
                  <Input
                    value={task.expected_output}
                    placeholder="Expected output"
                    onChange={({ detail }) => this.handleExpectedOutputChange(detail.value)}
                  />
                ) : (
                  <p>{task.expected_output}</p>
                )
              }
              {
                this.props.taskOutputs && this.props.taskOutputs.length > index && !this.props.isLoadingResult ? (
                  <div>
                    <h4>Output</h4>
                    {this.renderOutput(this.props.taskOutputs[index])}
                  </div>
                ) : null
              }
            </div>
          ),
        }))}
      />
    );
  }

  render() {
    return (
      <Container
        header={
          <Header
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Select
                  readOnly={!this.props.isEditing}
                  selectedOption={this.props.selectedProcess}
                  onChange={({ detail }) =>
                    this.setSelectedProcess(detail.selectedOption)
                  }
                  options={[
                    { label: "Sequential", value: "1" },
                    { label: "Hierarchical", value: "2" },
                  ]}
                />
                <Button disabled={!this.props.isEditing} onClick={this.props.onCreate}>Create</Button>
              </SpaceBetween>
            }
          >
            Tasks
          </Header>
        }
      >
        {this.state.agents.length > 0 && this.props.tasks && this.props.tasks.length > 0 ? (
          this.renderTasksTabs()
        ) : (
          <div>No tasks available</div>
        )}

        <Modal
          onDismiss={this.closeDeleteModal}
          visible={this.state.showDeleteModal}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={this.closeDeleteModal}>Cancel</Button>
                <Button variant="primary" onClick={this.onClickConfirmDelete}>Ok</Button>
              </SpaceBetween>
            </Box>
          }
          header="Are you sure you want to delete task"
        >
        </Modal>
      </Container>
    );
  }
}

TasksList.propTypes = {
  selectedProcess: PropTypes.object,
  deleteMissionTask: PropTypes.func,
  setSelectedProcess: PropTypes.func,
  tasks: PropTypes.array,
  isCreate: PropTypes.bool,
  taskOutputs: PropTypes.array,
  isLoadingResult: PropTypes.bool,
  isEditing: PropTypes.bool,
  onCreate: PropTypes.func
};

export default TasksList;
