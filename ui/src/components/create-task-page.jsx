import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Container, Textarea, Input, Button, Modal, Box, Select } from '@cloudscape-design/components';
import Header from "@cloudscape-design/components/header";
import { createTask } from './server';

const CreateTaskModal = ({ visible, onDismiss, addTasks, missionAgents }) => {
    const [task, setTask] = useState('');
    const [description, setDescription] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null);

    const handleSubmit = async () => {
        try {
            const id = Math.floor(Math.random() * 1000000).toString();
            
            const newTask = {
                id,
                task,
                description,
                expected_output: expectedOutput,
                agent: selectedAgent.value
            };
            
            const response = await createTask(newTask);
            console.log('Task created:', response);
            
            addTasks(newTask);
            onDismiss();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    return (
        <Modal
            onDismiss={onDismiss}
            visible={visible}
            header="Create Task"
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="primary" onClick={handleSubmit}>Create</Button>
                        <Button variant="link" onClick={onDismiss}>Cancel</Button>
                    </SpaceBetween>
                </Box>
            }
        >
            <SpaceBetween size="m">
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Enter the task name"
                        >
                            Name
                        </Header>
                    }
                >
                    <Input
                        value={task}
                        placeholder="Enter the task name"
                        onChange={e => setTask(e.detail.value)}
                    />
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Select the agent for this task"
                        >
                            Agent
                        </Header>
                    }
                >
                    <Select
                        selectedOption={selectedAgent}
                        onChange={({ detail }) => setSelectedAgent(detail.selectedOption)}
                        options={missionAgents.map(agent => ({
                            label: agent.role,
                            value: agent.id
                        }))}
                        placeholder="Select an agent"
                    />
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Enter the task description"
                        >
                            Description
                        </Header>
                    }
                >
                    <Textarea
                        value={description}
                        placeholder="Enter the task description"
                        onChange={e => setDescription(e.detail.value)}
                    />
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Enter the expected output"
                        >
                            Expected Output
                        </Header>
                    }
                >
                    <Textarea
                        value={expectedOutput}
                        placeholder="Enter the expected output"
                        onChange={e => setExpectedOutput(e.detail.value)}
                    />
                </Container>
            </SpaceBetween>
        </Modal>
    );
};

CreateTaskModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  addTasks: PropTypes.func.isRequired,
  missionAgents: PropTypes.array.isRequired
};

export default CreateTaskModal;
