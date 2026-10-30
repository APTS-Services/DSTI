# CMS User Guide — DSTI Website

For Department staff who update the website. No technical knowledge is needed.

## Signing in
1. Go to `https://dsti.ap.gov.in/admin`.
2. Enter your username, password and the security code shown in the image (press ↻ for a new code).
3. The first time, you must set a new password: 10–64 characters with upper- and lower-case letters, a digit and a special character.
4. After 20 minutes without activity you are signed out automatically. Always use **Sign out** when you finish.
5. After 5 wrong attempts the account locks for 15 minutes; an Administrator can unlock it under **Users & roles**.

## Roles
| Role | Can do |
| --- | --- |
| **Editor** | Add and edit content. New items are saved as **drafts** (not visible to the public). |
| **Publisher** | Everything an Editor can do, plus publish / unpublish, delete, feedback inbox, site settings. |
| **Administrator** | Everything, plus users, audit log, system settings and backup / restore. |

## Finding your way
The menu on the left follows the website: **Home page**, **About & departments**, **Citizen services**, **Media**,
**District explorer**, **Pages & menu** and **Site settings**. Click a group to open it, or type in **Find a section…**
(for example "tender" or "gallery"). The **Dashboard** shows visitors, open tenders, feedback waiting for a reply and
the average response time, with quick actions and a *Needs attention* list (drafts and unanswered feedback).

## Everyday tasks
- **Leadership (Chief Minister, Minister, Secretary):** About & departments → *Leadership*. Enter the name, designation and portfolio, upload the official photograph (portrait, about 400 × 480 pixels, PNG/JPG/WEBP) and tick *Show on the home page*. If the name is empty, the designation is shown.
- **Photo gallery:** Media → *Photo gallery* → **Add new**. Upload a landscape photograph (at least 1200 × 800), add the title and caption in English and Telugu, the album (for example *Events & conclaves*), the date and the place. Albums appear automatically as filters. The gallery title and the tagline under it are in Site settings → *Home page sections*.
- **Vision and Mission:** About & departments → *About the Department*.
- **Add a news item / update (also shown in the ticker):** Home page → *Latest updates / news* → **Add new**. Fill in the date and the headline in English and Telugu, choose a category and an optional link (for example `/tenders`), then **Save**.
- **Publish a tender:** Citizen services → *Tenders* → **Add new**. Under *Documents*, press **Add documents**, enter a name and **Upload** the PDF. Status *Open* or *Closed*. A tender is shown as closed automatically after its closing date.
- **Upload a G.O., notification, circular, act, rule or guideline:** *Document repository* → **Add new**. Choose the type, then upload the PDF. To also list it on the RTI, IT Act or PoSH page, choose that page in "Also show on page".
- **Events and Science Stories:** Media → *Events* / *Science stories*. For a video, enter the 11-character YouTube video ID (from `youtube.com/watch?v=XXXXXXXXXXX`) or upload an MP4.
- **Hero banner:** Home page → *Hero banner slides* — message, supporting text, button and an optional background image.
- **Show or hide home page sections:** Home page → *Home page sections*.
- **Menu:** Pages & menu → *Main menu*. Keep to about six groups; each sub-menu item can have a short description that appears in the drop-down. (Running `npm run seed` again resets the menu to the standard one.)
- **Logo, department name, social media links:** Settings → *Site identity & social*.
- **Contact details, About pages, Investor's Corner:** the corresponding Settings pages.
- **Statutory pages (Website Policy, Privacy Policy, …), RTI, IT Act, PoSH, Help:** Pages → *Content pages*.

## Tips
- Each text has an **English** and a **Telugu** box. If the Telugu box is empty, English is shown to Telugu readers.
- **Display order:** lower numbers appear first.
- **Draft** hides an item without deleting it. Use the eye icon in a list to publish or unpublish quickly.
- **Files & images** lists every uploaded file; copy a file's path to reuse it. Allowed: PDF, PNG, JPG, WEBP, MP4 and VTT (up to 25 MB by default).
- **View on site** on any item opens the public page where it appears.

## Feedback
Site settings → *System* sets the e-mail address that receives feedback notifications. All messages are under
**Feedback** (the red badge shows unread messages). The top of the page shows the same dashboard citizens see on the
website. Use the tabs (New, Read, Answered, Resolved) and the search box to find a message, open it and write the
Department's reply under **Reply to the citizen** → **Send reply**. The reply is saved, e-mailed to the citizen (when
e-mail is configured) and shown to them when they track their reference number on the website, and the response time
is counted on the dashboard. Use **Mark resolved** when the matter is closed, and **Export CSV** for reports. Aim to
reply within 7 days — the share answered within 7 days is published.

## Backups (Administrators)
Administration → **Backup & restore** → *Download backup* saves all content as a file. Keep a copy before large changes. *Restore* replaces all content with a backup file. Uploaded files and the full database are backed up nightly on the server.
