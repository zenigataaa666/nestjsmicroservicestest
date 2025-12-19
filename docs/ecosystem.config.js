// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'auth-manager-grpc',
      script: './dist/apps/auth-manager/main.js',
      instances: 1, // gRPC : 1 instance par port
      exec_mode: 'fork', // fork (pas cluster pour gRPC)
      env: {
        NODE_ENV: 'production',
        AUTH_PORT: 3001,
        AUTH_GRPC_PORT: 50051,
      },
      error_file: './logs/auth-manager-error.log',
      out_file: './logs/auth-manager-out.log',
      max_memory_restart: '500M',
    },
    {
      name: 'manage-employees-grpc',
      script: './dist/apps/manage-employees/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        EMPLOYEES_PORT: 3002,
        EMPLOYEES_GRPC_PORT: 50052,
      },
      error_file: './logs/manage-employees-error.log',
      out_file: './logs/manage-employees-out.log',
      max_memory_restart: '800M',
    },
    {
      name: 'api-gateway-grpc',
      script: './dist/apps/api-gateway/main.js',
      instances: 2, // Peut être clustered
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/api-gateway-error.log',
      out_file: './logs/api-gateway-out.log',
      max_memory_restart: '1G',
    },
  ],
};