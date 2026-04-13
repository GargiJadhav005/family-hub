@echo off
REM Windows PowerShell script to complete backend migration
REM Converts backend-js to backend (final switchover)

echo.
echo ================================
echo  Backend Migration (Windows)
echo ================================
echo.

REM Check if backend-js exists
if not exist "backend-js" (
    echo ERROR: backend-js folder not found!
    exit /b 1
)

echo [1/3] Verifying backend-js folder... OK
echo.

REM Backup old backend (optional but safe)
if exist "backend" (
    echo [2/3] Backing up old backend to backend-ts-backup...
    move backend backend-ts-backup
    echo        Backup created
) else (
    echo [2/3] No existing backend folder to backup
)

echo.

REM Rename backend-js to backend
echo [3/3] Migrating backend-js to backend...
move backend-js backend

if exist "backend" (
    echo        Migration successful!
) else (
    echo ERROR: Migration failed!
    exit /b 1
)

echo.
echo ================================
echo  MIGRATION COMPLETE!
echo ================================
echo.
echo Next steps:
echo   1. cd backend
echo   2. npm start ^(to test^)
echo.
echo For production deployment to Render:
echo   1. Commit: git add . ^&^& git commit -m "Migrate: Convert TS backend to JS"
echo   2. Push: git push origin main
echo   3. Render will auto-deploy using Procfile
echo.
