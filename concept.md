# Concept: Claude Queue Worker

We plan to create a new feature to Artus that allows users to generate an app for their project using all the data we've collected about their project so far. This will be a one-click process where users can simply click a button and we will generate an app for them using the Claude API.

## Assumptions:
Our end users are tech savvy and will be needing little to no hand holding in terms of setting up and using the Claude Queue Worker.

## Challenges:

1. Cost: The Claude API is expensive, and generating an app can require multiple calls to the API, which can quickly add up in cost.
2. Time: Generating an app can take a long time, especially if the project is large and complex. We don't want users to have to wait a long time for their app to be generated
3. Resource Intensive: The process of generating an app can be resource intensive, and we don't want to overload our servers with too many requests at once.

## Solution: Claude Queue Worker

1. Cost: To manage costs, we will be using the end-user's own Claude API key to make the API calls. This way, the cost of generating the app will be borne by the user, and we won't have to worry about managing costs on our end.
2. Time: To manage the time it takes to generate an app, we will implement a queue system. When a user clicks the button to generate an app, we will add a task to a queue in our database. We will then have a worker process that periodically checks the queue for new tasks and processes them one at a time. This way, users can continue to use the app while their app is being generated in the background, and they will be notified when their app is ready.
3. Resource Intensive: Our backend server is now only responsible for managing the queue and not making the actual API calls to Claude, which reduces the load on our servers. The worker process that handles the queue can be scaled independently based on demand.

# Internal Architecture

## Database:
We have created a new table in our database called `claude_task_queue` which has the following columns:
1. `id`: Primary key
2. `prompt`: The prompt to be sent to the Claude API for generating the app
3. `status`: The status of the task ('pending','in_progress','completed','failed')
4. `user_id`: The user identifier for whom the app is being generated
5. `session_id`: The project identifier for which the app is being generated
6. `shell_command_status`: The status of the shell command execution (i.e. Claude API call) for this task ('completed','failed')
7. `logs`: The output from the shell command execution (i.e. Claude API call) for this task
8. `errors`: The errors from the shell command execution (i.e. Claude API call) for this task
9. `created_at`: Timestamp for when the task was created
10. `updated_at`: Timestamp for when the task was last updated
11. `started_at`: Timestamp for when the task was started (when it was picked up by the worker)
12. `finished_at`: Timestamp for when the task was completed

## Repositories involved:

1. `claude-queue-worker`: The worker that processes the queue and interacts with the Claude API
2. `Autoship`: The backend server that manages the queue and provides the API for the worker to fetch tasks
3. `artus-frontend`: The frontend that allows users to trigger the app generation process and view the status of their app generation

### AutoShip Backend API Endpoints:

1. `GET /api/tasks/list`: Gets list of items in the `claude_task_queue` table
   - Can also be used to get for a particular user/project or all items in the queue
   - Only for debugging purposes, not used by the worker. Later can be integrated to the frontend to show the queue status for users/projects.
2. `POST /api/tasks/pending`: Adds a new item to the `claude_task_queue` table for a particular user/project with a prompt
   - Only for debugging purposes, not used by the worker.
   - To be only used by the backend internally for pushing new tasks
   - Later can be triggered by the frontend to allow users to manually begin app creation process.
3. `GET /api/tasks/pending`: Gets the next pending item for a particular user/project in the `claude_task_queue` table and marks it as "in_progress"
4. `POST /api/tasks/update`: Updates an item in the `claude_task_queue` table with the response from the Claude API and marks it as "completed"

### Usage in Claude Queue Worker:

1. The worker periodically calls `GET /api/tasks/pending` to fetch the next pending task for the user/project it is responsible for
2. If a pending task is found, the worker processes the task by sending the prompt to the Claude API using the `claude` CLI tool
3. Once the response is received from the Claude API, the worker calls `POST /api/tasks/update` to update the task in the `claude_task_queue` table with the response and marks it as "completed"

### Usage in Artus Frontend:
TBD but eventually frontend will be the trigger for adding tasks to the queue and will also show the status of the tasks in the queue for users/projects.