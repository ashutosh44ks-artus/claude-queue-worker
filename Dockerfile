FROM node:20-slim

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Create non-root user
RUN useradd -m claudeuser

# Set workspace
WORKDIR /workspace

# Give ownership to user
RUN chown -R claudeuser:claudeuser /workspace

# Switch to non-root user
USER claudeuser

CMD ["bash"]