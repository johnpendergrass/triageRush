# A short history of Triage RUSH!

**Built 18 July – 11 August 2026. About three weeks, 57 commits.**

(note: this history.md file was created by claude to summarize development)

---

## The idea

Most medical games are diagnosis games: here are the symptoms, name the
disease. Triage is a different and less-told job. The nurse at the front of an
emergency department is not working out what is wrong with you — they are
deciding **how sick you are and how soon you need to be seen**, often in under
a minute, with a waiting room filling up behind them.

That decision is real, it is under time pressure, and it turns out to make a
good game.

## The shape it took

A few choices early on set everything that followed.

**It is phone-shaped everywhere.** The game lives in a single 9:16 frame,
whether you open it on a phone, a tablet or a 4K desktop. Triage happens
standing up with a device in one hand, and one honest layout beat three
compromised ones.

**A full waiting room is never your fault.** Nothing is deducted for patients
you never got to. The premise of the job is that there are always more people
than time, so the score measures the decisions you actually made — accuracy
first, speed as pace rather than as punishment.

**You can always change your mind.** Tapping an open door recalls that
patient so you can place them again. Real triage gets revisited; a game that
punished a corrected decision would be teaching the wrong instinct.

**No framework, no build step.** Plain HTML, CSS and JavaScript, served as
files. It loads fast, it will still run in ten years, and anyone curious can
read the whole thing.

## The parts that took the longest

**The patients.** 160 records, each with a complaint, vitals, something the
patient says in their own words, a triage note, and a defensible correct
answer. Writing a case that is *interesting* but still has one right room is
harder than it sounds — and a handful of them are deliberately the kind that
catch experienced people out.

**The artwork.** Every scene is composed in layers — the waiting-room wall,
the room behind the door, the patient standing in the doorway, then the door
itself, whose open frame does the reveal. Getting a patient to appear to stand
*in* a doorway rather than in front of it took more attempts than any code
in the project.

**The sound.** Every game sound is synthesised in the browser as you play,
rather than loaded as files — the ticks, the arrival tones, the bell at the
end of a shift. The background music went through several complete rebuilds,
including one metaphor that was cut entirely: for a while there was going to
be a boombox in the corner of the waiting room that you could walk over to
and switch on.

## Made with

Written by jp, with a great deal of help from Claude and
ChatGPT — design arguments, code, and a running written record of why each
decision went the way it did. The version footer inside the game says
`jp/claude/chatty`, which is the honest credit.

Released August 2026.

---

*Patients, charts and artwork are fictional. This is a game, not medical
training or advice.*
