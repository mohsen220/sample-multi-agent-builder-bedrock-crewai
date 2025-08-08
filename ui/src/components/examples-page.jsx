import React, { useState, useEffect } from "react";
import {
  SpaceBetween,
  Box,
  Button,
  Modal,
} from "@cloudscape-design/components";
import { Breadcrumbs, CustomAppLayout } from "./common-components.tsx";
import { Navigation } from "./navigation.tsx";
import Header from "@cloudscape-design/components/header";

import {
  createAgent,
  addMission,
  createTask,
  getMissions,
} from "./server.jsx";

const ExamplesPage = () => {
  const [statusMessage, setStatusMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadedMissions, setLoadedMissions] = useState([]);
  

  useEffect(() => {
    // Check which missions are already loaded when the component mounts
    const checkLoadedMissions = async () => {
      try {
        const missions = await getMissions();
        const loadedExamples = [];
        
        if (missions.find(mission => mission.name === "Event Newsletter Generation")) {
          loadedExamples.push("Event Newsletter Generation");
        }
        
        if (missions.find(mission => mission.name === "Bloodlines: Ascension NPC Creation")) {
          loadedExamples.push("Bloodlines: Ascension NPC Creation");
        }
        
        if (missions.find(mission => mission.name === "Game Code Generation")) {
          loadedExamples.push("Game Code Generation");
        }
        
        setLoadedMissions(loadedExamples);
      } catch (error) {
        console.error("Error checking loaded missions:", error);
      }
    };
    
    checkLoadedMissions();
  }, []);

  const breadCrumbItems = [{ text: "Examples", href: "/examples" }];

  const handleRunNewsletterGeneration = async () => {
    try {
      setStatusMessage("Loading, please do not refresh the page...");

      const missions = await getMissions();
      if (
        missions.find(
          (mission) => mission.name === "Event Newsletter Generation"
        )
      ) {
        setStatusMessage(`Error: Event Newsletter Generation mission already exists. Please delete it first before loading again.`);
        return;
      }

      var event_generator = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Come up with event ideas to host within the next month",
        role: "Event Generator",
        backstory:
          "You are an agent that thinks big and brainstorms on event idea",
        allow_delegation: false,
      };

      var copy_writer = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Write descriptions for events",
        role: "Copy Writer",
        backstory: "Very good at writing 100 word descriptions for events.",
        allow_delegation: false,
      };

      var marketing_specialist = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Create a compelling newsletter or emails for your audience.",
        role: "Marketing Specialist",
        backstory:
          "5 years of experience working with marketing agencies and writes amazing emails and newsletter.",
        allow_delegation: false,
      };

      await createAgent(event_generator);
      await createAgent(copy_writer);
      await createAgent(marketing_specialist);

      const brainstorm_events_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Brainstorm Events Task",
        agent: event_generator.id,
        description: "Come up with 3 unique events for the company",
        expected_output: "List of events.",
      };

      const create_event_descriptions_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Create Event Descriptions Task",
        agent: copy_writer.id,
        description:
          "Write a 2-3 line description for each event. Make sure to include a highlight of the event and the appropirate target audience.",
        expected_output: "2-3 line description for each event.",
      };

      const create_newsletter_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Create Newsletter Task",
        agent: marketing_specialist.id,
        description:
          "Come up with a newsletter email format marketing the identified events with the provided descriptions and appropriate dates and times. Keep the tone cheerful and professional.",
        expected_output: "Well formatted newsletter not more than 300 words",
      };

      await createTask(brainstorm_events_task);
      await createTask(create_event_descriptions_task);
      await createTask(create_newsletter_task);

      const mission = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: "Event Newsletter Generation",
        agents: [event_generator.id, copy_writer.id, marketing_specialist.id],
        process: "Sequential",
        tasks: [
          brainstorm_events_task.id,
          create_event_descriptions_task.id,
          create_newsletter_task.id,
        ],
        results: "",
        game: "Create a newsletter for an AI startup that offers a customer service chatbot to its clients. The company likes hosting networking and training events.",
      };

      await addMission(mission);
      
      // Update loaded missions list
      setLoadedMissions(prev => [...prev, "Event Newsletter Generation"]);
      setStatusMessage(
        "Event Newsletter Generation Mission loaded successfully!"
      );
    } catch (error) {
      console.error("Error creating agent:", error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleRunNPCCreation = async () => {
    try {
      setStatusMessage("Loading, please do not refresh the page...");

      const missions = await getMissions();
      if (
        missions.find(
          (mission) => mission.name === "Bloodlines: Ascension NPC Creation"
        )
      ) {
        setStatusMessage(`Error: Bloodlines: Ascension NPC Creation mission already exists. Please delete it first before loading again.`);
        return;
      }

      var character_alchemist = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Create compelling and unique NPCs for a vampire-themed game",
        role: "Character Alchemist",
        backstory:
          "You are a master character designer with expertise in gothic and supernatural themes. You excel at creating memorable characters with rich backstories.",
        allow_delegation: false,
      };

      var dialogue_generator = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Create authentic and engaging dialogue that reflects character personalities",
        role: "Dialogue Generator",
        backstory:
          "Former writer for supernatural drama series with a talent for creating distinct character voices and compelling dialogue.",
        allow_delegation: false,
      };

      var attribute_specialist = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Define balanced and interesting character attributes and abilities",
        role: "Attribute Specialist",
        backstory:
          "Game systems designer with experience in RPG mechanics and character progression systems.",
        allow_delegation: false,
      };

      var npc_sculptor = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Create visual representations of characters that match their descriptions and abilities",
        role: "NPC Sculptor",
        backstory:
          "Digital artist specializing in character design for gothic and supernatural themes.",
        allow_delegation: false,
        tools: ["ImageGenerator"],
      };

      await createAgent(character_alchemist);
      await createAgent(dialogue_generator);
      await createAgent(attribute_specialist);
      await createAgent(npc_sculptor);

      const design_npc_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Design NPC",
        agent: character_alchemist.id,
        description:
          "Create a distinct character archetype suitable for a first-person shooter game, including a brief description of their typical role and playstyle. This NPC could be a mentor offering guidance, a rival challenging the player's progress, or a potential ally with their own agenda.",
        expected_output: "NPC overview in 300 words",
      };

      const create_dialogue_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Create Dialogue Options",
        agent: dialogue_generator.id,
        description:
          "Create a set of dialogue options for the NPC that reflect their personality and role within the game. Ensure that the dialogue is compelling and natural-sounding, providing depth to their character. Consider how their dialogue might change based on player actions or alliances.",
        expected_output:
          "5 key dialogues for the NPC based on the following: First Meeting, Combat Encounter, Offering Assistance, Potential Betrayal, Warning",
      };

      const define_attributes_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Define Attributes",
        agent: attribute_specialist.id,
        description:
          "Create a comprehensive list of physical and personality attributes for the character. For each attribute, assign a rating from 1 to 5, where 1 is the weakest and 5 is the strongest. Physical Attributes (Strength, Agility, Endurance, Dexterity, Perception) Emotional Attributes (Empathy, Courage, Loyalty, Trustworthiness, Assertiveness) Also provide unique abilities of the NPC.",
        expected_output: "A brief attribute sheet for the character.",
      };

      const generate_image_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Generate Image",
        agent: npc_sculptor.id,
        description:
          "Create a visual representation of the NPC that aligns with their backstory and realm's aesthetics. Design elements should reflect their abilities and factional alignment, if any.",
        expected_output: "Image of NPC",
      };

      await createTask(design_npc_task);
      await createTask(create_dialogue_task);
      await createTask(define_attributes_task);
      await createTask(generate_image_task);

      const mission = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: "Bloodlines: Ascension NPC Creation",
        agents: [
          character_alchemist.id,
          dialogue_generator.id,
          attribute_specialist.id,
          npc_sculptor.id,
        ],
        process: "Sequential",
        tasks: [
          design_npc_task.id,
          create_dialogue_task.id,
          define_attributes_task.id,
          generate_image_task.id,
        ],
        results: "",
        game: "In Bloodlines: Ascension, players are vampires navigating a dark, gothic city filled with supernatural intrigue. Form alliances with rival clans, manipulate human society from the shadows, and rise through the ranks to become the most powerful vampire lord.",
      };

      await addMission(mission);
      
      // Update loaded missions list
      setLoadedMissions(prev => [...prev, "Bloodlines: Ascension NPC Creation"]);
      setStatusMessage(
        "Bloodlines: Ascension NPC Creation Mission loaded successfully!"
      );
    } catch (error) {
      console.error("Error creating mission:", error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleRunGameCodeGeneration = async () => {
    try {
      setStatusMessage("Loading, please do not refresh the page...");

      const missions = await getMissions();
      if (missions.find((mission) => mission.name === "Game Code Generation")) {
        setStatusMessage(`Error: Game Code Generation mission already exists. Please delete it first before loading again.`);
        return;
      }

      var prompt_designer = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "To create detailed, comprehensive game design prompts that can be effectively used by code generation models",
        role: "Prompt Designer",
        backstory:
          "Began their career as a technical write for various software companies. Over time, they developed a knack for breaking down complex ideas into clear, actionable insights",
        allow_delegation: false,
      };

      var code_architect = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Create software as needed",
        role: "Code Architect",
        backstory:
          "You are an engineer at a leading tech think tank. Your expertise is in programming in python. You always produce perfect code.",
        allow_delegation: false,
      };

      var code_refiner = {
        id: Math.floor(Math.random() * 1000000).toString(),
        goal: "Ensure that the code does the job that it is supposed to do.",
        role: "Code Refiner",
        backstory:
          "You feel that programmers always do only half the job, so you are super dedicated to make high quality code.",
        allow_delegation: false,
      };

      await createAgent(prompt_designer);
      await createAgent(code_architect);
      await createAgent(code_refiner);

      const game_prompt_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Game Prompt Task",
        agent: prompt_designer.id,
        description:
          "Create a comprehensive game design prompt for a specified game concept. The prompt should provide an in-depth description of the game, including its core mechanics, gameplay elements, visual design, and optional features. The output should be detailed enough to serve as input for an LLM (not a specialized code generation model) to create a functional game prototype. Always explicitly mention that the game must be created using Pygame and cannot use external files or any external libraries other than Pygame. Always explicitly mention not to add any images or sound functions. Remember, the prompt must be specific enough for an LLM (not a specialized code generation model) to produce functional code in a single call. Please mention this as well. Make sure to also include a rules section and mention any as per the input, including how to address any common challenges.",
        expected_output:
          "A well-structured, detailed game design prompt that includes: Game Overview, Core Game Elements, Gameplay Mechanics, Player Interaction, Visual and Audio Design, Scoring System (if applicable), Win/Lose Conditions, Technical Considerations, Optional Features. The prompt should be formatted using markdown, with appropriate headers, lists, and emphasis to enhance readability. The description should be comprehensive enough to guide a code generation model in creating a functional game prototype.",
      };

      const code_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Code Task",
        agent: code_architect.id,
        description:
          "Create a simple version of the game using Python and Pygame. Focus on implementing only the core mechanics with minimal features. Keep the code under 300 lines to ensure it's manageable and bug-free. Do not implement advanced features like sound, complex graphics, or save systems.",
        expected_output:
          "Your Final answer must be the full python code, only the python code and nothing else.",
      };

      const review_task = {
        id: Math.floor(Math.random() * 1000000).toString(),
        task: "Review Task",
        agent: code_refiner.id,
        description:
          "You are helping create a game using python. Check for log errors, syntax errors, missing imports, variable declarations, mismatched brackets, and security vulnerabilities. You must also ensure that no external libraries are used otehr than Pygame adn that no external files are used. Your Final answer must be full python code.",
        expected_output:
          "Your Final answer must be the full python code, only the python code and nothing else.",
      };

      await createTask(game_prompt_task);
      await createTask(code_task);
      await createTask(review_task);

      const mission = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: "Game Code Generation",
        agents: [prompt_designer.id, code_architect.id, code_refiner.id],
        process: "Sequential",
        tasks: [game_prompt_task.id, code_task.id, review_task.id],
        results: "",
        game: "Create a very simple Snake game with minimal features. The snake should move in four directions, grow when eating food, and the game should end when the snake hits the wall or itself. No advanced features needed.",
      };

      await addMission(mission);
      
      // Update loaded missions list
      setLoadedMissions(prev => [...prev, "Game Code Generation"]);
      setStatusMessage("Game Code Generation Mission loaded successfully!");
    } catch (error) {
      console.error("Error creating agent:", error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  return (
    <CustomAppLayout
      navigation={<Navigation />}
      breadcrumbs={<Breadcrumbs breadCrumbItems={breadCrumbItems} />}
      content={
        <SpaceBetween size="l">
          {/* Header */}
          <Header
            variant="h1"
            description="Prepopulate with sample missions. Select the button for the desired mission to load."
          >
            Examples
          </Header>

          {/* Buttons Section */}
          <Box padding="l">
            <SpaceBetween size="m">
              <Button 
                variant="primary" 
                onClick={handleRunNewsletterGeneration}
                disabled={loadedMissions.includes("Event Newsletter Generation")}
              >
                {loadedMissions.includes("Event Newsletter Generation") 
                  ? "Event Newsletter Generation Already Loaded" 
                  : "Load Event Newsletter Generation Mission"}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRunGameCodeGeneration}
                disabled={loadedMissions.includes("Game Code Generation")}
              >
                {loadedMissions.includes("Game Code Generation") 
                  ? "Game Code Generation Already Loaded" 
                  : "Load Game Code Generation Mission"}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRunNPCCreation}
                disabled={loadedMissions.includes("Bloodlines: Ascension NPC Creation")}
              >
                {loadedMissions.includes("Bloodlines: Ascension NPC Creation") 
                  ? "NPC Creation Already Loaded" 
                  : "Load NPC Creation Mission"}
              </Button>
            </SpaceBetween>
          </Box>

          {/* Status Message */}
          {statusMessage && (
            <Box padding="m" color={statusMessage.includes("Error") ? "text-status-error" : "text-status-success"}>
              {statusMessage}
            </Box>
          )}

          {/* Example Modal */}
          <Modal
            visible={showModal}
            onDismiss={() => setShowModal(false)}
            header="Example Modal"
            footer={
              <Box float="right">
                <Button variant="primary" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </Box>
            }
          >
            This is an example modal
          </Modal>
        </SpaceBetween>
      }
    />
  );
};

export default ExamplesPage;
