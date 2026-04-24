# Documentation Index

Use the links below to navigate project documentation:

- [Feature Concept](concept.md)
- [Worker Requirements](worker/requirements.md)
- [Worker Usage](worker/usage.md)
- [Worker Technical Explanation](worker/technical-explanation.md)

# Folder Structure

We follow a monorepo structure with the following folders:
1. `claude-queue-worker`: Contains the code for the worker that processes the queue and interacts with the Claude API.
2. `workspace`: Contains the code for the end-user's app that is being built. This is where we will be generating the app for the user based on the data we have collected about their project.
