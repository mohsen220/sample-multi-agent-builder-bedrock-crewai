import React from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Container, Textarea, Multiselect, Input, Button, Toggle } from '@cloudscape-design/components';
import {
    PageHeader, 
  } from './common-components.tsx';
import Header from "@cloudscape-design/components/header";
import { updateAgent } from './server.jsx';


const tools = [
    {
        label: "Image Generator",
        value: "ImageGenerator",
        description: "Generates images from text prompts."
    },
    {
        label: "Code Interpreter",
        value: "CodeInterpreter",
        description: "Interprets and executes code."
    },
]


class AgentPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTools: tools.filter(tool => 
                props.agent.tools.map(agentTool => agentTool.S).includes(tool.value)
              ),
            toolsOpen: false,
            isEditing: false,
            id: props.agent.id,
            goal: props.agent.goal,
            role: props.agent.role,
            backstory: props.agent.backstory,
            checkedAllowDelegation: props.agent.allow_delegation,
        }
    }

    setSelectedTools = (tools) => {
        this.setState({selectedTools: tools})
    }

    onClickEdit = () => {
        this.setState({isEditing: true})
    }

    onClickCancel = () => {
        this.setState({
            isEditing: false,
            id: this.props.agent.id,
            goal: this.props.agent.goal,
            role: this.props.agent.role,
            backstory: this.props.agent.backstory,
            checkedAllowDelegation: this.props.agent.allow_delegation,
        })
    }


    onClickSave = () => {
        this.setState({isEditing: false})

        try {
            var body = {
                "id": this.state.id,
                "goal": this.state.goal,
                "role": this.state.role,
                "backstory": this.state.backstory,
                "allow_delegation": this.state.checkedAllowDelegation,
                "tools": this.state.selectedTools.map(tool => tool.value),
            }
            const resp = updateAgent(body);
            console.log(resp);
        } catch (error) {
            console.error('Error updating agent:', error);
        }
    }

    handleGoalChange = (value) => {
        this.setState({goal: value})
    }

    handleRoleChange = (value) => {
        this.setState({role: value})
    }

    handleBackstoryChange = (value) => {
        this.setState({backstory: value})
    }

    setAllowDelegation = (value) => {
        this.setState({checkedAllowDelegation: value})
    }


    render() {
        return (
            <SpaceBetween size="m">
              <PageHeader
                buttons={[{ text: 'Edit', onClick: this.onClickEdit }]}
                title={"Agent: " + this.state.role}
              />
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
                    {
                        this.state.isEditing ? (
                            <Input
                                value={this.state.role}
                                placeholder="Enter the role of the agent"
                                onChange={e => this.handleRoleChange(e.detail.value)}
                            />
                        ) : (
                            <p>{this.state.role}</p>
                        )
                    }

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
                    {
                        this.state.isEditing ? (
                            <Input
                                value={this.state.goal}
                                placeholder="This is a placeholder"
                                onChange={({ detail }) => this.handleGoalChange(detail.value)}
                            />
                        ) : (
                            <p>{this.state.goal}</p>
                        )
                    }
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
                    {
                        this.state.isEditing ? (
                            <Textarea
                                value={this.state.backstory}
                                placeholder="Enter the backstory of the agent"
                                onChange={({ detail }) => this.handleBackstoryChange(detail.value)}
                            />
                        ) : (
                            <p>{this.state.backstory}</p>
                        )
                    }

                </Container>
                <Container
                    header={
                        <Header
                        variant="h2"
                        description="Select the tools for the agent to use"
                        >
                        Tools
                        </Header>
                    }
                    >
                        <Multiselect
                            readOnly={!this.state.isEditing}
                            selectedOptions={this.state.selectedTools}
                            onChange={({ detail }) =>
                                this.setSelectedTools(detail.selectedOptions)
                            }
                            options={tools}
                            placeholder="Choose options"
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
                            readOnly={!this.state.isEditing}
                            onChange={({ detail }) =>
                                this.setAllowDelegation(detail.checked)
                            }
                            checked={this.state.checkedAllowDelegation}
                            >
                            Allow Delegation
                        </Toggle>  
                    </SpaceBetween>
                </Container>



                {
                    this.state.isEditing ? (
                        <SpaceBetween size="m">
                            <Button variant="link" onClick={this.onClickCancel}>Cancel</Button>
                            <Button variant="primary" onClick={this.onClickSave}>Save</Button>
                        </SpaceBetween>
                        
                    ) : null
                }
                
            </SpaceBetween>
        )

    }

}

AgentPage.propTypes = {
  agent: PropTypes.shape({
    id: PropTypes.string,
    goal: PropTypes.string,
    role: PropTypes.string,
    backstory: PropTypes.string,
    allow_delegation: PropTypes.bool,
    tools: PropTypes.array
  }).isRequired
};

export default AgentPage;
