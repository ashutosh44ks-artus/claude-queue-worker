# How to use Claude Queue Worker

1. Ensure requirements.md is fulfilled
2. Clone this repository and navigate to the project directory
3. Create a `.env` file in the root of the project using the provided `.env.example` as a template
4. Fill in the required environment variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `BACKEND_URL`: Your backend server URL
   - `USER_ID`: Your user identifier
   - `SESSION_ID`: Your session identifier
5. Go to the `worker` directory:
   ```bash
   cd worker
   ```
6. Build the Docker image:
   ```bash
   docker build -t claude-queue .
   ```
7. Install dependencies: `npm install`
8. Start the worker: `npm run dev`
