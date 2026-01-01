# Admin Login Credentials

## Default Admin Account

**Username:** `admin`  
**Password:** `BiznesYordam2024!`  
**Email:** `admin@biznesyordam.uz`

## Important Notes

- Admin user is automatically created on server startup if it doesn't exist
- The password is hashed using bcrypt before storage
- Admin credentials are logged to console on first creation
- For production, change the default password immediately after first login

## Server Initialization

The admin user is created by the `initializeAdmin()` function in `server/initAdmin.ts`, which runs automatically when the server starts.

## Security

⚠️ **IMPORTANT:** Change the default password in production environments!

