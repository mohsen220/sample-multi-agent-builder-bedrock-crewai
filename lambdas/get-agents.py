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
        "Access-Control-Allow-Methods": "GET"
    }

    try:
        dynamodb_client = boto3.client('dynamodb')

        scan_response = dynamodb_client.scan(
            TableName=os.environ['tableName']
        )

        items = scan_response.get('Items', [])
        body = json.dumps(items) 

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