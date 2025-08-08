#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MultiAgentToolchainStack } from '../lib/multi-agent-toolchain-stack';

const app = new cdk.App();

new MultiAgentToolchainStack(app, 'MultiAgentToolchainStack', {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region')
  }
});