# Requirements for Claude Queue Worker

- Docker (with Docker daemon running)
- Node.js 22 or higher (for running the main worker)
- An ANTHROPIC_API_KEY for authenticating with Claude

## FAQ

### How do I install Docker?
You can install Docker by following the instructions on the official Docker website: https://docs.docker.com/get-docker/

### Why do I need Docker?
Docker protects your local environment from any potential prompt injection attacks by running the `claude` CLI tool inside a secure container. This ensures that any malicious input from the queue cannot affect your host system.

### How do I install Node.js?
You can install Node.js by following the instructions on the official Node.js website: https://nodejs.org/en/download/

### Do I need to log in to the `claude` CLI inside Docker?
No. The ANTHROPIC_API_KEY environment variable handles authentication automatically when passed to the container.

### How do I get an ANTHROPIC_API_KEY?
You can obtain an ANTHROPIC_API_KEY by signing up for an account on the Anthropic website and generating an API key in your account settings.

### Can I run the worker without Docker?
While it's technically possible to run the worker without Docker, it is not recommended due to security risks. Running the `claude` CLI directly on your host system can expose you to prompt injection attacks if the input from the queue is malicious. Docker provides an isolated environment that mitigates this risk.

But if you choose to run without Docker, update the `src/utils.ts` file to call the `claude` CLI directly instead of through Docker, and ensure you have the `claude` CLI installed, configured on your system, and you logged in it.