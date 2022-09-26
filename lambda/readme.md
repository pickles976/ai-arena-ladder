Lambda Function: 
Game with both teams as user AI must run for 30 ticks in 1500ms without timing out or running out of memory. If user cant do either of those things, the game ends.

### Build:

    docker build -t ai_arena_lambda .

### Run locally:

    docker run --name ai-arena-lambda -p 9000:8080 ai_arena_lambda

### Test locally:  

http://localhost:9000/2015-03-31/functions/function/invocations

### Deploy:
    ./deploy.ps1  



### Changing and Deploying
1. Modify code
2. Deploy locally with Docker
3. Test with Postman
4. Deploy to Lambda
5. Test with Postman in Lambda

## ~~TODO:~~
- [x] Game runs locally
- [x] Test in Lambda locally
- [x] Test success and failure 
- [x] Test with Postman 
- [x] Deploy to ECR
- [x] Deploy to Lambda
- [x] Test with postman in prod