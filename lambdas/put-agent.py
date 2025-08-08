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

        optional_fields = ['role', 'goal', 'backstory', 'allow_delegation', 'tools']

        for field in optional_fields:
            if field in event:
                if field == 'tools':
                    item[field] = {'L': [{'S': str(element)} for element in event[field]]}
                elif field == 'allow_delegation':
                    item[field] = {'BOOL': event[field]}
                else:
                    item[field] = {'S': event[field]}

        # Put item into DynamoDB
        put_response = dynamodb_client.put_item(
            TableName=os.environ['tableName'],
            Item=item
        )

        body = "Agent updated successfully."

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