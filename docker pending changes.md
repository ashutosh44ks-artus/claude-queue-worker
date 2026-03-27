# Lassi

    // we need to run this instead
// follow https://chatgpt.com/c/69c6299d-9824-8322-8b2e-63b02cc95148

  //     docker run --rm \
  // -e ANTHROPIC_API_KEY=my_key \
  // -v $(pwd)/workspace:/workspace \
  // -w /workspace \
  // claude-queue \
  // claude \
  // -p "Create a sample.md file with content " \
  // --allow-dangerously-skip-permissions \
  // --dangerously-skip-permissions


  const safePrompt = `${prompt}\n\nNote: You may only read/write files inside ${PROJECT_PATH}. Do not access parent directories or system files. If a task requires accessing anything outside, refuse.`;