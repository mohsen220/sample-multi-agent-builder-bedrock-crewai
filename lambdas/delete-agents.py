import boto3
import json
import os

def main(event, context):
    statusCode = 200
    isBase64Encoded = True
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE"
    }

    body = ""

    try:
        dynamodb_client = boto3.client('dynamodb')

        # Extract the list of agent IDs from the event
        agent_ids = event['ids']  # Directly use the 'ids' list from the event

        for agent_id in agent_ids:
            # Delete each item from DynamoDB
            dynamodb_client.delete_item(
                TableName=os.environ['tableName'],
                Key={
                    'id': {'S': agent_id}
                }
            )

        body = "Agents deleted successfully."

    except Exception as e:
        statusCode = 500
        body = f"Error: {str(e)}"

    finally:
        response = {
            "isBase64Encoded": isBase64Encoded,
            "statusCode": statusCode,
            "body": body,
            "headers": headers
        }
        return response