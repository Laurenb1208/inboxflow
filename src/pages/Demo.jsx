import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FolderModal from '../components/FolderModal.jsx'
import Toast from '../components/Toast.jsx'
import { COLORS } from '../data/defaults.js'

const SAMPLE_EMAILS = [
  // ── MEETINGS (match: zoom, calendar, invite, meeting, reschedule) ──
  { id: 'e1',  priority: 'High',   fromName: 'Sara Johnson',       fromAddr: 'sara@company.com',            subject: 'Zoom link — Q2 planning sync',                    snippet: 'Here is the Zoom link for our Q2 planning call tomorrow at 2 PM. Please join 5 min early.',                         receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  priority: 'High',   fromName: 'Marcus Lee',         fromAddr: 'lead@partner.io',             subject: 'Calendar invite: project kickoff',                snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday at 10 AM.',                              receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e3',  priority: 'Medium', fromName: 'Jamie Torres',       fromAddr: 'jamie@company.com',           subject: 'Zoom standup notes — Apr 22',                     snippet: "Notes from today's standup are attached. Action items highlighted. Next meeting is Thursday.",                       receivedAt: '2026-04-22T09:30:00Z' },
  { id: 'e4',  priority: 'High',   fromName: 'Amanda Chen',        fromAddr: 'amanda@company.com',          subject: 'Meeting invite: product roadmap review',          snippet: 'Please accept this meeting invite for the product roadmap review on Friday at 1 PM.',                               receivedAt: '2026-04-21T16:00:00Z' },
  { id: 'e5',  priority: 'Medium', fromName: 'David Park',         fromAddr: 'dpark@company.com',           subject: 'Rescheduled: leadership sync → Thursday',         snippet: 'Our leadership sync has been rescheduled from Wednesday to Thursday at 3 PM. Calendar updated.',                    receivedAt: '2026-04-21T14:30:00Z' },
  { id: 'e6',  priority: 'Low',    fromName: 'Operations Team',    fromAddr: 'ops@company.com',             subject: 'All-hands meeting tomorrow at 3 PM',              snippet: 'Reminder: all-hands meeting is tomorrow at 3 PM in the main conference room. Zoom link in calendar.',                receivedAt: '2026-04-21T10:00:00Z' },
  { id: 'e7',  priority: 'High',   fromName: 'Raj Patel',          fromAddr: 'raj@company.com',             subject: 'Invite: sprint planning — please confirm',        snippet: 'Please accept this invite for our sprint planning session on Monday at 9 AM. Zoom link attached.',                   receivedAt: '2026-04-20T15:00:00Z' },
  { id: 'e8',  priority: 'Low',    fromName: 'Lisa Wong',          fromAddr: 'lisa@company.com',            subject: 'Weekly team meeting notes — Apr 21',              snippet: "Here are the notes from yesterday's weekly team meeting. Decisions and follow-up actions listed inside.",             receivedAt: '2026-04-20T09:00:00Z' },
  { id: 'e9',  priority: 'Medium', fromName: 'Ben Walker',         fromAddr: 'ben@agency.com',              subject: 'Zoom link for design review this Friday',         snippet: "I'll send the Zoom link for the design review call. Can you confirm Friday at 11 AM still works?",                   receivedAt: '2026-04-18T13:00:00Z' },
  { id: 'e10', priority: 'Low',    fromName: 'Caroline Nash',      fromAddr: 'caroline@company.com',        subject: 'Reschedule request: Monday standup',              snippet: "Hey, would it be possible to reschedule Monday's standup to 9 AM instead of 10? Calendar invite updated.",           receivedAt: '2026-04-17T17:30:00Z' },
  { id: 'e37', priority: 'Medium', fromName: 'Nadia Osei',         fromAddr: 'nadia@company.com',           subject: 'Meeting recap: sales strategy session',           snippet: 'Here is the recap from our meeting this morning. Three action items are assigned — see the doc for details.',        receivedAt: '2026-04-16T15:00:00Z' },
  { id: 'e38', priority: 'High',   fromName: 'Google Calendar',    fromAddr: 'calendar-noreply@google.com', subject: 'Invitation: UX review — Apr 25 at 2 PM',         snippet: 'You have been invited to "UX Review" on Friday, April 25 at 2:00 PM. Accept or decline in your calendar.',          receivedAt: '2026-04-16T10:00:00Z' },
  { id: 'e39', priority: 'Medium', fromName: 'Tyler Brooks',       fromAddr: 'tbrooks@company.com',         subject: 'Zoom recording: client onboarding call',          snippet: "The recording from this morning's client onboarding Zoom is now available. Link expires in 7 days.",                receivedAt: '2026-04-15T14:30:00Z' },
  { id: 'e40', priority: 'High',   fromName: 'People Ops',         fromAddr: 'people@company.com',          subject: 'Invite: company offsite planning session',        snippet: "You're invited to join the offsite planning meeting on April 29. Please RSVP via the calendar invite by Friday.",   receivedAt: '2026-04-14T11:00:00Z' },
  { id: 'e41', priority: 'Low',    fromName: 'Stephanie Yu',       fromAddr: 'syu@company.com',             subject: 'Reschedule: 1:1 moved to Wednesday 4 PM',         snippet: "Hi — I need to reschedule our 1:1 to Wednesday at 4 PM. I'll update the calendar invite now. Does that work?",      receivedAt: '2026-04-13T09:00:00Z' },

  // ── CLIENTS (match: contract, proposal, invoice, deliverable, follow-up) ──
  { id: 'e11', priority: 'High',   fromName: 'Legal @ Acme',       fromAddr: 'legal@acme.co',               subject: 'Updated contract draft for review',               snippet: 'Please review the attached contract draft and let us know if you have any revisions before signing.',                 receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e12', priority: 'Medium', fromName: 'TechCorp Sales',     fromAddr: 'sales@techcorp.com',          subject: 'New proposal for your review',                    snippet: 'Attached is the revised proposal with updated pricing. Let us know your availability to discuss.',                   receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e13', priority: 'High',   fromName: 'Client Success',     fromAddr: 'cs@bigclient.com',            subject: 'Contract renewal — can we schedule a call?',      snippet: "Our contract is up for renewal next month. I'd love to schedule a call to discuss terms this week.",                 receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e14', priority: 'Low',    fromName: 'GlobalVentures',     fromAddr: 'billing@globalv.com',         subject: 'Invoice #4421 attached for approval',             snippet: 'Please find Invoice #4421 for Q1 services attached. Kindly approve for payment within 14 days.',                    receivedAt: '2026-04-21T11:00:00Z' },
  { id: 'e15', priority: 'Medium', fromName: 'Kate Reynolds',      fromAddr: 'kreynolds@mediaco.com',       subject: 'Deliverable checklist — Q2 campaign',             snippet: 'Sharing the final deliverable checklist for the Q2 campaign. Please confirm which items are in scope.',               receivedAt: '2026-04-20T14:00:00Z' },
  { id: 'e16', priority: 'Medium', fromName: 'Zoe Hammond',        fromAddr: 'zoe@partnerco.com',           subject: 'Follow-up: expansion discussion',                 snippet: 'Following up on our call last week regarding the potential expansion into the EU market. Let me know.',               receivedAt: '2026-04-20T11:30:00Z' },
  { id: 'e17', priority: 'High',   fromName: 'Meridian Partners',  fromAddr: 'hello@meridian.io',           subject: "Proposal feedback — we're ready to move forward", snippet: "We've reviewed your proposal and are ready to move forward. Can we get a revised contract by Friday?",              receivedAt: '2026-04-19T16:00:00Z' },
  { id: 'e18', priority: 'Medium', fromName: 'Enterprise Solutions', fromAddr: 'accounts@entsol.com',       subject: 'Revised proposal — new pricing model',            snippet: 'Please find the revised proposal with our new pricing model attached. Open to a call to walk you through it.',        receivedAt: '2026-04-18T10:00:00Z' },
  { id: 'e19', priority: 'Medium', fromName: 'Horizon Group',      fromAddr: 'contracts@horizon.biz',       subject: 'Contract terms — final round of edits',           snippet: "We are on the last round of contract edits. Attached is the redlined version with our legal team's notes.",          receivedAt: '2026-04-17T14:00:00Z' },
  { id: 'e20', priority: 'Low',    fromName: 'ClientCo Billing',   fromAddr: 'billing@clientco.com',        subject: 'Invoice #887 — please review',                    snippet: 'Your invoice #887 is ready. Total due: $4,200. Please review and let us know if you have any questions.',             receivedAt: '2026-04-16T09:00:00Z' },
  { id: 'e42', priority: 'Medium', fromName: 'Apex Consulting',    fromAddr: 'hello@apexco.com',            subject: 'Follow-up: partnership proposal sent last week',  snippet: 'Just following up on the partnership proposal I sent over last Tuesday. Happy to jump on a call to answer questions.', receivedAt: '2026-04-15T16:00:00Z' },
  { id: 'e43', priority: 'High',   fromName: 'Vertex Legal',       fromAddr: 'legal@vertexllp.com',         subject: 'Contract signed — fully executed copy attached',  snippet: 'Great news — both parties have signed. Please find the fully executed contract attached for your records.',           receivedAt: '2026-04-14T13:00:00Z' },
  { id: 'e44', priority: 'Low',    fromName: 'Bloom Agency',       fromAddr: 'projects@bloomagency.co',     subject: 'Final deliverable: brand refresh assets',         snippet: 'All deliverables for the brand refresh project are now complete and uploaded to the shared drive. Please review.',     receivedAt: '2026-04-13T11:30:00Z' },
  { id: 'e45', priority: 'High',   fromName: 'Nexus Procurement',  fromAddr: 'ap@nexuscorp.com',            subject: 'Invoice #2209 overdue — please advise',           snippet: 'Our records show Invoice #2209 ($6,500) is 15 days past due. Please confirm payment status or let us know if there is an issue.', receivedAt: '2026-04-11T09:00:00Z' },
  { id: 'e46', priority: 'Medium', fromName: 'Pinnacle Group',     fromAddr: 'bd@pinnaclegroup.com',        subject: 'Updated proposal with revised scope of work',     snippet: 'Based on our last call, I have updated the proposal to reflect the reduced scope. Please review and let me know your thoughts.', receivedAt: '2026-04-09T15:00:00Z' },

  // ── INTERNAL (match: update, FYI, internal, team, reminder) ──
  { id: 'e21', priority: 'Low',    fromName: 'HR Team',            fromAddr: 'hr@company.com',              subject: 'FYI: office closed Friday',                       snippet: 'Just an update — the office will be closed this Friday for scheduled maintenance. Work from home.',                   receivedAt: '2026-04-22T12:00:00Z' },
  { id: 'e22', priority: 'Medium', fromName: 'Priya Nair',         fromAddr: 'priya@company.com',           subject: 'Update: Q3 goals finalized',                      snippet: 'Team update: the Q3 roadmap has been finalized. Please review the shared doc and add your OKRs by EOD.',              receivedAt: '2026-04-22T10:30:00Z' },
  { id: 'e23', priority: 'Low',    fromName: 'Alex Kim',           fromAddr: 'alex@company.com',            subject: 'FYI — expense policy change May 1',               snippet: 'A quick FYI: the expense reimbursement policy has been updated effective May 1. See attached PDF.',                    receivedAt: '2026-04-21T17:00:00Z' },
  { id: 'e24', priority: 'High',   fromName: 'Engineering Team',   fromAddr: 'eng@company.com',             subject: 'Internal: deployment Saturday night',             snippet: 'Internal notice: we are deploying v2.4 Saturday at 11 PM. Expect up to 30 min of downtime for the API.',             receivedAt: '2026-04-21T13:00:00Z' },
  { id: 'e25', priority: 'Medium', fromName: 'All-Hands',          fromAddr: 'allhands@company.com',        subject: 'Reminder: submit Q2 OKR updates by EOD',          snippet: 'Team reminder — please submit your quarterly OKR updates in the shared tracker by 5 PM today. Thank you!',            receivedAt: '2026-04-20T08:00:00Z' },
  { id: 'e26', priority: 'High',   fromName: 'IT Support',         fromAddr: 'it@company.com',              subject: 'Team reminder: 2FA required from Monday',         snippet: 'Friendly reminder: two-factor authentication becomes mandatory for all team members starting this Monday.',             receivedAt: '2026-04-19T11:00:00Z' },
  { id: 'e27', priority: 'Low',    fromName: 'Finance',            fromAddr: 'finance@company.com',         subject: 'FYI: expense window closes Friday',               snippet: 'Internal FYI — the Q1 expense reimbursement submission window closes this Friday at 5 PM. Submit now.',                receivedAt: '2026-04-18T09:30:00Z' },
  { id: 'e28', priority: 'Low',    fromName: 'Marketing Team',     fromAddr: 'marketing@company.com',       subject: 'Internal update: new brand guidelines',           snippet: 'Team update: the new brand guidelines are published on Notion. Please review before creating new materials.',            receivedAt: '2026-04-17T10:00:00Z' },
  { id: 'e47', priority: 'Medium', fromName: 'People Ops',         fromAddr: 'people@company.com',          subject: 'Reminder: performance reviews open this week',    snippet: 'Just a reminder that the self-evaluation portal is open until Sunday. Please complete your review before it closes.',   receivedAt: '2026-04-16T08:30:00Z' },
  { id: 'e48', priority: 'Low',    fromName: 'Office Manager',     fromAddr: 'office@company.com',          subject: 'FYI — kitchen fridge cleaned out Thursday',       snippet: 'Team FYI: the office kitchen fridge will be cleaned out Thursday afternoon. Please remove any personal items by noon.',  receivedAt: '2026-04-15T10:00:00Z' },
  { id: 'e49', priority: 'Medium', fromName: 'Design Team',        fromAddr: 'design@company.com',          subject: 'Internal update: Figma org restructure done',     snippet: 'Internal update: the Figma workspace has been reorganized by product area. See the pinned message in #design for details.', receivedAt: '2026-04-14T14:00:00Z' },
  { id: 'e50', priority: 'High',   fromName: 'Security Team',      fromAddr: 'security@company.com',        subject: 'Reminder: complete security awareness training',   snippet: 'Team reminder: mandatory security awareness training must be completed by April 30. Link to the portal is in this email.', receivedAt: '2026-04-12T09:00:00Z' },
  { id: 'e51', priority: 'Low',    fromName: 'Ryan Castillo',      fromAddr: 'ryan@company.com',            subject: 'Update: onboarding checklist for new hires',      snippet: 'Quick update — the new hire onboarding checklist has been revised. Please use the updated version starting next week.',  receivedAt: '2026-04-10T11:00:00Z' },
  { id: 'e52', priority: 'Medium', fromName: 'Product Team',       fromAddr: 'product@company.com',         subject: 'FYI: v3.0 launch date moved to May 12',           snippet: 'FYI the v3.0 release has been moved from May 5 to May 12 to allow more time for QA. Internal announcement going out Monday.', receivedAt: '2026-04-08T13:30:00Z' },
  { id: 'e53', priority: 'Low',    fromName: 'Legal',              fromAddr: 'legal@company.com',           subject: 'Internal: updated NDA template now in Drive',     snippet: 'Internal notice: the standard NDA template has been updated by our legal team. Please use the new version for all new vendors.', receivedAt: '2026-04-07T10:00:00Z' },

  // ── UNCATEGORIZED (no keyword match) ──
  { id: 'e29', priority: null, fromName: 'Amazon',             fromAddr: 'ship-confirm@amazon.com',  subject: 'Your order has shipped — arrives tomorrow',      snippet: 'Good news! Your order of "Mechanical Keyboard Pro" has shipped and arrives tomorrow by 8 PM.',                        receivedAt: '2026-04-22T08:00:00Z' },
  { id: 'e30', priority: null, fromName: 'GitHub',             fromAddr: 'noreply@github.com',       subject: 'Security alert on your repository',              snippet: 'A dependency in your repository has a known vulnerability. Review the Dependabot alert and apply the fix.',            receivedAt: '2026-04-22T07:30:00Z' },
  { id: 'e31', priority: null, fromName: 'Weekly Digest',      fromAddr: 'news@techdigest.com',      subject: 'Your weekly industry digest',                    snippet: 'This week in tech: AI tools, remote work trends, SaaS funding rounds, and the top reads from the community.',           receivedAt: '2026-04-21T08:00:00Z' },
  { id: 'e32', priority: null, fromName: 'LinkedIn',           fromAddr: 'messaging@linkedin.com',   subject: '3 new connections are looking at you',           snippet: 'You have 3 new profile views and 2 pending connection requests. Log in to see who wants to connect.',                   receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e33', priority: null, fromName: 'Stripe',             fromAddr: 'reports@stripe.com',       subject: 'Weekly payout summary — Apr 14–21',              snippet: 'Your weekly payout of $1,240.00 has been sent to your bank account. View the full breakdown in your dashboard.',         receivedAt: '2026-04-20T07:00:00Z' },
  { id: 'e34', priority: null, fromName: 'DocuSign',           fromAddr: 'dse@docusign.net',          subject: 'Please sign: NDA for vendor onboarding',         snippet: 'You have been sent a document to sign: "Mutual NDA — Vendor Onboarding". Click to review and sign securely.',            receivedAt: '2026-04-19T14:00:00Z' },
  { id: 'e35', priority: null, fromName: 'Flight Confirm',     fromAddr: 'confirm@flightapp.com',    subject: 'Flight confirmation: ORD → JFK Apr 28',          snippet: "Your flight UA2284 from Chicago O'Hare to New York JFK on April 28 at 7:15 AM is confirmed. Check in opens 24h before.",  receivedAt: '2026-04-18T15:00:00Z' },
  { id: 'e36', priority: null, fromName: 'Webinar Host',       fromAddr: 'events@saasconf.com',      subject: "You're registered: Growth Hacking 2026",         snippet: "You're confirmed for \"Growth Hacking in 2026\" on May 3 at 11 AM ET. A recording will be sent automatically.",          receivedAt: '2026-04-17T12:00:00Z' },
  { id: 'e54', priority: null, fromName: 'Notion',             fromAddr: 'notify@notion.so',         subject: 'Someone shared a page with you',                 snippet: 'Jordan Rivera shared "2026 Company Wiki" with you. Click to open the page and start reading.',                           receivedAt: '2026-04-16T16:00:00Z' },
  { id: 'e55', priority: null, fromName: 'Figma',              fromAddr: 'noreply@figma.com',        subject: 'New comment on "Dashboard v4"',                  snippet: 'Alex left a comment on your design file: "Can we try a darker shade on the sidebar?" Click to reply.',                   receivedAt: '2026-04-15T11:00:00Z' },
  { id: 'e56', priority: null, fromName: 'Airbnb',             fromAddr: 'automated@airbnb.com',     subject: 'Your reservation is confirmed — San Francisco',  snippet: 'Your stay at "Bright Studio Near Union Square" from May 6–9 is confirmed. Check-in instructions will arrive 48h before.',  receivedAt: '2026-04-14T09:00:00Z' },
  { id: 'e57', priority: null, fromName: 'Coursera',           fromAddr: 'no-reply@coursera.org',    subject: 'Your certificate is ready to download',          snippet: 'Congratulations! You have earned your certificate for "Data Analysis with Python." Download and share it on LinkedIn.',     receivedAt: '2026-04-12T14:00:00Z' },
  { id: 'e58', priority: null, fromName: 'Dropbox',            fromAddr: 'no-reply@dropbox.com',     subject: 'New shared folder: Q1 Assets',                   snippet: 'Morgan shared the folder "Q1 Assets" with you. You can now view and edit the files inside. Open in Dropbox.',             receivedAt: '2026-04-11T10:30:00Z' },
  { id: 'e59', priority: null, fromName: 'Spotify',            fromAddr: 'noreply@spotify.com',      subject: 'Your April Wrapped is here',                     snippet: "You've listened to 47 hours of music this month. Your top artist was Khruangbin. See your full April stats inside.",      receivedAt: '2026-04-10T08:00:00Z' },
  { id: 'e60', priority: null, fromName: 'App Store',          fromAddr: 'no_reply@email.apple.com', subject: 'Your receipt from Apple',                        snippet: 'Thank you for your purchase of "1Password - Password Manager" — $2.99/month. View full receipt in your Apple ID account.',  receivedAt: '2026-04-08T07:00:00Z' },
]

const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings', color: 'Blue',   keywords: 'zoom, calendar, invite, meeting, reschedule' },
  { id: 'f2', name: 'Clients',  color: 'Green',  keywords: 'contract, proposal, invoice, deliverable, follow-up' },
  { id: 'f3', name: 'Internal', color: 'Purple', keywords: 'update, FYI, internal, team, reminder' },
]

function classify(email, folders) {
  const hay = [email.subject, email.snippet, email.fromAddr, email.fromName].join(' ').toLowerCase()
  for (const folder of folders) {
    const hit = (folder.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean).some(k => hay.includes(k))
    if (hit) return { folderId: folder.id, folderName: folder.name, folderColor: folder.color }
  }
  return { folderId: null, folderName: null, folderColor: null }
}

function colorHex(name) { return COLORS.find(c => c.name === name)?.hex || '#9ca3af' }
function fmtDate(iso) {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0,0,0,0)
  const dd = new Date(d); dd.setHours(0,0,0,0)
  if (dd.getTime() === today.getTime()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

let nextId = 100
const uid = () => String(++nextId)

export default function Demo() {
  const [folders, setFolders] = useState(INIT_FOLDERS)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const [activeFolderId, setActiveFolderId] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('inbox')

  const emails = useMemo(() => SAMPLE_EMAILS.map(e => ({ ...e, ...classify(e, folders) })), [folders])

  const visible = useMemo(() => emails.filter(e => {
    if (activeFolderId === 'uncategorized' && e.folderId) return false
    if (activeFolderId && activeFolderId !== 'uncategorized' && e.folderId !== activeFolderId) return false
    if (q) {
      const hay = [e.subject, e.snippet, e.fromName, e.fromAddr].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  }), [emails, activeFolderId, q])

  const saveFolder = (data) => {
    if (data.id) {
      setFolders(fs => fs.map(f => f.id === data.id ? { ...f, ...data } : f))
      setToast('Folder updated')
    } else {
      const exists = folders.some(f => f.name.toLowerCase() === data.name.toLowerCase())
      if (exists) { setToast('A folder with that name already exists'); return }
      setFolders(fs => [...fs, { ...data, id: uid() }])
      setToast('Folder created')
    }
  }

  const deleteFolder = (id) => {
    setFolders(fs => fs.filter(f => f.id !== id))
    if (activeFolderId === id) setActiveFolderId('')
    setToast('Folder deleted')
  }

  const categorized = emails.filter(e => e.folderId).length

  return (
    <main className="demo-page">
      <div className="demo-banner">
        <span>🎮 <strong>Interactive Demo</strong> — sample data only. No real emails.</span>
        <Link to="/login" className="btn btn-primary btn-sm">Connect your Gmail →</Link>
      </div>

      <div className="container demo-layout">
        {/* LEFT: inbox sidebar */}
        <aside className="demo-side card">
          <div className="demo-stats">
            <div className="ds"><span className="ds-val">{emails.length}</span><span className="ds-lbl">Emails</span></div>
            <div className="ds"><span className="ds-val">{categorized}</span><span className="ds-lbl">Sorted</span></div>
            <div className="ds"><span className="ds-val">{folders.length}</span><span className="ds-lbl">Folders</span></div>
          </div>

          <div className="demo-tabs">
            <button className={`dtab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>📥 Inbox</button>
            <button className={`dtab ${tab === 'manage' ? 'on' : ''}`} onClick={() => setTab('manage')}>⚙️ Folders</button>
          </div>

          {tab === 'inbox' && <>
            <h4 className="side-heading">Folders</h4>
            <button className={`side-item ${activeFolderId === '' ? 'on' : ''}`} onClick={() => setActiveFolderId('')}>All emails</button>
            {folders.map(f => (
              <button key={f.id} className={`side-item ${activeFolderId === f.id ? 'on' : ''}`} onClick={() => setActiveFolderId(cur => cur === f.id ? '' : f.id)}>
                <span className="color-dot" style={{ background: colorHex(f.color) }} /> {f.name}
              </button>
            ))}
            <button className={`side-item ${activeFolderId === 'uncategorized' ? 'on' : ''}`} onClick={() => setActiveFolderId(cur => cur === 'uncategorized' ? '' : 'uncategorized')}>Uncategorized</button>
          </>}

          {tab === 'manage' && <>
            <h4 className="side-heading">Folders <button className="add-btn" onClick={() => setFolderModal({ open: true, initial: null })}>+ Add</button></h4>
            {folders.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 0' }}>No folders yet — add one to start sorting emails.</p>}
            {folders.map(f => (
              <div key={f.id}>
                <div className="manage-row">
                  <span className="color-dot" style={{ background: colorHex(f.color) }} />
                  <span className="manage-name">{f.name}</span>
                  <button className="link-btn tiny" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                  <button className="link-btn tiny danger" onClick={() => deleteFolder(f.id)}>✕</button>
                </div>
                {f.keywords && <p className="muted" style={{ fontSize: 11, margin: '0 0 4px 20px' }}>{f.keywords}</p>}
              </div>
            ))}
          </>}
        </aside>

        {/* MAIN: email list */}
        <section className="demo-main">
          <div className="inbox-toolbar">
            <input className="search-input" placeholder="Search subject, sender, snippet…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted">{visible.length} message{visible.length === 1 ? '' : 's'}</span>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No emails match</h4>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="email-list">
              {visible.map(e => (
                <div key={e.id} className={`email-card ${selected?.id === e.id ? 'sel' : ''}`} onClick={() => setSelected(e)}>
                  <div className="email-row1">
                    <div className="from">{e.fromName}</div>
                    <div className="when">{fmtDate(e.receivedAt)}</div>
                  </div>
                  <div className="subj">{e.subject}</div>
                  <div className="snip">{e.snippet}</div>
                  <div className="email-row3">
                    {e.folderName
                      ? <span className="folder-pill" style={{ background: colorHex(e.folderColor) + '22', color: colorHex(e.folderColor) }}>{e.folderName}</span>
                      : <span className="folder-pill empty">Uncategorized</span>
                    }
                    {e.priority && <span className={`pri-pill pri-${e.priority.toLowerCase()}`}>{e.priority}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-panel" onClick={ex => ex.stopPropagation()}>
            <div className="modal-head">
              <button className="link-back" onClick={() => setSelected(null)}>← Back</button>
              <h3>Message</h3>
              <button className="icon-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="label">From</span> {selected.fromName} &lt;{selected.fromAddr}&gt;</div>
              <div className="detail-row"><span className="label">Date</span> {new Date(selected.receivedAt).toLocaleString()}</div>
              <div className="detail-row"><span className="label">Folder</span> {selected.folderName || 'Uncategorized'}</div>
              {selected.priority && <div className="detail-row"><span className="label">Priority</span> <span className={`pri-pill pri-${selected.priority.toLowerCase()}`}>{selected.priority}</span></div>}
              <h4 className="detail-subj">{selected.subject}</h4>
              <p className="detail-snip">{selected.snippet}</p>
              <div className="detail-actions">
                <Link to="/login" className="btn btn-primary btn-sm">Connect Gmail to see real emails →</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <FolderModal open={folderModal.open} initial={folderModal.initial}
        onClose={() => setFolderModal({ open: false, initial: null })} onSave={saveFolder} />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}
