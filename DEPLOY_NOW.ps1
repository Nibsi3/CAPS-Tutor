# Quick deployment script - run this in your terminal after logging in
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id="690a39bf0011810ee554"
appwrite functions create-deployment --function-id="690a3b49003855f68c7e" --code="appwrite-deploy" --entrypoint="server.js" --activate

