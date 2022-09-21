Lambda Function: 
Game with both teams as user AI must run for 3000 ticks in 10s without timing out or running out of memory. If user cant do either of those things, the game ends.

- [x] Game runs locally
- [x] Test in Lambda locally
- [x] Test success and failure 
- [x] Test with Postman 
- [ ] Deploy to ECR
- [ ] Deploy to Lambda
- [ ] Test with postman in prod

###To build you image:

docker build -t ai_arena_lambda .

###To run your image locally:

docker run --name ai-arena-lambda -p 9000:8080 ai_arena_lambda

http://localhost:9000/2015-03-31/functions/function/invocations

1. Modify code
2. Deploy locally with Docker
3. Test with Postman
4. Deploy to Lambda
5. Test with Postman in Lambda