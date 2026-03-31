# Timely

Simple timer+alarm web app.


## How the code works

- `status(msg, err)`  
  - Updates the status paragraph text.
  - Uses `.error` class if `err` is true.

- `button()`  
  - Returns the main submit button element.

- `action(state)`  
  - Changes button label + colors for:
    - `idle`: Set Timer / Save Alarm
    - `running`: Check Time
    - `ringing`: Stop Alarm

- `play()`  
  - Starts alarm sound looping.
  - Sets ringing state.
  - If playback is blocked, shows error text.

- `stop()`  
  - Stops sound and reset loop.
  - Sets status to “Alarm stopped.”

- `parseTime(h, m, s)`  
  - Validates hour/minute/second ranges.
  - Returns `{h, m, s}` or `null`.

- `timer(ms)`  
  - Starts countdown for given milliseconds.
  - Updates status and schedules alarm sound.

- `stopTimer()`  
  - Cancels countdown and clears timer state.

- `alarm(date)`  
  - Schedules a clock alarm at a future date/time.
  - Turns into sound when reached.

- `stopAlarm()`  
  - Cancels the scheduled alarm.

- `remaining()`  
  - Shows remaining time for timer/alarm.
  - If reached, triggers sound.

- `handleForm(e)`  
  - Called by form submit.
  - If ringing: stop alarm.
  - If running: show remaining time.
  - Otherwise: set timer/alarm from input values.

- `boot()`  
  - Sets up event listeners on page load.
  - Chooses mode (timer or alarm).
  - Sets initial button text.
