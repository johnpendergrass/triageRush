There are some more design changes to incorporation into the game specs and design.

GAME DESIGN

1. There will be two game modes - Triage, and TriageRUSH.  (supplanting edu, game)
   
2. There will be two scoring modes - Strict, and Forgiving (supplanting the three modes in the current specs)
   
   1. Strict mode will require correct room and have no 'close' score.  For special rooms either the assigned special room (psych, discharge) or the assigned ESI room will be 'correct'.  Full points.
   
   2. Forgiving mode will allow either over-triaging or under-triaging one level.  Same as existing. Half points.

3. Each 'round' will now be called a 'shift' in keeping with medical staff jargon.

4. Here are some more details on game modes and scoring:
   
   1. Triage - will essentially replace the EDU mode.  It will have a timer, which is the time in a 'shift'.  It should be a default of 300 seconds, changeable in settings. The timer is simply to give an end time for the 'shift' and give the player an 'end-shift' to stop playing.  Setting options should include the default (300), and a 'no-timer' option.  In the 'no-timer' option there would be no timer (maybe the timer UI in the game should instead show elapsed time?  Consider.)  My concern is that with no-timer we need to add a separate control to 'end-shift' the game.  Since the bottom area still needs the 'return to home', 'coach' and 'stats/review' buttons, I'm not sure to put that in a meaningful way.  Think about it.  The timer itself could be a 'end-shift' button?  Maybe a little button right under the timer button, overlayed on the top of the patient image?  That would be an 'end-shift' button in the Triage version, and a 'Pause/Restart' in the TriageRUSH version?  
   
   Triage will not keep a 'score' per se, but will keep statistics for each shift.  I would like to consider an option to keep 'lifetime' stats as well?  That would have a 'clear lifetime' stats button in settings.  Lifetime stats would be kept on a per user name basis (ie. JEP is different from AHP, etc).  The lifetime clearing should be of the current named player.  
   
   The COACH popup will be available for the player once a patient has been assigned to a room, is still in that room, and the room door is open, but not while a patient is in the patient panel.  
   
   In Triage mode the game will start with the waiting room fully occupied (five patients), and the waiting room will stay filled the entire time (ie. will have five patients in the queue all the time, plus up to one in the patient panel)
   
   2. TriageRUSH - will be the new and only 'game' mode.  It will have a settings selected 60/120 second shift timer (configurable from the settings).  RUSH mode will start with only two patients in the waiting room.  As the timer progressed new patients will be added at an increasing pace.  My starting idea there is -- the queue starts with two patients, and then the queue lenght is increased by one after an interval of 10 seconds, then increased by one more at an interval of 9 seconds, then another one at an interval of 8 seconds... etc.  until the queue has 10 patients.  The idea is to simulate a rapidly filling waiting room.  These times are not firm, but just first educated guesses.

        There will be actual scoring during RUSH mode.  A correct room is full points, a close room is half points - See item #2 above for the new scoring method.   

        RUSH mode will also track the # of patients seen, correct, close, wrong; same as regular Triage mode.  All these various scores and such will be available on the STATS/REVIEW panel during or after a shift.

        The timer needs to be a UI element in the top banner.  So I would suggest modifying the look of the top banner to show:  1. game name (ie. the mode, just 'Triage!" for Triage mode, 'Triage RUSH!' for the RUSH game); 2. the timer - which should be centered - for the Triage mode it can be subdued and contained in the banner space, for RUSH mode it should be more prominent and can creep into the patient image - it should be obvious in other words; 3. the right side should have a summary of the 'score' - for Triage mode "<correct #>/<close #>/<wrong #>", for RUSH mode just the total score: "score: 1000". 

        We might also put a button just below the timer button in RUSH mode - it would be similar to the 'End-Shift' button in Triage mode, but instead would control 'Pause/Restart'.  The button would be superimposed near the top of the patient image.  We need to consider this.

        Each time there is a decision by the player there should be a sound and visual.  1. for correct 'ding' + bold green outline around the correct room.  2. for close 'bing' (and a bold yellow around the close room.) 3. for wrong 'buzz' and a bold red around the wrong room.  No highlighting of the 'correct' room (this is a change from now).  The highlighting should stay in place for several seconds.

   3. Both game modes will track below, and show these in the STATS/REVIEW panel..  which we will now call and display as 'Shift Review'.
      1.  total patients seen -- those that were actually assigned to a room during the session, if a patient is recalled and re-assigned to a room again it only counts as one patient
      2. total patients assigned to correct room - those assigned originally to the correct room, not recalled and reassigned.
      3. total patients assigned to over-triaged room - those assigned originally to the an over-triaged room, not recalled and reassigned.
      4. total patients assigned to an under-triaged room - those assigned originally to an under-triaged room, not recalled and reassigned.
      5. total patients assigned to wrong room - those assigned originally to the wrong room, not recalled and reassigned.

        The STATS/REVIEW panel should be structured as follows:

            1. Title with <game mode> SUMMARY
            2. <title> <player ID>.  Your shift on Wednesday, July 17, 2026, starting at 3:23 PM.
            3. Your shift was <timer> seconds.
            4. You saw <total patients> during your shift.
            5. You assigned <correct patients> to the correct room.
            6. You over-triaged <over-triaged> patients.
            7. You under-triaged <under-triaged> patients.
            8. You assigned <wrong> patients to an incorrect room.
   
            9. You had <patients in waiting room at end of shift> patients waiting in the Waiting Room at the end of your shift.
               
            10. IF A RUSH GAME, then
                   1. Patients assigned to correct room:  <patients correct> * <100> points each = 600 points
                   2. Patients assigned to close rooms:    <patients close> * <50> points each = 300 points
                   3. Patients assigned to an incorrect room: <patients wrong> * <-50> points each = -200 points.
                   4. Patients left in waiting room: <patients in waiting room> * <-10> points each = -100 points.
                   5. Total score = 600 points.  A new personal best!
                   6. Your average time per patient was (total patients seen / timer) seconds.

                   7. Then a of their historical results -- maybe a scrolling list, by date?  showing total points and average time?
   
                   8. There should next be a button at the bottom to review all the patients seen during the shift.  It might be easy to do, just a non-interactive scrolling list of seen patients in the last shift.  It would give the image, quote, triage notes, vitals, diagnosis notes, correct room, ESI level info (ie why, notes, diagnosis), correct assigned room(s), player assigned room, and a CORRECT/CLOSE/INCORRECT indication.  A popup would appear, similar to the coaching panel, showing that info.  Forward/back arrows at the top to move from patient to patient.  A close box at the top.  Same scrolling effects as the coach panel.

    4. The HOME/SETTINGS panel.
       1. we just deigned the look and feel of the HOME panel.  The controls on the HOME panel are two sets of settings, displayed as two sidewalk signs; a front door with options of Start Shift, Resume Shift and open doors; an ABOUT button, displayed as a cover to a water spinkler system; and a sound control, displayed as a boombox.
          1. The left signboard will be player name settings.  It will display "Welcome - ready to start your shift?".
             1. then have a 'title' control that allows the player to select between - Doctor (default), Nurse, RN, LPN, RES, EMS, PA, MS1, MS2, MS3, MS4.   The control will be those old style arcade game rolling odometer type displays, with up/down arrows just above and below the display.  In this case the entire word is the choice - and the odometer rolls from choice to choice.
             2. then there will be a three character odometer for patient initials - upper case alpha only.  Arrow keys above and below each character.
             3. At some point the title and the player 'name' must be copied to the local variable and to local storage for the current player, so that it is useful later in the game.
          2. The right signboard will be game control settings.  It will display "Shift Settings" at the top.  then...
             1. the prefix "Mode:" then a toggle switch with 'Triage' on the left, 'RUSH' on the right.  Game mode selector.
             2. the prefix "Difficulty:" then a toggle switch with 'Strict' on the left, 'Forgiving' on the right.  Strictness selector.
             3. the prefix "Shift Length:" then timer buttons (below that prefix, centered in the horizontal space),  What button values are displayed is context dependent on the 'Game Mode' above.  The buttons themselves need no title, just the button text is sufficient.
                1. if 'Triage' Mode then two buttons with '300' (default) and 'No Timer' (which sets the game timer display to '---')
                2. if 'RUSH' Mode then 60 second (default) and 120 seconds.
             4. At the bottom a prefix of "UI Hints?" and a checkbox on/off.  This is to allow the player to choose whether to display the UI hints on what is available to click.
          3.

