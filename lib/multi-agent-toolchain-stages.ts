import { MultiAgentProjectStack } from './multi-agent-project-stack';
import { Stage, StageProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MultiAgentProjectStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const stack = new MultiAgentProjectStack(this, 'MultiAgentProjectStack');
    }
}