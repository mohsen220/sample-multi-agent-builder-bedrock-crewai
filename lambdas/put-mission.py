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
        "Access-Control-Allow-Methods": "PUT"
    }

    try:
        dynamodb_client = boto3.client('dynamodb')

        item = {'id': {'S': event['id']}}

        optional_fields = ['agents', 'game', 'name', 'results', 'tasks', 'process']

        for field in optional_fields:
            if field in event:
                if field in ['agents', 'tasks']: 
                    item[field] = {'L': [{'S': str(element)} for element in event[field]]}
                else: 
                    item[field] = {'S': event[field]}

        put_response = dynamodb_client.put_item(
            TableName=os.environ['tableName'],
            Item=item
        )

        body = "Mission updated successfully."

    except Exception as e:
        statusCode = 500