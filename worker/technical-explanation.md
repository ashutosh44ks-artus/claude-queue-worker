## About this repository:

### Code Structure:
1. `worker/index.js`: The main entry point for the worker process. It contains the logic for periodically checking the queue for new tasks and processing them.
2. `worker/utils.js`: Contains utility functions for interacting with the AutoShip backend API and the Claude API.
3. `worker/Dockerfile`: The Dockerfile for building the worker image
4. `worker/.env.example`: An example .env file with the required environment variables for the worker
5. `worker/package.json`: The package.json file for the worker, containing the dependencies and scripts for running the worker

### Environment Variables:
1. `ANTHROPIC_API_KEY`: Your Claude API key
2. `BACKEND_URL`: Your backend server URL
3. `USER_ID`: Your user identifier
4. `SESSION_ID`: Your session identifier

### Claude API Interaction:
The worker uses the `claude` CLI tool to interact with the Claude API. The prompt for generating the app is sent to the `claude` CLI tool, and the response is captured and stored in the database. The worker also captures any errors that occur during the API call and stores them in the database as well.

### Shell command explanation:
`claude -p <prompt> --allow-dangerously-skip-permissions --dangerously-skip-permissions --output-format json`

1. `claude`: The command to invoke the Claude CLI tool
2. `-p <prompt>`: The prompt to be sent to the Claude API for generating the app
3. `--allow-dangerously-skip-permissions`: This flag allows the worker to bypass any permission checks that the Claude API might require. This is essential for providing a seamless user experience, as it eliminates the need for users to manually grant permissions for each API call. Additionally, it simplifies the interaction between the user and the worker running inside the Docker container, as we won't have to implement a separate communication mechanism to handle permission grants. This flag is not dangerous to the end-user because the worker is being run in a controlled environment (the Docker container). The worker will not have access to any other resources or data outside of what is necessary to make the API calls, so there is no risk of unauthorized access or actions being taken on behalf of the user.
4. `--dangerously-skip-permissions`: This flag is used in conjunction with `--allow-dangerously-skip-permissions` to actually skip the permission checks.
5. `--output-format json`: This flag specifies that the output from the Claude API should be in JSON format, which makes it easier to parse and store in the database.