import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Container, Textarea, Input, Button, Toggle, Modal, Box } from '@cloudscape-design/components';
import Header from "@cloudscape-design/components/header";
import { getAgents, createAgent } from './server.jsx';


const CreateAgentModal = ({ visible, onDismiss }) => {
    const [goal, setGoal] = useState('');
    const [role, setRole] = useState('');
    const [backstory, setBackstory] = useState('');
    const [allowDelegation, setAllowDelegation] = useState(false);
    const [error, setError] = useState('');
    

    const handleSubmit = async () => {
        try {
            // Check if agent with this role already exists
            const existingAgents = await getAgents();
            const isDuplicate = existingAgents.some(agent => 
                agent.role.toLowerCase() === role.toLowerCase()
            );
            
            if (isDuplicate) {
                setError(`An agent with the role "${role}" already exists. Please use a different role name.`);
                return;
            }
            
            var body = {
                "id": Math.floor(Math.random() * 1000000).toString(),
                "goal": goal,
                "role": role,
                "backstory": backstory,
                "allow_delegation": allowDelegation
            }

            console.log('Creating agent with body:', body);

            const resp = await createAgent(body);
            console.log(resp);
            onDismiss(); 
            window.location.reload();
        } catch (error) {
            console.error('Error creating agent:', error);
        }
    }

    return (
        <Modal
            onDismiss={onDismiss}
            visible={visible}
            header="Create Agent"
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                    <Button variant="primary" onClick={handleSubmit}>Create Agent</Button>
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
                            description="Describe the role of the agent"
                        >
                            Role
                        </Header>
                    }
                >
                    <Input
                        value={role}
                        placeholder="Enter the agent's role"
                        onChange={e => setRole(e.detail.value)}
                    />
                    {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
                </Container>              
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Describe the goal of the agent"
                        >
                            Goal
                        </Header>
                    }
                >
                    <Input
                        value={goal}
                        placeholder="Enter the agent's goal"
                        onChange={e => setGoal(e.detail.value)}
                    />
                </Container>

                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Describe the backstory of the agent"
                        >
                            Backstory
                        </Header>
                    }
                >
                    <Textarea
                        value={backstory}
                        placeholder="Enter backstory"
                        onChange={e => setBackstory(e.detail.value)}
                    />
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Select advanced options"
                        >
                            Advanced Options
                        </Header>
                    }
                >
                    <SpaceBetween size="m">
                        <Toggle
                            onChange={({ detail }) => setAllowDelegation(detail.checked)}
                            checked={allowDelegation}
                        >
                            Allow Delegation
                        </Toggle>
                    </SpaceBetween>
                </Container>
            </SpaceBetween>
        </Modal>
    )
}

CreateAgentModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired
};

export default CreateAgentModal;
