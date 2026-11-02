# Little Dose

A single-person, mobile-first medicine routine tracker. It runs as a static web app, stores its data in the current browser on the current device, and needs no account or server database.

## Open and install

The live app is hosted on GitHub Pages. On iPhone, open it in Safari, tap **Share → Add to Home Screen**, then launch the added app. The app shell can work offline after it has been cached from an HTTPS visit.

## Features

- Add medicines with amount/instructions, notes, a time, and selected weekdays.
- A daily checklist with per-day taken marks and a progress summary.
- Past checklists, with medicine names and instructions saved as snapshots for each day the app is opened.
- Dark mode, time-based greetings, and a daily encouragement selected without repeats until the quote collection cycles.
- A small animated capybara companion.
- Export a JSON backup from History or Privacy & reminders.
- Optional in-app/browser reminders when the app is open and in the foreground.

## Reminder limits

This static version cannot guarantee alerts while iOS has suspended or closed the app. Background scheduled iPhone alerts require an iOS app with native scheduling or a server-backed push service. Keep using iPhone Clock/Reminders or a clinician-approved reminder as a backup.

## Privacy and medical scope

Medicine names, routine settings, quotes, and taken history are stored in local storage in that browser. They do not sync to another device. Anyone with access to the unlocked device and browser profile may see them; clearing site data removes the records, so export a backup if needed. The app does not provide medical advice, calculate doses, validate prescriptions, or share data. Enter the schedule exactly as her clinician or pharmacist prescribed.
