import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Link, Modal, Box, Button } from '@cloudscape-design/components';
import {
    PageHeader,
    Breadcrumbs,
    CustomAppLayout
} from './common-components.tsx';
import Cards from "@cloudscape-design/components/cards";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";

import AgentPage from './agent-page.jsx';
import { deleteAgents, getAgents } from './server.jsx';
import CreateAgentPage from './create-agent-page.jsx';

const CardsPanel = (props) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [agents, setAgents] = useState([]);
    const [searchText, setSearchText] = useState(""); // Manage search text state here

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const fetchedAgents = await getAgents();
                setAgents(fetchedAgents);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };
        fetchAgents();
    }, []);

    // Filter agents based on the search text (only by role)
    const filteredAgents = agents.filter(agent =>
        agent.role.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Cards
            entireCardClickable
            onSelectionChange={({ detail }) => {
                setSelectedItems(detail?.selectedItems ?? []);
                props.setSelected(detail?.selectedItems ?? []);
            }}
            selectedItems={selectedItems}
            ariaLabels={{
                itemSelectionLabel: (e, i) => `select ${i.role}`,
                selectionGroupLabel: "Item selection"
            }}
            cardDefinition={{
                header: item => (
                    <Link href="#" fontSize="heading-m" onClick={() => props.onClickSelected(item)}>
                        {item.role}
                    </Link>
                ),
                sections: [
                    {
                        id: "goal",
                        header: "Goal",
                        content: item => item.goal
                    },
                    {
                        id: "type",
                        header: "Type",
                        content: item => item.type
                    },
                    {
                        id: "size",
                        header: "Size",
                        content: item => item.size
                    }
                ]
            }}
            cardsPerRow={[
                { cards: 1 },
                { minWidth: 500, cards: 2 }
            ]}
            items={filteredAgents}
            loadingText="Loading resources"
            selectionType="multi"
            trackBy="role"
            visibleSections={["goal"]}
            empty={
                <Box
                    margin={{ vertical: "xs" }}
                    textAlign="center"
                    color="inherit"
                >
                    <SpaceBetween size="m">
                        <b>No resources</b>
                        <Button>Create resource</Button>
                    </SpaceBetween>
                </Box>
            }
            filter={
                <TextFilter
                    filteringText={searchText}
                    filteringPlaceholder="Find agents"
                    onChange={({ detail }) => setSearchText(detail.filteringText)}
                />
            }
            header={
                <Header
                    counter={
                        selectedItems?.length
                            ? "(" + selectedItems.length + "/" + agents.length + ")"
                            : "(" + agents.length + ")"
                    }
                >
                    Agents
                </Header>
            }
        />
    );
};

CardsPanel.propTypes = {
    setSelected: PropTypes.func.isRequired,
    onClickSelected: PropTypes.func.isRequired
};

class AgentsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currAgent: null,
            selectedAgents: [],
            showDeleteModal: false,
            breadCrumbItems: [
                { text: "Agents", href: "/agents" },
            ],
            showCreateModal: false,
        };
    }

    setCurrAgent = (agent) => {
        this.setState(prevState => ({
            currAgent: agent,
            breadCrumbItems: [...prevState.breadCrumbItems, { text: agent.role, href: "/agents/" + agent.id} ]
        }))
    }

    setSelectedAgents = (agents) => {
        this.setState({selectedAgents: agents})
    }

    onClickDelete = () => {
        this.setState({ showDeleteModal: true })
    }

    onClickCreate = () => {
      this.setState({ showCreateModal: true });
    };
  
    closeCreateModal = () => {
      this.setState({ showCreateModal: false });
    };

    onClickConfirmDelete = async () => {
        this.closeDeleteModal()
        await deleteAgents(this.state.selectedAgents)
        window.location.reload();
    }

    closeDeleteModal = () => {
        this.setState({ showDeleteModal: false }) 
    }

    render() {
        return (
            <CustomAppLayout
                ref={this.appLayout}
                content={
                    <SpaceBetween size="m">
                        {
                            !this.state.currAgent ?
                                <SpaceBetween size="m">
                                    <PageHeader
                                        buttons={[{ text: 'Create', onClick: this.onClickCreate }, { text: 'Delete', onClick: this.onClickDelete }]}
                                        title="Agents"
                                    />
                                    <SpaceBetween size="l">
                                        <CardsPanel
                                            setSelected={this.setSelectedAgents}
                                            onClickSelected={this.setCurrAgent}
                                        />
                                    </SpaceBetween>
                                </SpaceBetween>
                                :
                                <AgentPage agent={this.state.currAgent} />
                        }

                        {
                            this.state.showCreateModal ?
                                <CreateAgentPage visible={this.state.showCreateModal} onDismiss={this.closeCreateModal} />
                                :
                                <div></div>
                        }

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
                            header="Are you sure you want to delete agents"
                        >
                            Are you sure you want to delete {this.state.selectedAgents.map((agent) => agent.role).join(", ")}?
                        </Modal>
                    </SpaceBetween>
                }
                navigation={this.props.navigation}
                breadcrumbs={<Breadcrumbs breadCrumbItems={this.state.breadCrumbItems} />}
            />
        );
    }
}

AgentsPage.propTypes = {
    navigation: PropTypes.node
};

export default AgentsPage;
