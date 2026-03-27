# How to use Claude Queue Worker

1. Ensure ./requirements.md is satisfied (Node.js 22+, `claude` CLI tool v2.1+ installed and logged in)
2. Clone this repository and navigate to the project directory
3. Install dependencies by running `npm install`
4. Create a `.env` file in the root of the project using the provided `.env.example` as a template
5. Start the worker by running `npm run dev`
6. The worker will listen for tasks in the queue and process them using the `claude` CLI tool.
7. You can close the worker by pressing `Ctrl + C` in the terminal.
