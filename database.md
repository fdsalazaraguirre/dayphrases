Db changes and tables creates on dynamoDb

aws dynamodb create-table --table-name dayphrases --attribute-definitions AttributeName=dayphraseid,AttributeType=S --key-schema AttributeName=dayphraseid,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --region us-east-1 --query TableDescription.TableArn --output text