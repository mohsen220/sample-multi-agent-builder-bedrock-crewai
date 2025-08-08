import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Container, Textarea, Input, Button, Modal, Box, Multiselect } from '@cloudscape-design/components';
import Header from "@cloudscape-design/components/header";
import { addMission, getAgents, getMissions } from './server';


const CreateMissionModal = ({ visible, onDismiss }) => {
    const [missionName, setMissionName] = useState('');
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [game, setGame] = useState('');
    const [agentsOptions, setAgentsOptions] = useState([]);
    const [error, setError] = useState('');
    

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const agents = await getAgents();
                setAgentsOptions(agents.map(agent => ({
                    label: agent.role,
                    value: agent.id
                })));
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };
        fetchAgents(); 
    }, []);

    const handleSubmit = async () => {
        try {
            const id = Math.floor(Math.random() * 1000000).toString();

            const newMission = {
                id,
                name: missionName,
                agents: selectedAgents.map(agent => agent.value),
                process: "Sequential",
                tasks: [],
                results: "",
                game,
            };

            //Check if mission name is already taken
            const missions = await getMissions();
            if (missions.find(mission => mission.name === missionName)) {
                setError("Mission name already taken");
                return;
            }

            console.log(newMission)

            const resp = await addMission(newMission);
            console.log(resp);
            onDismiss();
            window.location.reload();
        } catch (error) {
            console.error('Error creating mission:', error);
        }
    };

    return (
        <Modal
            onDismiss={onDismiss}
            visible={visible}
            header="Create Mission"
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="primary" onClick={handleSubmit}>Create Mission</Button>
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
                            description="Enter the mission name"
                        >
                            Name
                        </Header>
                    }
                >
                    <Input
                        value={missionName}
                        placeholder="Enter the mission name"
                        onChange={e => setMissionName(e.detail.value)}
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Select agents"
                        >
                            Agents
                        </Header>
                    }
                >
                    <Multiselect
                        selectedOptions={selectedAgents}
                        onChange={({ detail }) => setSelectedAgents(detail.selectedOptions)}
                        options={agentsOptions}
                        placeholder="Select agents"
                        selectedAriaLabel="Selected"
                        multiSelect
                    />
                </Container>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Enter the game description"
                        >
                            Game
                        </Header>
                    }
                >
                    <Textarea
                        value={game}
                        placeholder="Enter the game description"
                        onChange={e => setGame(e.detail.value)}
                    />
                </Container>
            </SpaceBetween>
        </Modal>
    );
};

CreateMissionModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired
};

export default CreateMissionModal;
