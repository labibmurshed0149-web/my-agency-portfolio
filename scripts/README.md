AutoReply Bot — setup instructions
===============================

Files:
- `autoReply.gs` — Apps Script source (this repo copy)

Quick setup (one-time, in your Google account):

1) Open Apps Script
- Go to https://script.google.com and click **New project**.

2) Paste the script
- Open `Code.gs` in the editor, replace its contents with the contents of `autoReply.gs` (or copy from this repo).
- Edit the `triggerLabelName` variable if your Gmail label is different (it is case-sensitive).

3) Save and run once
- Click the project title to name it (e.g. "AutoReply Bot").
- Select function `autoReplyOnce` and click **Run**.
- Authorize the app when prompted. If you see "Google hasn't verified this app", click **Advanced** → **Go to <project> (unsafe)** and continue to grant permissions for your account.

4) Add a trigger to run automatically
- Click **Triggers** (clock icon) → **Add Trigger**.
- Function: `autoReplyOnce`
- Event source: Time-driven
- Type: Minutes timer → Every 5 minutes (or your preferred interval)
- Save the trigger.

5) Test
- From another email account send a message that matches your Gmail filter (the filter must apply the label you set in `triggerLabelName`).
- Wait for the trigger or run `autoReplyOnce` manually.
- Confirm the sender receives the message and the thread gets the `AutoReplied` label.

Maintenance & notes:
- To reset replied senders (so the bot replies again), run `resetRepliedSenders` manually in Apps Script.
- Avoid replying to mailing lists or no-reply addresses by adding exclusions in your Gmail filter.
- This script stores replied senders in Script Properties under `repliedSenders`.

If you want, I can change the script to expire replies after N days (default: 12 months). Reply which N you prefer.
