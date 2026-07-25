# 04 — Complete User Flow

## Flow 1 — Guest Discovery → Signup
```
Guest lands on Home
   ↓
Browses How It Works / Services / Pricing philosophy / FAQ
   ↓
Clicks "Submit a Project"
   ↓
Fills Solution Request form (allowed pre-account)
   ↓
On submit → prompted to create account (email + password) or continue with OAuth
   ↓
Verification email sent
   ↓
Clicks verification link → Email Verified
   ↓
Redirected to Client Dashboard → Request shown as "Pending Review"
```

## Flow 2 — Returning User Login
```
User visits Login page
   ↓
Enters credentials (or OAuth)
   ↓
[If 2FA enabled] enters OTP
   ↓
Redirected to Dashboard
```

## Flow 3 — Forgot Password
```
User clicks "Forgot password"
   ↓
Enters email
   ↓
Reset link emailed
   ↓
User sets new password
   ↓
Redirected to Login → success message
```

## Flow 4 — Solution Request Submission (Detailed)
```
Dashboard → "Submit a Project"
   ↓
Step 1: Select category/subcategory
   ↓
Step 2: Describe project (title, description, goals)
   ↓
Step 3: Upload requirement files
   ↓
Step 4: Optional budget range + desired deadline
   ↓
Step 5: Review & Submit
   ↓
Request created with status = "Pending Review"
   ↓
Confirmation shown + email sent
```

## Flow 5 — Internal Review (Admin side, referenced for context)
```
New Request enters Admin Review Queue
   ↓
Reviewer evaluates feasibility
   ↓
Decision: Approve or Decline
   ↓
[Declined] → Reason sent to client → status = "Declined"
   ↓
[Approved] → Assigned to Estimator
   ↓
Estimator builds Solution Proposal (price, timeline, deliverables, revisions, payment plan)
   ↓
Proposal sent → status = "Proposal Sent"
```

## Flow 6 — Client Reviews Proposal
```
Client receives notification: "Your Solution Proposal is ready"
   ↓
Opens Proposal page
   ↓
Options: Accept / Request Changes / Decline
   ↓
[Request Changes] → comment sent to team → Admin revises → new proposal version sent
   ↓
[Decline] → status = "Declined by Client" → request archived
   ↓
[Accept] → status = "Awaiting Payment"
```

## Flow 7 — Payment
```
Client clicks "Pay Advance"
   ↓
Selects payment method / applies coupon or referral credit
   ↓
Completes payment via Stripe
   ↓
[Success] → status = "In Progress" → Project created from Request
   ↓
[Failure] → error shown → retry option
   ↓
Invoice generated and available for download
```

## Flow 8 — Project Execution & Tracking
```
Project appears in Client's "Active Projects"
   ↓
Client can: view milestones, message team, upload extra files
   ↓
Team updates milestone status as work progresses
   ↓
Client receives notifications on each milestone update
   ↓
Internal QA review before each deliverable is released
   ↓
Deliverable released → status = "Delivered — Awaiting Review"
```

## Flow 9 — Revision Cycle
```
Client reviews delivered work
   ↓
[Approves] → proceed to Flow 10 (Closure)
   ↓
[Requests Revision] → within revision window?
   ↓── Yes → Revision request logged → team revises → re-delivers
   ↓── No → Change order quoted (new mini-proposal) → Flow 6 repeats for the change order
```

## Flow 10 — Closure
```
Client approves final delivery
   ↓
[If milestone balance remains] → Final payment collected
   ↓
Project status = "Completed"
   ↓
Client prompted to leave a review
   ↓
Referral prompt shown (share your link)
   ↓
Project archived in "Past Projects"
```

## Flow 11 — Support / Dispute
```
Client opens Support ticket or live chat
   ↓
Support agent responds
   ↓
[Resolved] → ticket closed → satisfaction rating requested
   ↓
[Unresolved / Dispute] → escalated to Project Manager
   ↓
PM proposes resolution (revision / partial refund / full refund)
   ↓
[Still unresolved] → escalated to Operations Lead → binding decision
```

## Flow 12 — Cancellation
```
Client requests cancellation from Project page
   ↓
System checks project stage
   ↓
Refund calculated per Refund Policy
   ↓
Admin confirms cancellation
   ↓
Status = "Cancelled" → refund processed (if applicable)
```

## Flow 13 — Admin Team Assignment
```
Approved Project enters "Unassigned" queue
   ↓
Admin/Ops views team workload dashboard
   ↓
Assigns project to internal expert/team
   ↓
Assigned member notified
   ↓
Member updates milestone progress as work is done
```

## Flow 14 — Referral
```
Client copies referral link from Dashboard
   ↓
Shares with a friend
   ↓
Friend signs up via link → tagged as referred
   ↓
Friend completes and pays for first project
   ↓
Referrer's account credited automatically
   ↓
Credit visible in Wallet/Credits section, redeemable on next payment
```
