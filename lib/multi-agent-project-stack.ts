import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { join } from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';

export class MultiAgentProjectStack extends cdk.Stack {
  private agentsTable: dynamodb.Table;
  private missionsTable: dynamodb.Table;
  private tasksTable: dynamodb.Table;
  private api: apigateway.RestApi;
  
  private addAgentLambda: lambda.Function;
  private getAgentsLambda: lambda.Function;
  private putAgentsLambda: lambda.Function;
  private deleteAgentsLambda: lambda.Function;
  private getMissionsLambda: lambda.Function;
  private getTasksLambda: lambda.Function;
  private addTaskLambda: lambda.Function; 
  private deleteTaskLambda: lambda.Function;
  private putMissionLambda: lambda.Function;
  private addMissionLambda: lambda.Function;
  private deleteMissionsLambda: lambda.Function;

private uiBucket: s3.Bucket;
  private uiDistribution: cloudfront.Distribution;

  private fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createDynamoDBTable();
    this.createLambdas();
    this.createApi();
    this.createFargateService();
    this.createUI();
  }

  private createLambdas() {
    this.createLambda_addAgent();
    this.createLambda_getAgents();
    this.createLambda_putAgent();
    this.createLambda_deleteAgents();
    this.createLambda_getMissions();
    this.createLambda_getTasks();
    this.createLambda_addTask();
    this.createLambda_deleteTask();
    this.createLambda_putMission();
    this.createLambda_addMission();
    this.createLambda_deleteMissions();
  }


private createLambda_deleteMissions() {
    this.deleteMissionsLambda = new lambda.Function(this, 'DeleteMissions', {
        runtime: lambda.Runtime.PYTHON_3_11,
        code: lambda.Code.fromAsset('./lambdas'),
        handler: 'delete-missions.main',
        environment: {
            'tableName': this.missionsTable.tableName,
        },
    });

    this.deleteMissionsLambda.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:DeleteItem'],
        resources: [this.missionsTable.tableArn]
    }));
}

  private createDynamoDBTable() {
    this.agentsTable = new dynamodb.Table(this, 'AgentsTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.missionsTable = new dynamodb.Table(this, 'MissionsTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.tasksTable = new dynamodb.Table(this, 'TasksTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private createLambda_deleteTask() {
    this.deleteTaskLambda = new lambda.Function(this, 'DeleteTask', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'delete-task.main',
      environment: {
        'tableName': this.tasksTable.tableName,
      }
    });

    this.deleteTaskLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:DeleteItem'],
      resources: [this.tasksTable.tableArn]
    }));
  }

  private createLambda_addTask() {
    this.addTaskLambda = new lambda.Function(this, 'AddTask', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'add-task.main',
      environment: {
        'tableName': this.tasksTable.tableName,
      }
    });
  
    this.addTaskLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [this.tasksTable.tableArn]
    }));
  }

  private createLambda_addAgent() {
    this.addAgentLambda = new lambda.Function(this, 'AddAgent', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'add-agent.main',
      environment: {
        'tableName': this.agentsTable.tableName,
      }
    });

    this.addAgentLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW, 
      actions: ['dynamodb:PutItem'],
      resources: [this.agentsTable.tableArn]
    }));
  }

  private createLambda_getAgents() {
    this.getAgentsLambda = new lambda.Function(this, 'GetAgents', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'get-agents.main',
      environment: {
        'tableName': this.agentsTable.tableName,
      }
    });

    this.getAgentsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW, 
      actions: ['dynamodb:GetItem', 'dynamodb:Scan'],
      resources: [this.agentsTable.tableArn]
    }));
  }

  private createLambda_putAgent() {
    this.putAgentsLambda = new lambda.Function(this, 'PutAgents', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'put-agent.main',
      environment: {
        'tableName': this.agentsTable.tableName,
      }
    });

    this.putAgentsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [this.agentsTable.tableArn]
    }));
  }

  private createLambda_deleteAgents() {
    this.deleteAgentsLambda = new lambda.Function(this, 'DeleteAgents', { 
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'delete-agents.main',
      environment: {
        'tableName': this.agentsTable.tableName,
      }
    });

    this.deleteAgentsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:DeleteItem'],
      resources: [this.agentsTable.tableArn]
    }));
  }

  private createLambda_getMissions() {
    this.getMissionsLambda = new lambda.Function(this, 'GetMissions', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'get-missions.main',
      environment: {
        'tableName': this.missionsTable.tableName,
      }
    });

    this.getMissionsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:Scan'],
      resources: [this.missionsTable.tableArn]
    }));
  }

  private createLambda_putMission() {
    this.putMissionLambda = new lambda.Function(this, 'PutMission', {
        runtime: lambda.Runtime.PYTHON_3_11,
        code: lambda.Code.fromAsset('./lambdas'),
        handler: 'put-mission.main',
        environment: {
            'tableName': this.missionsTable.tableName,
        },
    });

    this.putMissionLambda.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [this.missionsTable.tableArn]
    }));
}

private createLambda_addMission() {
  this.addMissionLambda = new lambda.Function(this, 'Mission', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'add-mission.main',
      environment: {
          'tableName': this.missionsTable.tableName,
      },
  });

  this.addMissionLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [this.missionsTable.tableArn]
  }));
}

  private createLambda_getTasks() {
    this.getTasksLambda = new lambda.Function(this, 'GetTasks', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('./lambdas'),
      handler: 'get-tasks.main',
      environment: {
        'tableName': this.tasksTable.tableName,
      }
    });
  
    this.getTasksLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:Scan'],
      resources: [this.tasksTable.tableArn]
    }));
  }

  private defaultCorsPreflightOptions = {
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
    ],
    allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
  };

  private integrationResponse: apigateway.IntegrationResponse = {
    statusCode: "200",
    contentHandling: apigateway.ContentHandling.CONVERT_TO_TEXT,
    responseParameters: {
      'method.response.header.Content-Type': "'application/json'",
      'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
      'method.response.header.Access-Control-Allow-Origin': "'*'",
      'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
    },
  };

  private methodResponse: apigateway.MethodResponse = {
    statusCode: "200", 
    responseModels: {"application/json": apigateway.Model.EMPTY_MODEL},
    responseParameters: {
      'method.response.header.Content-Type': true,
      'method.response.header.Access-Control-Allow-Headers': true,
      'method.response.header.Access-Control-Allow-Methods': true,
      'method.response.header.Access-Control-Allow-Origin': true
    }
  };

  private createApi() {
    this.api = new apigateway.RestApi(this, `MutliAgentAPI`, {
      description: 'Multi Agent API',
      deployOptions: {
        stageName: 'Gateway',
      },
      defaultCorsPreflightOptions: this.defaultCorsPreflightOptions,
      deploy: true
    });

    this.createApi_agents();
    this.createApi_missions();
    this.createApi_tasks(); 
  };

  private createApi_tasks() {
    const tasks = this.api.root.addResource('tasks', {
      defaultCorsPreflightOptions: this.defaultCorsPreflightOptions,
    });
  
    tasks.addMethod('GET', new apigateway.LambdaIntegration(this.getTasksLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });
  
    tasks.addMethod('POST', new apigateway.LambdaIntegration(this.addTaskLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    tasks.addMethod('DELETE', new apigateway.LambdaIntegration(this.deleteTaskLambda, { 
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });
  }

  private createApi_agents() {
    const agents = this.api.root.addResource('agents', {
      defaultCorsPreflightOptions: this.defaultCorsPreflightOptions,
    });

    agents.addMethod('GET', new apigateway.LambdaIntegration(this.getAgentsLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    agents.addMethod('POST', new apigateway.LambdaIntegration(this.addAgentLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    agents.addMethod('PUT', new apigateway.LambdaIntegration(this.putAgentsLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    agents.addMethod('DELETE', new apigateway.LambdaIntegration(this.deleteAgentsLambda, {
      proxy: false,
      integrationResponses: [this.integrationResponse],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });
  }

  private createApi_missions() {
    const missions = this.api.root.addResource('missions', {
        defaultCorsPreflightOptions: this.defaultCorsPreflightOptions,
    });

    missions.addMethod('GET', new apigateway.LambdaIntegration(this.getMissionsLambda, {
        proxy: false,
        integrationResponses: [this.integrationResponse],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    missions.addMethod('PUT', new apigateway.LambdaIntegration(this.putMissionLambda, {
        proxy: false,
        integrationResponses: [this.integrationResponse],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { methodResponses: [this.methodResponse] });

    missions.addMethod('POST', new apigateway.LambdaIntegration(this.addMissionLambda, {
        proxy: false,
        integrationResponses: [this.integrationResponse],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), {
        methodResponses: [this.methodResponse]
    });

    missions.addMethod('DELETE', new apigateway.LambdaIntegration(this.deleteMissionsLambda, { 
        proxy: false,
        integrationResponses: [this.integrationResponse],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
    }), { 
        methodResponses: [this.methodResponse] 
    });
}
  
  private s3CorsRule: s3.CorsRule = {
    // TODO: Need to confirm the correct methods to lock down Cors access
    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE],
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    maxAge: 300,
  };

  private createUI() {
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    this.uiBucket = new s3.Bucket(this, 'UIBucket', {
      bucketName: 'multi-agent-ui-bucket-' + this.account,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [this.s3CorsRule],
    });
    this.uiBucket.grantRead(oai);
  
    // Create the API Gateway origin
    const apiOrigin = new origins.RestApiOrigin(this.api, {
      originId: 'APIGateway',
      originPath: ''
    });
  
    new BucketDeployment(this, 'UIDeployment', {
      sources: [
        Source.asset(join(__dirname, '../ui/build'))
      ],
      destinationBucket: this.uiBucket
    });
    
    // Store UI bucket name in SSM for the pipeline
    new ssm.StringParameter(this, 'UIBucketParameter', {
      parameterName: '/multi-agent/ui-bucket',
      stringValue: this.uiBucket.bucketName,
      description: 'UI Bucket name for the Multi-Agent project'
    });
    
    // Output the UI bucket name
    new cdk.CfnOutput(this, 'UIBucketName', {
      value: this.uiBucket.bucketName,
      description: 'UI Bucket Name'
    });
  
    // Create CloudFront Function for routing
    const cfFunction = new cloudfront.Function(this, 'RewriteFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
          
          // List of routes that should be handled by React Router
          var reactRoutes = ['/agents', '/missions', '/examples'];  // supported routes
          
          // Check if the URI matches any of the React routes
          for (var i = 0; i < reactRoutes.length; i++) {
            if (uri.startsWith(reactRoutes[i])) {
              request.uri = '/index.html';
              break;
            }
          }
          
          return request;
        }
      `),
    });
  
    this.uiDistribution = new cloudfront.Distribution(this, 'UIDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.uiBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [{
          function: cfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
        }]
      },
      // Add a behavior for the LLM API
      additionalBehaviors: {
        '/results': {
          origin: new origins.HttpOrigin(this.fargateService.loadBalancer.loadBalancerDnsName, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            readTimeout: cdk.Duration.seconds(60),
            keepaliveTimeout: cdk.Duration.seconds(60)
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER
        }
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responsePagePath: '/error.html',
          responseHttpStatus: 404,
        }
      ],
    });
    
    new cdk.CfnOutput(this, 'UIUrl', {
      value: this.uiDistribution.domainName,
    });
    
    // Store CloudFront distribution ID in SSM for the pipeline
    new ssm.StringParameter(this, 'CloudFrontDistributionParameter', {
      parameterName: '/multi-agent/cf-distribution',
      stringValue: this.uiDistribution.distributionId,
      description: 'CloudFront Distribution ID for the Multi-Agent project'
    });
    
    // Output the CloudFront distribution ID
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.uiDistribution.distributionId,
      description: 'CloudFront Distribution ID'
    });
    
    new ssm.StringParameter(this, 'RestApiEndpoint', {
      parameterName: '/api/endpoint',
      description: 'APIGateway Endpoint URL for MultiAgentAPI',
      stringValue: this.api.url
    });
    
    new ssm.StringParameter(this, 'AgentApiEndpoint', {
      parameterName: '/agent-api/endpoint',
      description: 'Fargate Endpoint URL for AgentAPI',
      stringValue: `https://${this.uiDistribution.domainName}`
    });
  }  

  private createFargateService() {
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 3,
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc,
      containerInsights: true
    });

    const containerAsset = new DockerImageAsset(this, 'AgentApiImage', {
      directory: join(__dirname, '../agents-api'),
      invalidation: { buildArgs: true },
      buildArgs: {
        CACHEBUST: Date.now().toString(),
      },
    });

    // NOT: Need to right-size definition compute/memory resources
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 4096, // Increase to 4GB
      cpu: 2048, // Increase to 2 vCPUs
    });

    // Add SSM read permissions to task role
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          effect: iam.Effect.ALLOW,
          resources: [
              `arn:aws:ssm:${this.region}:${this.account}:parameter/api/*`,
              `arn:aws:ssm:${this.region}:${this.account}:parameter/agent-api/*`
          ]
      })
  );

    // Add container to task definition
    taskDefinition.addContainer('AgentApiContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(containerAsset),
      environment: {
        REGION: this.region,
      },
      portMappings: [
        {
          containerPort: 8000,
          protocol: ecs.Protocol.TCP
        }
      ],
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'AgentApi',
        logRetention: logs.RetentionDays.ONE_MONTH
      }),
    });
    // Scoped Bedrock access for specific models and operations
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream'
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/stability.stable-image-ultra-v1:0`
        ],
      })
    ),

    this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "AgentApiFargateService", {
      cluster: cluster,
      taskDefinition: taskDefinition,
      // TODO: Verify how `agent-api` handles session state, to determine wether or not more containers can be launched
      desiredCount: 1,
      publicLoadBalancer: true,
      // listenerPort: 8000
      healthCheckGracePeriod: cdk.Duration.seconds(300)
    });
  };
}

