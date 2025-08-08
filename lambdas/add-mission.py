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
        "Access-Control-Allow-Methods": "POST"
    }

    try:
        dynamodb_client = boto3.client('dynamodb')

        print(event)

        mission_id = event['id']
        name = event['name']
        agents = event['agents']
        game = event['game']
        tasks = event['tasks'] or []

        put_response = dynamodb_client.put_item(
            TableName=os.environ['tableName'],
            Item={
                'id': {'S': mission_id},
                'name': {'S': name},
                'agents': {'L': [{'S': agent} for agent in agents]},
                'game': {'S': game},
                'process': {'S': "Sequential"},
                'tasks': {'L': [{'S': task} for task in tasks]},
                'results': {'S': ""}
            }
        )

        body = "Mission added successfully."

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