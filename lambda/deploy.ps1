aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 531418479922.dkr.ecr.us-east-1.amazonaws.com
docker build -t ai-arena-lambda .
docker tag ai-arena-lambda:latest 531418479922.dkr.ecr.us-east-1.amazonaws.com/ai-arena-lambda:latest
docker push 531418479922.dkr.ecr.us-east-1.amazonaws.com/ai-arena-lambda:latest