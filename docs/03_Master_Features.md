# 03 — Master Features List

Legend: (F) = future phase, not MVP

---

## A. Guest (Not Logged In)
1. Landing page
2. How It Works section
3. Services/categories overview
4. Pricing philosophy page (no fixed prices, explains custom-quote model)
5. Testimonials/reviews carousel
6. FAQ page
7. Blog listing + article pages
8. Contact form
9. Submit a Solution Request (guest intake, account created on submit)
10. Global search (blog/help content)
11. Dark mode toggle
12. Language switch (F)
13. Newsletter signup
14. Live chat widget
15. Cookie consent banner
16. Trust badges (security, payment, satisfaction)
17. Careers/About page
18. Terms of Service / Privacy Policy pages
19. Referral landing page
20. Social proof counters (projects delivered, clients served)

## B. Customer (Authenticated)
### Account & Profile
21. Register (email/password)
22. Register via Google/OAuth (F)
23. Login
24. Email verification
25. Forgot/reset password
26. Two-factor authentication (F)
27. Edit profile (name, avatar, contact info)
28. Change password
29. Manage notification preferences
30. Manage linked payment methods
31. Delete/deactivate account
32. Session management (view/revoke active sessions)

### Solution Requests
33. Submit new Solution Request (multi-step form)
34. Save request as draft
35. Upload multiple files/attachments per request
36. Select category/subcategory
37. Set budget expectation (optional, non-binding)
38. Set desired deadline
39. View request status (Pending / In Review / Approved / Declined / Proposal Sent)
40. Edit request before review starts
41. Withdraw/cancel a pending request
42. Duplicate a previous request

### Proposals
43. View Solution Proposal (price, scope, timeline, deliverables, revisions, payment plan)
44. Accept proposal
45. Request changes to proposal (comment thread)
46. Decline proposal
47. Download proposal as PDF
48. Proposal expiry countdown

### Payments
49. Pay advance/deposit
50. Pay milestone payments
51. Pay final balance
52. View invoice history
53. Download invoice/receipt PDF
54. Apply coupon code
55. Apply referral credit
56. Multiple payment methods (card, wallet)
57. Auto-retry failed payment (F)
58. View payment status per milestone

### Project Tracking
59. Project dashboard (all active/past projects)
60. Project detail page (timeline, status, files, team)
61. Milestone progress bar
62. Real-time status updates
63. View assigned team/point of contact (role-level, not necessarily named individual)
64. Project activity log/timeline
65. Upload additional files mid-project
66. Download delivered files
67. Request revision (within window)
68. Approve/accept final delivery
69. Mark project as completed
70. Reopen a closed project for a new related request (F)

### Messaging
71. In-project messaging thread with the team
72. File attachments in messages
73. Read receipts / typing indicators (F)
74. Message notifications (in-app, email)
75. Message search within a project

### Notifications
76. In-app notification center
77. Email notifications (status changes, proposals, payments, messages)
78. SMS notifications (F)
79. Notification preference controls (per category)

### Reviews & Referrals
80. Leave a review/rating after project completion
81. Edit submitted review (within limited window)
82. View own referral link and stats
83. View earned referral credits
84. Redeem referral credit toward a new project

### Support
85. Open a support ticket
86. Live chat with support
87. View support ticket history
88. Rate support interaction

### Misc
89. Dark mode preference (persisted)
90. Download all project data (data export) (F)
91. Multi-currency display (F)
92. Saved/bookmarked blog articles (F)

## C. Admin
93. Admin dashboard (KPIs: requests, revenue, active projects, pending review)
94. Review incoming Solution Requests
95. Approve/decline requests with reason
96. Assign request to internal reviewer/estimator
97. Build/send Solution Proposal (price, timeline, deliverables, milestones)
98. Edit/withdraw a sent proposal
99. Assign approved project to internal team/expert
100. Manage project status pipeline (Kanban-style)
101. View/manage all client accounts
102. Suspend/ban a client account
103. Manage all payments and refunds
104. Issue manual refund
105. Manage invoices
106. Manage coupons (create/edit/expire)
107. Manage referral program settings
108. Manage categories/services taxonomy
109. Manage pricing rubric/effort-estimation presets
110. View/respond to support tickets
111. View/moderate reviews
112. Manage CMS content (blog, FAQ, pages)
113. Manage testimonials shown on site
114. Manage team members and roles (RBAC)
115. View audit logs
116. View analytics/reports (revenue, conversion, satisfaction)
117. Manage notification templates
118. Manage system-wide announcements/banners
119. Export data (CSV/Excel) for requests, payments, users
120. Manage SEO settings per page
121. Impersonate user for support/debugging (with audit trail) (F)
122. Dispute resolution workspace

## D. Super Admin
123. Everything in Admin, plus:
124. Manage Admin/staff accounts and permissions
125. Configure global platform settings (fees, currency, tax rules)
126. Configure payment gateway credentials/integrations
127. Configure email/SMS provider integrations
128. Manage feature flags
129. View system health/monitoring dashboard
130. Full audit trail across all roles
131. Manage security policies (password rules, session timeouts, 2FA enforcement)
132. Database backup/restore controls
133. Manage API keys for integrations/partners (F)

## E. Support (Staff Role)
134. Support ticket queue (assigned to me / unassigned)
135. Reply to tickets
136. Escalate ticket to Ops Lead/Admin
137. View (read-only) relevant project/payment context for a ticket
138. Internal notes on tickets (not visible to client)
139. Tag/categorize tickets
140. Close/reopen tickets
141. Support performance metrics (response time, resolution time)

## F. Notification System
142. Event-driven triggers (status change, new message, payment, proposal sent, etc.)
143. Multi-channel delivery (in-app, email, SMS future)
144. User-level preference matrix (per event type, per channel)
145. Templated, brandable notification content (Admin-editable)
146. Digest mode (daily/weekly summary) (F)
147. Delivery status tracking (sent/failed/opened where available)

## G. Analytics
148. Traffic and conversion analytics (marketing site)
149. Funnel analytics (request → proposal → payment → completion)
150. Revenue analytics (by period, category, team)
151. Client satisfaction/NPS tracking
152. Team performance analytics (turnaround time, revision rate)
153. Cohort/retention analytics (F)
154. Custom report builder (F)

## H. Payment System
155. Stripe integration (cards, wallets)
156. Milestone-based payment scheduling
157. Automatic invoice generation
158. Coupon/discount engine
159. Referral credit engine
160. Refund processing workflow
161. Tax calculation (region-based) (F)
162. Multi-currency support (F)
163. Payout management for internal contractors (F)

## I. Project Management (Internal)
164. Request intake queue
165. Effort/complexity estimation tool
166. Proposal builder/templates
167. Internal task breakdown per project
168. Team/expert assignment and workload view
169. Milestone and deadline tracking
170. Internal QA checklist per deliverable
171. File versioning for deliverables
172. Internal notes per project (not client-visible)

## J. Messaging (Platform-wide)
173. Client ↔ Team threaded messaging per project
174. Internal staff-only channels per project
175. File sharing within messages
176. Notification integration
177. Message moderation/audit (Admin)

## K. CMS
178. Blog post CRUD with rich text editor
179. FAQ CRUD
180. Testimonials CRUD
181. Static page CRUD (About, Terms, Privacy)
182. Media library for uploaded assets
183. Draft/publish/schedule workflow
184. SEO metadata fields per content item

## L. SEO
185. Per-page meta title/description control
186. Auto-generated sitemap.xml
187. robots.txt configuration
188. Open Graph / Twitter card metadata
189. Canonical URL management
190. Structured data (JSON-LD) for reviews, FAQ, organization
191. Clean, slug-based URLs

## M. Security
192. JWT-based authentication with refresh tokens
193. Role-Based Access Control (RBAC)
194. CSRF protection
195. XSS protection (input sanitization/CSP)
196. SQL injection prevention (parameterized queries/ORM)
197. Rate limiting (login, submission, API)
198. File upload validation (type, size, malware scan)
199. Password hashing (Argon2)
200. Two-factor authentication (F)
201. Audit logs for sensitive actions
202. Session management and forced logout
203. Automated backups and disaster recovery
