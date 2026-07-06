Christian Pierre - Goal & Career Tracker
=========================================

HOW TO OPEN
-----------
Option A (simplest): Double-click index.html — opens in your browser.
Option B (server):   Open a terminal in this folder and run:
                       python serve.py
                     Then go to http://localhost:3400

TABS
----
Tasks         - 28 pre-loaded action items (Urgent / High / Ongoing). Check off
                items as you complete them. Add your own with the "+ Add task" button.
Projects      - 6 portfolio projects with status tracking.
Certifications- 8 certs assessed against your goals (recommended / defer / skip).
Network       - 22 LinkedIn prospects (QuestBridge, RSI, SAMS, MOSTEC).
                Track who you've contacted, who connected, who didn't respond.
Applications  - Application log. IDT posting pre-loaded. Add new ones.
Skill Gaps    - 9 gaps from the IDT gap analysis, color-coded by severity.
Scholarships  - 21 scholarships, grants, and fellowships organized by tier:
                Federal, NJ State, MCCC Foundation, National, Black Heritage,
                Latino Heritage, and STEM/Defense. Each entry has amount, deadline,
                eligibility, notes, and a status tracker (not started through awarded).
                Filter by category and apply-when stage. Sorted by priority (critical at top).
Internships   - 17 internship and program opportunities across 5 categories:
                Federal/Intelligence/Defense (Pathways, NSA, NIST SURF, DoD STEM),
                STEM Research (NSF REU, NSF LSAMP), Early-Career Tech (Google STEP,
                Break Through Tech, Microsoft Explore, JPMorgan Code for Good),
                Civic & Gov-Tech (Civic Digital Fellowship, USDS), and Defense
                Contractors (Lockheed Martin, Northrop Grumman, SAIC/GDIT/CACI/Leidos).
                Filter by stage (Year 1, Year 2, Post-Transfer) and category.
                Status tracked per program.

SAVING
------
Everything auto-saves to your browser's localStorage (key: cp_tracker_v1).
Checkboxes, statuses, custom tasks, and connection statuses persist across sessions.
Clearing browser data will reset the checkmarks and custom tasks (but not the
pre-loaded data, which is in tracker.js).

EDITING YOUR DATA
-----------------
To add/remove/change built-in tasks, projects, certs, prospects, or gaps:
  1. Open tracker.js in Notepad, VS Code, or any text editor
  2. Find the DATA SECTION (search for "DATA SECTION")
  3. Edit the arrays directly (each entry is clearly labeled)
  4. Save the file and refresh your browser

THEMES
------
Click the moon/sun icon in the top right to toggle dark mode.

FILES
-----
index.html   - HTML structure (tabs, modals)
tracker.css  - All styles (colors, layout, components)
tracker.js   - All logic + your pre-loaded data
serve.py     - Optional local server (Python 3)
README.txt   - This file
