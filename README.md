# Little Dose

A single-person, mobile-first medicine routine tracker. It runs as a static web app, stores its data in the current browser on the current device, and needs no account or server database.

## Open it

For a quick preview, open `index.html` in a browser. For the installable Home Screen experience and offline app shell, serve this folder over HTTPS (or localhost while developing). On iPhone, open the HTTPS page in Safari, tap **Share → Add to Home Screen**, then launch the added app. The app has no user accounts, cloud sync, or sharing.

## What it does

- Add medicines with a time, amount/instructions, optional note, and selected weekdays.
- See today’s list, mark a dose taken, and filter taken versus remaining items.
- Save the routine and the daily taken log in browser local storage.
- Work offline after the app shell has been cached from an HTTPS visit.

## Reminder limits

The app shows the scheduled time and the remaining plan, but this static version does not schedule background notifications. iOS web notifications require an installed Home Screen web app and user permission; delivering future alerts after iOS suspends the app also requires a push service and server-side scheduling. Do not rely on this prototype as the only reminder. Keep using the iPhone Clock/Reminders app or a clinician-approved medication reminder until a real notification service is added and verified on her phone.

## Privacy and medical scope

Medicine names and taken history are stored in local storage in that browser. Anyone with access to the unlocked device and browser profile may see them; clearing site data removes the records. The app does not provide medical advice, calculate doses, validate prescriptions, or share data. Enter the schedule exactly as her clinician or pharmacist prescribed.
