import React, { useEffect, useState } from 'react';
import CodeEditor from '@cloudscape-design/components/code-editor';
import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/cloud_editor.css';
import 'ace-builds/css/theme/cloud_editor_dark.css';

const i18nStrings = {
  loadingState: 'Loading code editor',
  errorState: 'There was an error loading the code editor.',
  errorStateRecovery: 'Retry',

  editorGroupAriaLabel: 'Code editor',
  statusBarGroupAriaLabel: 'Status bar',

  cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
  errorsTab: 'Errors',
  warningsTab: 'Warnings',
  preferencesButtonAriaLabel: 'Preferences',

  paneCloseButtonAriaLabel: 'Close',

  preferencesModalHeader: 'Preferences',
  preferencesModalCancel: 'Cancel',
  preferencesModalConfirm: 'Confirm',
  preferencesModalWrapLines: 'Wrap lines',
  preferencesModalTheme: 'Theme',
  preferencesModalLightThemes: 'Light themes',
  preferencesModalDarkThemes: 'Dark themes',
};

export default function CodeBlock(props) {
  // Don't store props in state, read directly from props
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [ace, setAce] = useState();

  useEffect(() => {
    async function loadAce() {
      const ace = await import('ace-builds');
      await import('ace-builds/webpack-resolver');
      ace.config.set('useStrictCSP', true);

      return ace;
    }

    loadAce()
      .then(ace => setAce(ace))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CodeEditor
      ace={ace}
      value={value}
      language={props.language}
      onDelayedChange={event => setValue(event.detail.value)}
      preferences={preferences}
      onPreferencesChange={event => setPreferences(event.detail)}
      loading={loading}
      i18nStrings={i18nStrings}
      themes={{ light: ['cloud_editor'], dark: ['cloud_editor_dark'] }}
    />
  );
}