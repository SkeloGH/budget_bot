# Budget bot
Send an email with your expenses and get a report

## USAGE
1. Create a gmail account solely for the purpose of this bot.

    I used this pattern: "finances.myname.mylast@gmail.com".

2. Go to https://developers.google.com/apps-script and login with this account.

    You may need to authorize at some point

3. Go to the script editor https://script.google.com

4. Create a blank project.

5. Paste the code below and save the project with whichever name you like.

6. Replace SOURCE_EMAIL value with the account created in (1), this is where we save the balance.

7. In the editor, click the 'clock' icon (project triggers).

8. Add a new trigger:

    - function to run : 'reportExpenses'
    - event type      : time-driven
    - interval type   : minutes
    - interval length : every minute

9. From your common account, send an email to (1):

    - subject : New expense
    - body    : 1 // how much you spent
    - if you want to increase budget use a negative value, like -100
    - you can add the concept for your own purposes, it won't affect. I prefer using parens, like: 15 (starbucks)

10. Within a minute you'll get your new balance.