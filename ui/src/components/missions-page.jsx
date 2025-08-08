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
import MissionPage from './mission-page.jsx';
import { getMissions, deleteMissions } from './server.jsx';
import CreateMissionModal from './create-mission-page.jsx';

const CardsPanel = (props) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [missions, setMissions] = useState([]);
    const [searchText, setSearchText] = useState(""); // Manage search text state here
    

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const fetchedMissions = await getMissions();
                setMissions(fetchedMissions);
            } catch (error) {
                console.error('Error fetching missions:', error);
            }
        };
        fetchMissions();
    }, []);

    // Filter missions based on the search text (only by name)
    const filteredMissions = missions.filter(mission =>
        mission.name.toLowerCase().includes(searchText.toLowerCase())
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
                itemSelectionLabel: (e, i) => `select ${i.name}`,
                selectionGroupLabel: "Item selection"
            }}
            cardDefinition={{
                header: item => (
                    <Link href="#" fontSize="heading-m" onClick={() => props.onClickSelected(item)}>
                        {item.name}
                    </Link>
                ),
                sections: [
                    {
                        id: "game",
                        header: "Game",
                        content: item => item.game
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
            items={filteredMissions}
            loadingText="Loading resources"
            selectionType="multi"
            trackBy="name"
            visibleSections={["game"]}
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
                    filteringPlaceholder="Find missions"
                    onChange={({ detail }) => setSearchText(detail.filteringText)}
                />
            }
            header={
                <Header
                    counter={
                        selectedItems?.length
                            ? "(" + selectedItems.length + "/" + missions.length + ")"
                            : "(" + missions.length + ")"
                    }
                >
                    Missions
                </Header>
            }
        />
      );
  };

CardsPanel.propTypes = {
    setSelected: PropTypes.func.isRequired,
    onClickSelected: PropTypes.func.isRequired
};

class MissionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currMission: null,
            selectedMissions: [],
            showDeleteModal: false,
            breadCrumbItems: [
                { text: "Missions", href: "/missions" },
            ],
            showCreateModal: false,
        };
        
    }

    setCurrMission = (mission) => {
        this.setState(prevState => ({
            currMission: mission,
            breadCrumbItems: [...prevState.breadCrumbItems, { text: mission.name, href: "/missions/" + mission.id} ]
        }))
    }

    setSelectedMissions = (missions) => {
        this.setState({selectedMissions: missions})
    }

    onClickDelete = () => {
        this.setState({ showDeleteModal: true })
    }

    onClickConfirmDelete = async () => {
        console.log("Delete")
        console.log(this.state.selectedMissions)
        this.closeDeleteModal()
        await deleteMissions(this.state.selectedMissions)
        window.location.reload();
    }

    closeDeleteModal = () => {
        this.setState({ showDeleteModal: false })
    }

    closeCreateModal = () => {
        this.setState({ showCreateModal: false })
    }

    onClickCreate = () => {
        this.setState({ showCreateModal: true })
    }

    render() {
        return (
            <CustomAppLayout
                ref={this.appLayout}
                content={
                    <SpaceBetween size="m">
                        {
                            !this.state.currMission ?
                                <SpaceBetween size="m">
                                    <PageHeader
                                        buttons={[{ text: 'Create', onClick: this.onClickCreate }, { text: 'Delete', onClick: this.onClickDelete }]}
                                        title="Missions"
                                    />
                                    <SpaceBetween size="l">
                                        <CardsPanel
                                            setSelected={this.setSelectedMissions}
                                            onClickSelected={this.setCurrMission}
                                        />
                                    </SpaceBetween>
                                </SpaceBetween>

                                :
                                
                  <MissionPage mission={this.state.currMission}/>
                        }


                        {
                            this.state.showCreateModal ?
                                <CreateMissionModal visible={this.state.showCreateModal} onDismiss={this.closeCreateModal}/>
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
                            header="Are you sure you want to delete missions"
                        >
                            Are you sure you want to delete {this.state.selectedMissions.map((mission) => mission.name).join(", ")}?
                        </Modal>

                    </SpaceBetween>

                }
                navigation={this.props.navigation}
                breadcrumbs={<Breadcrumbs breadCrumbItems={this.state.breadCrumbItems} />}
            />
        );

    }

}

MissionsPage.propTypes = {
    navigation: PropTypes.node,
    t: PropTypes.func
};

export default MissionsPage;
