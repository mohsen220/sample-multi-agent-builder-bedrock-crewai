import boto3
import json
import os

def main(event, context):
    statusCode = 200
    isBase64Encoded = False  # Typically, this should be False for JSON responses
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST"
    }

    try:
        dynamodb_client = boto3.client('dynamodb')

        # Parse the event body to get the agent details
        agent_id = event['id']
        role = event['role']
        goal = event['goal']
        backstory = event['backstory']
        allow_delegation = event['allow_delegation']
        tools = event.get('tools', [])  

        # Put item into DynamoDB
        put_response = dynamodb_client.put_item(
            TableName=os.environ['tableName'],
            Item={
                'id': {'S': agent_id},
                'role': {'S': role},
                'goal': {'S': goal},
                'backstory': {'S': backstory},
                'allow_delegation': {'BOOL': allow_delegation},
                'tools': {'L': [{'S': element} for element in tools]}
            }
        )

        body = json.dumps({"message": "Agent added successfully."})

    except Exception as e:
        statusCode = 500
        body = json.dumps({"error": str(e)})

    finally:
        response = {
            "isBase64Encoded": isBase64Encoded,
            "statusCode": statusCode,
            "body": body,
            "headers": headers
        }
        return response