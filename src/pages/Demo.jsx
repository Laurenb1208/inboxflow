import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FolderModal from '../components/FolderModal.jsx'
import Toast from '../components/Toast.jsx'
import { COLORS } from '../data/defaults.js'

// ─── Exactly 3 demo folders, 4 keywords each ──────────────────────────────
const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings', color: 'Blue',   priority: 'High',   keywords: 'zoom, calendar, invite, meeting' },
  { id: 'f2', name: 'Clients',  color: 'Green',  priority: 'Medium', keywords: 'contract, proposal, invoice, follow-up' },
  { id: 'f3', name: 'Internal', color: 'Purple', priority: 'Low',    keywords: 'update, FYI, internal, team' },
]

// ─── 60 sample emails across all 3 folders + Uncategorized ───────────────
const SAMPLE_EMAILS = [
  // ── MEETINGS (15) — zoom, calendar, invite, meeting ──────────────────────
  { id: 'e1',  priority: 'High',   fromName: 'Sara Johnson',      fromAddr: 'sara@company.com',            subject: 'Zoom link — Q2 planning sync',                    snippet: 'Here is the Zoom link for our Q2 planning call tomorrow at 2 PM. Please join 5 min early.',                        receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  priority: 'High',   fromName: 'Marcus Lee',        fromAddr: 'lead@partner.io',             subject: 'Calendar invite: project kickoff',                snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday at 10 AM.',                             receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e4',  priority: 'High',   fromName: 'People Ops',        fromAddr: 'people@company.com',          subject: 'Invite: company offsite planning session',        snippet: "You're invited to join the offsite planning meeting on April 29. Please RSVP via the calendar invite by Friday.",   receivedAt: '2026-04-21T16:00:00Z' },
  { id: 'e7',  priority: 'High',   fromName: 'Raj Patel',         fromAddr: 'raj@company.com',             subject: 'Zoom call: investor update this Thursday',        snippet: 'Jumping on a Zoom call this Thursday at 11 AM for the quarterly investor update. Calendar invite attached.',       receivedAt: '2026-04-20T15:00:00Z' },
  { id: 'e9',  priority: 'High',   fromName: 'Design Lead',       fromAddr: 'design@company.com',          subject: 'Meeting invite: design sprint kickoff',           snippet: "You're invited to the design sprint kickoff meeting on Monday, April 28 at 10 AM. Zoom link included.",           receivedAt: '2026-04-19T09:00:00Z' },
  { id: 'e3',  priority: 'Medium', fromName: 'Jamie Torres',      fromAddr: 'jamie@company.com',           subject: 'Zoom standup notes — Apr 22',                     snippet: "Notes from today's standup are attached. Action items highlighted. Next meeting is Thursday.",                      receivedAt: '2026-04-22T09:30:00Z' },
  { id: 'e5',  priority: 'Medium', fromName: 'David Park',        fromAddr: 'dpark@company.com',           subject: 'Meeting invite: leadership sync Thursday',        snippet: 'Please accept the invite for our leadership sync rescheduled to Thursday at 3 PM. Calendar updated.',              receivedAt: '2026-04-21T14:30:00Z' },
  { id: 'e37', priority: 'Medium', fromName: 'Nadia Osei',        fromAddr: 'nadia@company.com',           subject: 'Meeting recap: sales strategy session',           snippet: 'Here is the recap from our meeting this morning. Three action items are assigned — see the doc for details.',      receivedAt: '2026-04-18T15:00:00Z' },
  { id: 'e38', priority: 'Medium', fromName: 'Google Calendar',   fromAddr: 'calendar-noreply@google.com', subject: 'Reminder: UX review — Apr 25 at 2 PM',           snippet: 'You have an upcoming meeting "UX Review" on Friday, April 25 at 2:00 PM. Zoom link in the calendar event.',        receivedAt: '2026-04-18T08:00:00Z' },
  { id: 'e39', priority: 'Medium', fromName: 'Tyler Brooks',      fromAddr: 'tbrooks@company.com',         subject: 'Zoom recording: client onboarding call',          snippet: "The recording from this morning's client onboarding Zoom is now available. Link expires in 7 days.",               receivedAt: '2026-04-15T14:30:00Z' },
  { id: 'e6',  priority: 'Low',    fromName: 'Operations Team',   fromAddr: 'ops@company.com',             subject: 'All-hands meeting tomorrow at 3 PM',              snippet: 'Reminder: all-hands meeting is tomorrow at 3 PM in the main conference room. Zoom link in calendar.',              receivedAt: '2026-04-21T10:00:00Z' },
  { id: 'e8',  priority: 'Low',    fromName: 'Lisa Wong',         fromAddr: 'lisa@company.com',            subject: 'Weekly team meeting notes — Apr 21',              snippet: "Here are the notes from yesterday's weekly team meeting. Decisions and follow-up actions listed inside.",           receivedAt: '2026-04-20T09:00:00Z' },
  { id: 'e40', priority: 'Low',    fromName: 'Stephanie Yu',      fromAddr: 'syu@company.com',             subject: 'Reschedule: Wednesday meeting moved to Friday',   snippet: 'Our Wednesday afternoon meeting has been moved to Friday at 3 PM. Calendar invite updated — please accept.',        receivedAt: '2026-04-17T13:00:00Z' },
  { id: 'e41', priority: 'Low',    fromName: 'Events Team',       fromAddr: 'events@company.com',          subject: 'Invite: lunch and learn — AI tools Apr 29',       snippet: "You're invited to our monthly lunch and learn on April 29 at noon. Topic: AI tools for productivity. Zoom link below.", receivedAt: '2026-04-14T11:00:00Z' },
  { id: 'e10', priority: 'Low',    fromName: 'Ben Walker',        fromAddr: 'ben@agency.com',              subject: 'Meeting notes: product review Apr 18',            snippet: 'Sharing the notes from last Friday\'s product review meeting. Four decisions were made — see the attached summary.',  receivedAt: '2026-04-11T09:00:00Z' },

  // ── CLIENTS (15) — contract, proposal, invoice, follow-up ────────────────
  { id: 'e11', priority: 'High',   fromName: 'Legal @ Acme',      fromAddr: 'legal@acme.co',               subject: 'Updated contract draft for review',               snippet: 'Please review the attached contract draft and let us know if you have any revisions before signing.',                receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e13', priority: 'High',   fromName: 'Client Success',    fromAddr: 'cs@bigclient.com',            subject: 'Contract renewal — can we schedule a call?',      snippet: "Our contract is up for renewal next month. I'd love to schedule a call to discuss terms this week.",                receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e17', priority: 'High',   fromName: 'Meridian Partners', fromAddr: 'hello@meridian.io',           subject: "Proposal feedback — ready to move forward",       snippet: "We've reviewed your proposal and are ready to move forward. Can we get a revised contract by Friday?",             receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e18', priority: 'High',   fromName: 'Nexus Procurement', fromAddr: 'ap@nexuscorp.com',            subject: 'Invoice #3301 requires urgent approval',          snippet: 'Invoice #3301 for $12,000 requires your urgent approval. Please sign off by end of day to avoid project delays.',    receivedAt: '2026-04-19T10:00:00Z' },
  { id: 'e43', priority: 'High',   fromName: 'Vertex Legal',      fromAddr: 'legal@vertexllp.com',         subject: 'Contract signed — fully executed copy attached',  snippet: 'Great news — both parties have signed. Please find the fully executed contract attached for your records.',           receivedAt: '2026-04-14T13:00:00Z' },
  { id: 'e12', priority: 'Medium', fromName: 'TechCorp Sales',    fromAddr: 'sales@techcorp.com',          subject: 'New proposal for your review',                    snippet: 'Attached is the revised proposal with updated pricing. Let us know your availability to discuss.',                   receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e16', priority: 'Medium', fromName: 'Zoe Hammond',       fromAddr: 'zoe@partnerco.com',           subject: 'Follow-up: expansion discussion',                 snippet: 'Following up on our call last week regarding the potential expansion into the EU market. Let me know.',              receivedAt: '2026-04-20T11:30:00Z' },
  { id: 'e19', priority: 'Medium', fromName: 'Enterprise Sol.',   fromAddr: 'accounts@entsol.com',         subject: 'Revised proposal — new pricing model',            snippet: 'Please find the revised proposal with our new pricing model attached. Open to a call to walk you through it.',        receivedAt: '2026-04-18T10:00:00Z' },
  { id: 'e20', priority: 'Medium', fromName: 'Horizon Group',     fromAddr: 'contracts@horizon.biz',       subject: 'Contract terms — final round of edits',           snippet: "We are on the last round of contract edits. Attached is the redlined version with our legal team's notes.",          receivedAt: '2026-04-17T14:00:00Z' },
  { id: 'e42', priority: 'Medium', fromName: 'Apex Consulting',   fromAddr: 'hello@apexco.com',            subject: 'Follow-up: partnership proposal last week',       snippet: 'Just following up on the partnership proposal I sent over last Tuesday. Happy to jump on a call to answer questions.', receivedAt: '2026-04-15T16:00:00Z' },
  { id: 'e15', priority: 'Low',    fromName: 'GlobalVentures',    fromAddr: 'billing@globalv.com',         subject: 'Invoice #4421 attached for approval',             snippet: 'Please find Invoice #4421 for Q1 services attached. Kindly approve for payment within 14 days.',                   receivedAt: '2026-04-20T14:00:00Z' },
  { id: 'e45', priority: 'Low',    fromName: 'ClientCo Billing',  fromAddr: 'billing@clientco.com',        subject: 'Invoice #887 — please review',                    snippet: 'Your invoice #887 is ready. Total due: $4,200. Please review and let us know if you have any questions.',             receivedAt: '2026-04-16T09:00:00Z' },
  { id: 'e44', priority: 'Low',    fromName: 'Bloom Agency',      fromAddr: 'projects@bloomagency.co',     subject: 'Follow-up: still waiting on your decision',       snippet: 'Checking back on the proposal we sent last week. No pressure — just want to make sure it arrived okay.',              receivedAt: '2026-04-13T11:30:00Z' },
  { id: 'e46', priority: 'Low',    fromName: 'Pinnacle Group',    fromAddr: 'bd@pinnaclegroup.com',        subject: 'Invoice #2209 — payment confirmation needed',     snippet: 'Our records show Invoice #2209 is outstanding. Please confirm receipt or let us know if there is an issue.',          receivedAt: '2026-04-09T15:00:00Z' },
  { id: 'e47', priority: 'Low',    fromName: 'Reed & Moore LLP',  fromAddr: 'counsel@reedmoore.law',       subject: 'Contract amendment: scope of work changes',       snippet: 'Please find the contract amendment attached reflecting the scope changes discussed on our last call. Sign when ready.',  receivedAt: '2026-04-07T10:00:00Z' },

  // ── INTERNAL (15) — update, FYI, internal, team ──────────────────────────
  { id: 'e24', priority: 'High',   fromName: 'Engineering Team',  fromAddr: 'eng@company.com',             subject: 'Internal: deployment Saturday night',             snippet: 'Internal notice: we are deploying v2.4 Saturday at 11 PM. Expect up to 30 min of downtime for the API.',             receivedAt: '2026-04-21T13:00:00Z' },
  { id: 'e26', priority: 'High',   fromName: 'IT Support',        fromAddr: 'it@company.com',              subject: 'Team reminder: 2FA required from Monday',         snippet: 'Friendly reminder: two-factor authentication becomes mandatory for all team members starting this Monday.',             receivedAt: '2026-04-19T11:00:00Z' },
  { id: 'e49', priority: 'High',   fromName: 'On-Call',           fromAddr: 'oncall@company.com',          subject: 'URGENT: internal alert — production outage',      snippet: 'Internal alert: we are experiencing a production outage. The on-call team is investigating. Updates every 15 min.',    receivedAt: '2026-04-17T03:00:00Z' },
  { id: 'e50', priority: 'High',   fromName: 'CEO Office',        fromAddr: 'ceo-office@company.com',      subject: 'Internal memo: org restructure announcement',     snippet: 'Please read this internal memo from leadership regarding the upcoming org restructure. Town hall is scheduled Monday.',  receivedAt: '2026-04-12T09:00:00Z' },
  { id: 'e51', priority: 'High',   fromName: 'Security Team',     fromAddr: 'security@company.com',        subject: 'Internal: security patch required by Friday',     snippet: 'Internal security notice: all team members must apply the latest OS patch before Friday 5 PM. See instructions attached.', receivedAt: '2026-04-09T10:00:00Z' },
  { id: 'e22', priority: 'Medium', fromName: 'Priya Nair',        fromAddr: 'priya@company.com',           subject: 'Update: Q3 goals finalized',                      snippet: 'Team update: the Q3 roadmap has been finalized. Please review the shared doc and add your OKRs by EOD.',               receivedAt: '2026-04-22T10:30:00Z' },
  { id: 'e25', priority: 'Medium', fromName: 'All-Hands',         fromAddr: 'allhands@company.com',        subject: 'Reminder: submit Q2 OKR updates by EOD',          snippet: 'Team reminder — please submit your quarterly OKR updates in the shared tracker by 5 PM today. Thank you!',              receivedAt: '2026-04-20T08:00:00Z' },
  { id: 'e52', priority: 'Medium', fromName: 'HR Team',           fromAddr: 'hr@company.com',              subject: 'Team survey: workplace satisfaction 2026',         snippet: 'HR is collecting team feedback via a short workplace satisfaction survey. Please complete by end of this week.',          receivedAt: '2026-04-16T09:00:00Z' },
  { id: 'e53', priority: 'Medium', fromName: 'Operations',        fromAddr: 'ops@company.com',             subject: 'Update: new onboarding process for contractors',  snippet: 'Team update: the contractor onboarding process has been revised. Review the new checklist before the next hire.',       receivedAt: '2026-04-13T14:00:00Z' },
  { id: 'e54', priority: 'Medium', fromName: 'Marketing',         fromAddr: 'marketing@company.com',       subject: 'Internal update: new brand guidelines live',      snippet: 'Team update: the new brand guidelines are published on Notion. Please review before creating any new materials.',         receivedAt: '2026-04-10T11:00:00Z' },
  { id: 'e21', priority: 'Low',    fromName: 'HR Team',           fromAddr: 'hr@company.com',              subject: 'FYI: office closed this Friday',                   snippet: 'Just an update — the office will be closed this Friday for scheduled maintenance. Work from home as usual.',             receivedAt: '2026-04-22T12:00:00Z' },
  { id: 'e23', priority: 'Low',    fromName: 'Alex Kim',          fromAddr: 'alex@company.com',            subject: 'FYI — expense policy change effective May 1',     snippet: 'A quick FYI: the expense reimbursement policy has been updated effective May 1. See the attached PDF for details.',       receivedAt: '2026-04-21T17:00:00Z' },
  { id: 'e27', priority: 'Low',    fromName: 'Finance Dept.',     fromAddr: 'finance@company.com',         subject: 'FYI: expense window closes Friday',                snippet: 'Internal FYI — the Q1 expense reimbursement submission window closes this Friday at 5 PM. Submit your receipts now.',   receivedAt: '2026-04-18T09:30:00Z' },
  { id: 'e28', priority: 'Low',    fromName: 'Facilities',        fromAddr: 'facilities@company.com',      subject: 'FYI: building access changes next week',           snippet: 'Quick FYI from facilities — badge access to the 4th floor will be updated next Monday. No action needed from your end.', receivedAt: '2026-04-15T08:00:00Z' },
  { id: 'e55', priority: 'Low',    fromName: 'People Ops',        fromAddr: 'people@company.com',          subject: 'Update: remote work policy revised',               snippet: 'The internal remote work policy has been revised effective May 1. Please review and acknowledge receipt in Workday.',     receivedAt: '2026-04-08T10:00:00Z' },

  // ── UNCATEGORIZED (15) — no keyword match ────────────────────────────────
  { id: 'e30', priority: null, fromName: 'GitHub',          fromAddr: 'noreply@github.com',          subject: 'Security alert on your repository',              snippet: 'A dependency in your repository has a known vulnerability. Review the Dependabot alert and apply the fix.',            receivedAt: '2026-04-22T07:30:00Z' },
  { id: 'e31', priority: null, fromName: 'Weekly Digest',   fromAddr: 'news@techdigest.com',         subject: 'Your weekly industry digest',                    snippet: 'This week in tech: AI tools, remote work trends, SaaS funding rounds, and the top reads from the community.',           receivedAt: '2026-04-21T08:00:00Z' },
  { id: 'e32', priority: null, fromName: 'LinkedIn',        fromAddr: 'messaging@linkedin.com',      subject: '3 new connections are looking at you',           snippet: 'You have 3 new profile views and 2 pending connection requests. Log in to see who wants to connect.',                   receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e36', priority: null, fromName: 'Webinar Host',    fromAddr: 'events@saasconf.com',         subject: "You're registered: Growth Hacking 2026",         snippet: "You're confirmed for \"Growth Hacking in 2026\" on May 3 at 11 AM ET. A recording will be sent automatically.",          receivedAt: '2026-04-19T12:00:00Z' },
  { id: 'e33', priority: null, fromName: 'Stripe',          fromAddr: 'reports@stripe.com',          subject: 'Weekly payout summary — Apr 14–21',              snippet: 'Your weekly payout of $1,240.00 has been sent to your bank account. View the full breakdown in your dashboard.',         receivedAt: '2026-04-18T07:00:00Z' },
  { id: 'e34', priority: null, fromName: 'DocuSign',        fromAddr: 'dse@docusign.net',            subject: 'Please sign: NDA for vendor onboarding',         snippet: 'You have been sent a document to sign: "Mutual NDA — Vendor Onboarding". Click to review and sign securely.',            receivedAt: '2026-04-17T14:00:00Z' },
  { id: 'e35', priority: null, fromName: 'Flight Confirm',  fromAddr: 'confirm@flightapp.com',       subject: 'Flight confirmation: ORD → JFK Apr 28',          snippet: "Your flight from Chicago O'Hare to New York JFK on April 28 at 7:15 AM is confirmed. Check-in opens 24h before.",       receivedAt: '2026-04-16T15:00:00Z' },
  { id: 'e56', priority: null, fromName: 'Airbnb',          fromAddr: 'automated@airbnb.com',        subject: 'Your reservation is confirmed — San Francisco',  snippet: "Your stay at \"Bright Studio Near Union Square\" from May 6–9 is confirmed. Check-in instructions arrive 48h before.",   receivedAt: '2026-04-15T09:00:00Z' },
  { id: 'e57', priority: null, fromName: 'Coursera',        fromAddr: 'no-reply@coursera.org',       subject: 'Your certificate is ready to download',          snippet: "Congratulations! You have earned your certificate for \"Data Analysis with Python.\" Share it on LinkedIn.",              receivedAt: '2026-04-14T14:00:00Z' },
  { id: 'e58', priority: null, fromName: 'Dropbox',         fromAddr: 'no-reply@dropbox.com',        subject: 'New shared folder: Q1 Assets',                   snippet: 'Morgan shared the folder "Q1 Assets" with you. You can now view and edit the files inside. Open in Dropbox.',             receivedAt: '2026-04-13T10:30:00Z' },
  { id: 'e59', priority: null, fromName: 'Notion',          fromAddr: 'notify@notion.so',            subject: 'Someone shared a page with you',                 snippet: 'Jordan Rivera shared "2026 Company Wiki" with you. Click to open the page and start reading.',                           receivedAt: '2026-04-12T16:00:00Z' },
  { id: 'e60', priority: null, fromName: 'Figma',           fromAddr: 'noreply@figma.com',           subject: 'New comment on "Dashboard v4"',                  snippet: 'Alex left a comment on your design file: "Can we try a darker shade on the sidebar?" Click to reply.',                   receivedAt: '2026-04-11T11:00:00Z' },
  { id: 'e61', priority: null, fromName: 'Amazon',          fromAddr: 'ship-confirm@amazon.com',     subject: 'Your order has shipped — arrives tomorrow',       snippet: 'Good news! Your order of "Mechanical Keyboard Pro" has shipped and will arrive tomorrow by 8 PM.',                       receivedAt: '2026-04-10T08:00:00Z' },
  { id: 'e62', priority: null, fromName: 'Spotify',         fromAddr: 'no-reply@spotify.com',        subject: 'Your April playlist is ready',                   snippet: 'We made you a new playlist based on what you have been listening to this month. 20 tracks, 1h 12m. Open in Spotify.',    receivedAt: '2026-04-09T08:00:00Z' },
  { id: 'e63', priority: null, fromName: 'Apple',           fromAddr: 'no_reply@email.apple.com',    subject: 'Your receipt from Apple',                        snippet: 'Thank you for your purchase. $9.99 — iCloud+ 50GB plan. View your full purchase history in your Apple ID settings.',     receivedAt: '2026-04-07T12:00:00Z' },
]

function classify(email, folders) {
  const hay = [email.subject, email.snippet, email.fromAddr, email.fromName].join(' ').toLowerCase()
  for (const folder of folders) {
    const hit = (folder.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean).some(k => hay.includes(k))
    if (hit) return { folderId: folder.id, folderName: folder.name, folderColor: folder.color, priority: folder.priority }
  }
  return { folderId: null, folderName: null, folderColor: null, priority: null }
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
  const [tab, setTab] = useState('inbox')
  const [activeFolderId, setActiveFolderId] = useState('')
  const [activePriority, setActivePriority] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)

  const emails = useMemo(() => SAMPLE_EMAILS.map(e => ({ ...e, ...classify(e, folders) })), [folders])

  const visible = useMemo(() => emails.filter(e => {
    if (activeFolderId === 'uncategorized' && e.folderId) return false
    if (activeFolderId && activeFolderId !== 'uncategorized' && e.folderId !== activeFolderId) return false
    if (activePriority && e.priority !== activePriority) return false
    if (q) {
      const hay = [e.subject, e.snippet, e.fromName, e.fromAddr].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  }), [emails, activeFolderId, activePriority, q])

  const activeLabel = useMemo(() => {
    const parts = []
    if (activeFolderId === 'uncategorized') parts.push('Uncategorized')
    else if (activeFolderId) parts.push(folders.find(f => f.id === activeFolderId)?.name || '')
    if (activePriority) parts.push(activePriority)
    return parts.join(' + ')
  }, [activeFolderId, activePriority, folders])

  const saveFolder = (data) => {
    if (data.id) {
      setFolders(fs => fs.map(f => f.id === data.id ? { ...f, ...data } : f))
      setToast('Folder updated')
    } else {
      if (folders.some(f => f.name.toLowerCase() === data.name.toLowerCase())) {
        setToast('A folder with that name already exists'); return
      }
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
        {/* LEFT: sidebar */}
        <aside className="demo-side card">
          <div className="demo-stats">
            <div className="ds"><span className="ds-val">{emails.length}</span><span className="ds-lbl">Emails</span></div>
            <div className="ds"><span className="ds-val">{categorized}</span><span className="ds-lbl">Sorted</span></div>
            <div className="ds"><span className="ds-val">{folders.length}</span><span className="ds-lbl">Folders</span></div>
          </div>

          <div className="demo-tabs">
            <button className={`dtab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>📥 Inbox</button>
            <button className={`dtab ${tab === 'settings' ? 'on' : ''}`} onClick={() => setTab('settings')}>⚙️ Settings</button>
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

            <h4 className="side-heading">Priority</h4>
            <button className={`side-item ${activePriority === '' ? 'on' : ''}`} onClick={() => setActivePriority('')}>All priorities</button>
            {['High', 'Medium', 'Low'].map(p => (
              <button key={p} className={`side-item ${activePriority === p ? 'on' : ''}`} onClick={() => setActivePriority(cur => cur === p ? '' : p)}>
                <span className={`r-dot pri-${p.toLowerCase()}`} /> {p}
              </button>
            ))}
          </>}

          {tab === 'settings' && <>
            <h4 className="side-heading">
              Folders
              <button className="add-btn" onClick={() => setFolderModal({ open: true, initial: null })}>+ Add</button>
            </h4>
            {folders.length === 0 && (
              <p className="muted" style={{ fontSize: 13, padding: '8px 0' }}>No folders yet — add one to start sorting.</p>
            )}
            {folders.map(f => (
              <div key={f.id}>
                <div className="manage-row">
                  <span className="color-dot" style={{ background: colorHex(f.color) }} />
                  <span className="manage-name">{f.name}</span>
                  {f.priority && <span className={`pri-pill pri-${f.priority.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 8px' }}>{f.priority}</span>}
                  <button className="link-btn tiny" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                  <button className="link-btn tiny danger" onClick={() => deleteFolder(f.id)}>✕</button>
                </div>
                {f.keywords && (
                  <p className="muted" style={{ fontSize: 11, margin: '0 0 6px 20px' }}>{f.keywords}</p>
                )}
              </div>
            ))}
          </>}
        </aside>

        {/* MAIN: email list */}
        <section className="demo-main">
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', padding: '0 2px' }}>
            Use folders and priority filters to organize your inbox.
          </p>
          <div className="inbox-toolbar">
            <input className="search-input" placeholder="Search subject, sender, snippet…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted">{visible.length} message{visible.length === 1 ? '' : 's'}</span>
          </div>

          {activeLabel && (
            <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, padding: '4px 2px 8px' }}>
              Filtering: {activeLabel}
            </div>
          )}

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

      <FolderModal
        open={folderModal.open}
        initial={folderModal.initial}
        onClose={() => setFolderModal({ open: false, initial: null })}
        onSave={saveFolder}
      />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}
