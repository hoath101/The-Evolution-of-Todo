# Python Environment Setup

This project uses UV for Python package management and virtual environment creation.

## Prerequisites

- Python 3.11+
- UV package manager installed

## Setup

1. Create a virtual environment:
   ```bash
   uv venv
   ```

2. Activate the virtual environment:
   - On Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```
   - On Windows:
     ```bash
     .venv\Scripts\activate
     ```

3. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```

## Managing Dependencies

- To add a new dependency:
  ```bash
  uv pip install package_name
  uv pip freeze > requirements.txt
  ```

- To update dependencies:
  ```bash
  uv pip install --upgrade package_name
  uv pip freeze > requirements.txt
  ```

## Running the Application

With the virtual environment activated:

```bash
# Run the main application
uvicorn src.main:app --reload --port 8000

# Run the MCP server
python -m src.services.mcp_server
```