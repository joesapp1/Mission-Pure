# Scheduling the Water Watch Refresh (Windows Task Scheduler)

The `scripts/run-waterwatch.ps1` wrapper runs the refresh safely with execution-policy bypass.

## One-time steps
1. Open **Task Scheduler**.
2. Click **Create Basic Task...**
   - Name: `Mission Pure Water Watch`
   - Description: `Refresh water-watch.html via npm`
3. **Trigger** → choose Daily (or the cadence you want) → set start time (e.g., 6:00 AM).
4. **Action** → Choose **Start a program**.
   - Program/script: `powershell`
   - Add arguments: `-ExecutionPolicy Bypass -File "C:\Users\sappj\CascadeProjects\Mission-Pure\scripts\run-waterwatch.ps1"`
   - Start in: `C:\Users\sappj\CascadeProjects\Mission-Pure`
5. Finish the wizard. Check “Open the Properties dialog for this task when I click Finish” if you want to adjust additional settings (e.g., run whether user is logged on or not).
6. In Properties → General tab: select “Run with highest privileges” if desired.

## Test the task
- Right-click the new task → **Run**. Confirm it completes and `water-watch.html` updates.

## Notes
- The wrapper script handles `Set-ExecutionPolicy` and runs `npm run waterwatch:refresh` from the project root.
- Logs still go to the Task Scheduler history / Windows Event Viewer. For additional logging, redirect output inside `run-waterwatch.ps1` to a file (e.g., `| Out-File logs\waterwatch.txt -Append`).
