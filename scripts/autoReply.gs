/**
 * Auto-reply script (Apps Script)
 * - Set `triggerLabelName` to the exact Gmail label you created.
 * - Paste this file into script.google.com or keep this copy in the repo as backup.
 */

function extractEmail(from) {
  var m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim().toLowerCase();
}

function autoReplyOnce() {
  // CHANGE this to exactly match your Gmail label (case-sensitive)
  var triggerLabelName = "autoreply";
  var doneLabelName = "AutoReplied";
  var me = Session.getActiveUser().getEmail().toLowerCase();

  var props = PropertiesService.getScriptProperties();
  var repliedJson = props.getProperty('repliedSenders') || '{}';
  var replied = {};
  try { replied = JSON.parse(repliedJson); } catch(e){ replied = {}; }

  var triggerLabel = GmailApp.getUserLabelByName(triggerLabelName);
  if (!triggerLabel) return;

  var threads = triggerLabel.getThreads(0, 50);
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];

    // if already processed, clean up label and skip
    if (thread.getLabels().some(function(l){ return l.getName() === doneLabelName; })) {
      thread.removeLabel(triggerLabel);
      continue;
    }

    var messages = thread.getMessages();
    var last = messages[messages.length - 1];
    var sender = extractEmail(last.getFrom());

    // don't reply to yourself
    if (sender === me) { thread.removeLabel(triggerLabel); continue; }

    // already replied to this sender before?
    if (replied[sender]) {
      thread.addLabel(doneLabelName);
      thread.removeLabel(triggerLabel);
      continue;
    }

    var replyText = "Thanks for sending us a message — we will reply to you shortly.";
    thread.reply(replyText);

    // record that we've replied to this sender
    replied[sender] = new Date().toISOString();
    props.setProperty('repliedSenders', JSON.stringify(replied));

    thread.addLabel(doneLabelName);
    thread.removeLabel(triggerLabel);
  }

  // Optional: prune entries older than 12 months
  var cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  var changed = false;
  Object.keys(replied).forEach(function(s){ if (new Date(replied[s]) < cutoff) { delete replied[s]; changed = true; }});
  if (changed) props.setProperty('repliedSenders', JSON.stringify(replied));
}

// Run this manually to clear the list of senders (so replies will be sent again)
function resetRepliedSenders() {
  PropertiesService.getScriptProperties().deleteProperty('repliedSenders');
}
