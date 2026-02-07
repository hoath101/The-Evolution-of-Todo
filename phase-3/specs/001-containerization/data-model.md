# Data Model: Phase IV – Containerization for Todo AI Chatbot

## Overview
Data model for containerized services architecture of the Todo AI Chatbot application. This document describes the entities, configurations, and relationships required for containerized deployment while maintaining original application functionality.

## Container Configuration Models

### 1. Docker Image Configuration

#### Backend Image Configuration
- **Entity**: BackendImageConfig
- **Fields**:
  - base_image: string (python:3.11-slim)
  - dependencies_file: string (requirements.txt)
  - source_directory: string (backend/src/)
  - entry_point: string (src/main.py)
  - exposed_port: integer (8000)
  - environment_variables: object
    - DATABASE_URL: string (PostgreSQL connection string)
    - BETTER_AUTH_URL: string (Auth service URL, default: http://auth:4000)
  - working_directory: string (/app)
  - build_context: string (./backend)

#### Frontend Image Configuration
- **Entity**: FrontendImageConfig
- **Fields**:
  - base_image: string (node:20-alpine)
  - dependencies_file: string (package.json)
  - source_directory: string (frontend/)
  - entry_point: string (next start)
  - exposed_port: integer (3000)
  - environment_variables: object
    - NEXT_PUBLIC_API_BASE_URL: string (Backend service URL, default: http://backend:8000)
    - NEXT_PUBLIC_BETTER_AUTH_URL: string (Auth service URL, default: http://auth:4000)
  - working_directory: string (/app)
  - build_context: string (./frontend)

#### Auth Service Image Configuration
- **Entity**: AuthServiceImageConfig
- **Fields**:
  - base_image: string (node:20-alpine)
  - dependencies_file: string (package.json in better-auth-service/)
  - source_directory: string (better-auth-service/)
  - entry_point: string (server.js)
  - exposed_port: integer (4000)
  - environment_variables: object
    - DATABASE_URL: string (PostgreSQL connection string)
    - BETTER_AUTH_SECRET: string (JWT secret)
    - BETTER_AUTH_URL: string (Self URL, default: http://auth:4000)
  - working_directory: string (/app)
  - build_context: string (./better-auth-service)

## Container Orchestration Models

### 2. Docker Compose Service Definition

#### Service Network Configuration
- **Entity**: ServiceNetworkConfig
- **Fields**:
  - network_name: string (todo-ai-network)
  - driver: string (bridge)
  - internal: boolean (false)
  - ipam_config: object (optional IP configuration)

#### Individual Service Configuration
- **Entity**: ServiceConfig
- **Fields**:
  - service_name: string (backend|frontend|auth)
  - image: string (service-specific image name)
  - build: object (build configuration if building from Dockerfile)
  - ports: array of objects (port mappings)
    - published: integer (external port)
    - target: integer (internal port)
    - protocol: string (tcp|udp)
  - environment: object (environment variables for the service)
  - depends_on: array of strings (services this service depends on)
  - healthcheck: object (health check configuration)
    - test: array of strings (command to run for health check)
    - interval: string (time between checks, e.g., "30s")
    - timeout: string (timeout for each check, e.g., "10s")
    - retries: integer (number of retries before marking unhealthy)
    - start_period: string (time to wait before starting checks, e.g., "40s")
  - networks: array of strings (networks to connect to)
  - restart: string (restart policy, e.g., "unless-stopped")

### 3. Environment Configuration Model

#### Environment Variable Definitions
- **Entity**: EnvVarDefinition
- **Fields**:
  - name: string (variable name)
  - service: string (which service uses this variable)
  - purpose: string (what the variable is used for)
  - required: boolean (whether the variable is mandatory)
  - default_value: string (default value if not provided)
  - example_value: string (example of proper format)

**Backend Environment Variables:**
- DATABASE_URL
  - service: backend, auth
  - purpose: PostgreSQL database connection
  - required: true
  - default_value: none
  - example_value: postgresql://user:password@host:port/dbname

- BETTER_AUTH_URL
  - service: backend
  - purpose: URL of auth service for proxy requests
  - required: true
  - default_value: http://auth:4000
  - example_value: http://auth:4000

**Frontend Environment Variables:**
- NEXT_PUBLIC_API_BASE_URL
  - service: frontend
  - purpose: URL of backend API for client-side requests
  - required: true
  - default_value: http://backend:8000
  - example_value: http://backend:8000

- NEXT_PUBLIC_BETTER_AUTH_URL
  - service: frontend
  - purpose: URL of auth service for client authentication
  - required: true
  - default_value: http://auth:4000
  - example_value: http://auth:4000

**Auth Service Environment Variables:**
- BETTER_AUTH_SECRET
  - service: auth
  - purpose: Secret key for JWT token signing
  - required: true
  - default_value: none
  - example_value: "super-secret-change-in-production"

- BETTER_AUTH_URL
  - service: auth
  - purpose: Self-referencing URL for auth service
  - required: true
  - default_value: http://auth:4000
  - example_value: http://auth:4000

## Container Volume Models

### 4. Volume Configuration

#### Persistent Volume Configuration
- **Entity**: VolumeConfig
- **Fields**:
  - volume_name: string (identifier for the volume)
  - mount_path: string (path inside container)
  - host_path: string (path on host, if bind mount)
  - driver: string (volume driver, e.g., local, aws, gcp)
  - options: object (driver-specific options)
  - type: string (volume type: volume|bind|tmpfs)

*Note: For this application, no persistent volumes are required as all data is stored in the external Neon PostgreSQL database.*

## Container Network Models

### 5. Service Communication Configuration

#### Internal Communication Model
- **Entity**: ServiceCommunication
- **Fields**:
  - source_service: string (service initiating communication)
  - target_service: string (service receiving communication)
  - protocol: string (HTTP/HTTPS)
  - port: integer (target port)
  - hostname: string (target hostname - typically service name)
  - path_prefix: string (URL path prefix if needed)
  - authentication_required: boolean (if auth is needed for this communication)

**Communication Flows:**
1. frontend → backend
   - protocol: HTTP
   - port: 8000
   - hostname: backend
   - path_prefix: /api
   - authentication_required: varies by endpoint

2. frontend → auth
   - protocol: HTTP
   - port: 4000
   - hostname: auth
   - path_prefix: /api/auth
   - authentication_required: false (this is auth service)

3. backend → auth
   - protocol: HTTP
   - port: 4000
   - hostname: auth
   - path_prefix: /api/auth
   - authentication_required: false (internal proxy)

## Container Health Model

### 6. Health Check Configuration

#### Service Health Check Model
- **Entity**: HealthCheckConfig
- **Fields**:
  - service_name: string (name of the service)
  - endpoint: string (health check endpoint)
  - method: string (HTTP method: GET, POST, etc.)
  - expected_status: integer (expected HTTP status code)
  - request_body: object (body for POST/PUT requests, if needed)
  - headers: object (HTTP headers to send)
  - success_threshold: integer (number of successful checks to be healthy)
  - failure_threshold: integer (number of failed checks to be unhealthy)

**Backend Health Check:**
- endpoint: /
- method: GET
- expected_status: 200
- success_threshold: 1
- failure_threshold: 3

**Frontend Health Check:**
- endpoint: /
- method: GET
- expected_status: 200
- success_threshold: 1
- failure_threshold: 3

**Auth Service Health Check:**
- endpoint: /
- method: GET
- expected_status: 200
- success_threshold: 1
- failure_threshold: 3

## State Management Models

### 7. Application State Configuration

#### Container State Configuration
- **Entity**: ContainerStateConfig
- **Fields**:
  - service_name: string (name of the service)
  - restart_policy: string (when to restart the container)
  - max_attempts: integer (max restart attempts for on-failure policy)
  - update_config: object (configuration for rolling updates)
    - parallelism: integer (number of containers updated simultaneously)
    - delay: string (time between updates)
    - failure_action: string (pause|continue|rollback)
    - monitor: string (time to monitor for failures)
  - rollback_config: object (configuration for rollbacks)
    - parallelism: integer (number of containers rolled back simultaneously)
    - delay: string (time between rollbacks)
    - failure_action: string (pause|continue)

**Default Restart Policies:**
- backend: unless-stopped
- frontend: unless-stopped
- auth: unless-stopped

## Resource Configuration Models

### 8. Resource Allocation Configuration

#### Container Resource Limits
- **Entity**: ResourceLimits
- **Fields**:
  - service_name: string (name of the service)
  - cpu_limits: object
    - limit: string (CPU limit, e.g., "1.0" for 1 core)
    - reservation: string (CPU reservation, e.g., "0.5" for 0.5 core)
  - memory_limits: object
    - limit: string (memory limit, e.g., "512M" for 512 MB)
    - reservation: string (memory reservation, e.g., "256M" for 256 MB)
  - pid_limits: integer (process ID limits, if needed)
  - ulimits: object (various system limits)

*Note: For development, no specific resource limits are set as these services are lightweight and resource usage is minimal.*

## Security Configuration Models

### 9. Container Security Configuration

#### Security Context Configuration
- **Entity**: SecurityContext
- **Fields**:
  - service_name: string (name of the service)
  - run_as_user: integer (UID to run the process as)
  - run_as_group: integer (GID to run the process as)
  - fs_group: integer (GID for volume permissions)
  - privileged: boolean (whether container runs in privileged mode)
  - readonly_rootfs: boolean (whether root filesystem is read-only)
  - allow_privilege_escalation: boolean (whether processes can gain more privileges)
  - capabilities: object (Linux capabilities to add or drop)

*Note: For this application, containers will run with default security settings as no special security requirements were identified.*

## Configuration Validation Models

### 10. Configuration Validation Rules

#### Validation Rule Configuration
- **Entity**: ValidationRule
- **Fields**:
  - rule_name: string (name of the validation rule)
  - target_entity: string (entity being validated)
  - validation_type: string (format|range|dependency|security)
  - condition: string (condition that must be met)
  - error_message: string (message to show if validation fails)

**Validation Rules:**
1. Database URL Format
   - target_entity: DATABASE_URL
   - validation_type: format
   - condition: Must be a valid PostgreSQL connection string
   - error_message: DATABASE_URL must be a valid PostgreSQL connection string format

2. Service Communication Port
   - target_entity: ServicePort
   - validation_type: range
   - condition: Must be between 1 and 65535
   - error_message: Port numbers must be between 1 and 65535

3. Required Environment Variables
   - target_entity: EnvVarDefinition
   - validation_type: dependency
   - condition: All required variables must be defined
   - error_message: Required environment variables are missing

4. Unique Service Names
   - target_entity: ServiceConfig
   - validation_type: format
   - condition: Service names must be unique
   - error_message: Duplicate service names are not allowed