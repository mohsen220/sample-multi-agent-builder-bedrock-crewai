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

        id = event['id']  

        dynamodb_client.delete_item(
            TableName=os.environ['tableName'],
            Key={
                'id': {'S': id}
            }
        )

        body = "Task deleted successfully."

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