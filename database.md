Db changes and tables creates on dynamoDb

aws dynamodb create-table --table-name dayphrase \
  --attribute-definitions AttributeName=dayphrase,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --region us-east-1 \
  --query TableDescription.TableArn --output text