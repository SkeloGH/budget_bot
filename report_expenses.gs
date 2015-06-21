/***** USAGE *****
  1. Create a gmail account solely for the purpose of this bot,
    I used this pattern: "finances.myname.mylast@gmail.com"
  2. Go to https://developers.google.com/apps-script and login with this account
    You may need to authorize at some point
  3. Go to the script editor https://script.google.com
  4. Create a blank project
  5. Paste the code below and save the project with whichever name you like
  6. Replace SOURCE_EMAIL value with the account created in (1), this is where we save the balance
  7. In the editor, click the 'clock' icon (project triggers)
  8. Add a new trigger:
    function to run - 'reportExpenses'
    event type      - time-driven
    interval type   - minutes
    interval length - every minute
  9. From your common account, send an email to (1):
    - subject: New expense
    - body   : - if you want to increase budget use a negative value, like -100
               - if you want to register a new expense, just put the positive number
               - you can add the concept for your own purposes, I prefer using parens, like: 15 (starbucks)
  10. within a minute you'll get your new balance
****************/
var SOURCE_EMAIL    = "finances.yourname.yourlastname@gmail.com";
var BALANCE_SUBJECT = "New balance";
var THREAD_SUBJECT  = "New expense";
var REPORT_SUBJECT  = "Your expense report is here!";
var threads;

function reportExpenses() {
  var lastBalance, lastExpense, expensesTotal, hasExpenses, newBalance, reportConfig;

  threads        = GmailApp.getInboxThreads();
  expensesTotal  = 0;
  hasExpenses    = false;

  for (var i = 0; i < threads.length; i++) {
    if (subjectMatches(threads[i], THREAD_SUBJECT)) {
      var recipient   = getLastSender(threads[i]);
      var expenses    = getExpensesFromThread(threads[i]);

      if (expenses && expenses.length > 0){
        lastExpense = expenses[expenses.length - 1];
        hasExpenses = true;

        expenses.forEach(function(expense){
          expensesTotal += expense;
        });
      }
    }
  }

  if (hasExpenses) {
    lastBalance    = getBalance();
    newBalance     = lastBalance - expensesTotal;
    reportConfig   = {
      recipient     : recipient,
      expensesTotal : expensesTotal,
      lastBalance   : lastBalance,
      newBalance    : newBalance
    };
    sendExpenseReport(reportConfig);
    saveBalance(newBalance);
  }
};

function getExpensesFromThread(thread){
  var expenses       = [];
  var threadMessages = thread.getMessages();

  for (var j = 0; j < threadMessages.length; j++){
    var threadMessage = threadMessages[j];
    var expenseValue  = getValueFromMessage(threadMessage);
    if (threadMessage.isUnread()){
      threadMessage.markRead();
      expenses.push(expenseValue);
    }
  }
  return expenses;
};

function getBalance(){
  var lastBalance = 0;

  for (var i = 0; i < threads.length; i++) {
    if (subjectMatches(threads[i], BALANCE_SUBJECT)) {
      var balances      = getBalancesFromThread(threads[i]);
      if (balances.length > 0){
        lastBalance = balances[0];
      }
    }
  }
  return lastBalance;
};

function getBalancesFromThread(thread){
  var balances       = [];
  var threadMessages = thread.getMessages();

  for (var j = 0; j < threadMessages.length; j++){
    var threadMessage = threadMessages[j];
    if (threadMessage.isInInbox()){
      var balanceValue  = getValueFromMessage(threadMessage);

      threadMessage.moveToTrash();
      balances.push(balanceValue);
    }
  }
  return balances;
};

function sendExpenseReport(config){
  var c             = config;
  var reportSubject = REPORT_SUBJECT;
  var reportBody    = "Total expenses: $" + c.expensesTotal + " \nBefore expenses: $" + c.lastBalance + " \nNew balance: $" + c.newBalance;

  MailApp.sendEmail(c.recipient, reportSubject, reportBody);
}

function saveBalance(balance){
  MailApp.sendEmail(SOURCE_EMAIL, BALANCE_SUBJECT, balance);
};

/******************
  shared functions
******************/

function subjectMatches(thread, subject){
  var isValid             = false;
  var firstMessageSubject = thread.getFirstMessageSubject();
  if (thread.getMessageCount() > 0 && firstMessageSubject === subject) {
    isValid = true;
  }
  return isValid;
};

function getLastSender(thread){
  var messages    = thread.getMessages();
  var lastMessage = messages[messages.length - 1];
  var lastSender  = lastMessage.getFrom()
  return lastSender;
};

function getValueFromMessage(threadMessage){
  var value  = parseInt(threadMessage.getPlainBody(), 10);
  if (isNaN(value) === true){
    value = 0;
  }
  return value;
};