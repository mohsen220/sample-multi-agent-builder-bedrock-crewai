/**
 * Copyright (c) 2025 Amazon Bedrock & CrewAI Multi-Agent Builder Contributors
 * 
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const ssm = new AWS.SSM({ region: 'us-west-2' });

async function generateConfig() {
  try {
    console.log('Fetching parameters from SSM...');
    
    let apiUrl = '';
    let llmUrl = '';
    
    try {
      const apiResponse = await ssm.getParameter({ Name: '/api/endpoint' }).promise();
      apiUrl = apiResponse.Parameter.Value;
      console.log(`Successfully retrieved API URL: ${apiUrl}`);
    } catch (error) {
      console.log('API endpoint parameter not found, using default');
      apiUrl = 'http://localhost:3000/api'; // Default for local development
    }
    
    try {
      const llmResponse = await ssm.getParameter({ Name: '/agent-api/endpoint' }).promise();
      llmUrl = llmResponse.Parameter.Value;
      console.log(`Successfully retrieved LLM API URL: ${llmUrl}`);
    } catch (error) {
      console.log('LLM API endpoint parameter not found, using default');
      llmUrl = 'http://localhost:8000'; // Default for local development
    }

    console.log('Using values:');
    console.log(`API URL: ${apiUrl}`);
    console.log(`LLM API URL: ${llmUrl}`);

    // Create .env file content
    const envConfig = [
      `REACT_APP_API=${apiUrl}`,
      `REACT_APP_LLM_API=${llmUrl}`
    ].join('\n');
  
    // Write to root .env file
    const rootEnvPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(rootEnvPath, envConfig);
    console.log(`Written .env to: ${rootEnvPath}`);
    
    // Write to UI .env file
    const uiEnvPath = path.join(process.cwd(), 'ui', '.env');
    fs.writeFileSync(uiEnvPath, envConfig);
    console.log(`Written .env to: ${uiEnvPath}`);
    
    // Verify the files were written correctly
    console.log('Verifying root .env file:');
    console.log(fs.readFileSync(rootEnvPath, 'utf8'));
    
    console.log('Verifying UI .env file:');
    console.log(fs.readFileSync(uiEnvPath, 'utf8'));
    
    console.log('Generated environment variables:');
    console.log(envConfig);
  } catch (error) {
    console.error('Error in generate-config script:', error);
    // Don't exit with error, just continue with defaults
    console.log('Creating default configuration files');
    
    const defaultEnvConfig = [
      'REACT_APP_API=http://localhost:3000/api',
      'REACT_APP_LLM_API=http://localhost:8000'
    ].join('\n');
    
    try {
      // Write default config to root .env file
      const rootEnvPath = path.join(process.cwd(), '.env');
      fs.writeFileSync(rootEnvPath, defaultEnvConfig);
      console.log(`Written default .env to: ${rootEnvPath}`);
      
      // Write default config to UI .env file
      const uiEnvPath = path.join(process.cwd(), 'ui', '.env');
      fs.writeFileSync(uiEnvPath, defaultEnvConfig);
      console.log(`Written default .env to: ${uiEnvPath}`);
    } catch (writeError) {
      console.error('Error writing default config files:', writeError);
    }
  }
}

generateConfig().then(() => {
  console.log('Config generation complete');
}).catch(error => {
  console.error('Unhandled error in generate-config:', error);
  // Don't exit with error code, let the build continue
  console.log('Continuing despite errors');
});