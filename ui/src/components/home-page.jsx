import React, { createRef } from 'react';
import { Navigation } from './navigation.tsx';
import '../styles/base.scss';
import MissionsPage from './missions-page.jsx';
import AgentsPage from './agents-page.jsx'
import ExamplesPage from './examples-page.jsx';

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      toolsIndex: 0, 
      toolsOpen: false, 
    };
    this.appLayout = createRef();
  }

  loadHelpPanelContent(index) {
    this.setState({ toolsIndex: index, toolsOpen: true });
    this.appLayout.current?.focusToolsClose();
  }


  render() {
    if (window.location.href.substring(window.location.href.lastIndexOf('/') + 1) === 'missions') {
      return (
        <MissionsPage
          navigation={<Navigation/>} 
        ></MissionsPage>
      );
    } else if (window.location.href.substring(window.location.href.lastIndexOf('/') + 1) === 'agents'){
      return (
        <AgentsPage
          navigation={<Navigation/>}
        ></AgentsPage>
      );
      
    } else if (window.location.href.substring(window.location.href.lastIndexOf('/') + 1) === 'examples'){
      return (
        <ExamplesPage
          navigation={<Navigation/>}
        ></ExamplesPage>
      ); 
    } else {
      return (
        <MissionsPage
          navigation={<Navigation/>}
        ></MissionsPage>
      );
    }

  }
}

export default HomePage;

