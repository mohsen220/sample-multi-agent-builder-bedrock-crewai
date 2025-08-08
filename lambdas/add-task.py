import boto3
import json
import os

def main(event, context):
    statusCode = 200 
    isBase64Encoded = False
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST"
    }

    try:
        dynamodb_client = boto3.client('dynamodb')

        # Parse the incoming event body
        id = event['id']
        task_name = event['task']
        agent_id = event['agent']
        description = event['description']
        expected_output = event['expected_output']
        
        # Put the new task into the DynamoDB table
        put_response = dynamodb_client.put_item(
            TableName=os.environ['tableName'],
            Item={
                'id': {'S': id},
                'task': {'S': task_name},
                'agent': {'S': agent_id},
                'description': {'S': description},
                'expected_output': {'S': expected_output},
            }
        )
        
        body = "New task added successfully."

    except Exception as e:
        statusCode = 500
        body = str(e)

    finally:
        response = {
            "isBase64Encoded": isBase64Encoded,
            "statusCode": statusCode,
            "body": body,
            "headers": headers
        }
        return response