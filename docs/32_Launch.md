# 32 — Launch Checklist

> The final gate before Tasork goes public. Every item below should be checked and owned by a named responsible party (even if that's a single founder wearing every hat) before flipping production live.

## 1. Domain & DNS
- [ ] Primary domain purchased and locked (registrar auto-renew enabled, WHOIS privacy on)
- [ ] DNS configured (A/CNAME records for apex + `www`, pointed to Vercel)
- [ ] Subdomain strategy confirmed if applicable (`api.`, `status.`, `blog.` if separated)
- [ ] Domain email records configured (SPF, DKIM, DMARC) for transactional email deliverability

## 2. Hosting & Infrastructure
- [ ] Production environment provisioned on Vercel (frontend) and Railway (backend/DB), per `07_Technology.md`
- [ ] Environment variables set for production (verified against `.env.example`, no staging/test values leaked in)
- [ ] Database migrated to production instance; migration history verified clean
- [ ] Redis (cache/queue) provisioned for production
- [ ] File storage (Cloudflare R2) production bucket created with correct access policies

## 3. SSL & Security
- [ ] SSL/TLS certificate active and auto-renewing (handled by Vercel/Cloudflare) on all domains and subdomains
- [ ] HTTPS enforced (HTTP → HTTPS redirect, HSTS header enabled)
- [ ] Security headers configured (CSP, X-Frame-Options, X-Content-Type-Options) per `14_Security.md`
- [ ] RBAC roles verified in production (no default/test admin accounts left active)
- [ ] Rate limiting active on public-facing auth and submission endpoints
- [ ] Pre-launch penetration test findings resolved or explicitly risk-accepted (per `30_Testing.md`)

## 4. Payments
- [ ] Stripe account fully activated (business verification complete, not in test/restricted mode)
- [ ] Live API keys set in production environment (test keys removed)
- [ ] Webhook endpoints registered and verified with live signing secrets
- [ ] Invoicing, tax handling, and refund flows tested end-to-end with a real low-value transaction
- [ ] Payout bank account verified and confirmed with Stripe

## 5. Email & Notifications
- [ ] Transactional email provider (Resend) verified sender domain, production API keys set
- [ ] All email templates (verification, password reset, proposal sent, payment receipt, etc.) tested for correct rendering and working links, per `25_Notifications.md`
- [ ] Notification triggers tested end-to-end (in-app, email) for the core project lifecycle
- [ ] Unsubscribe / notification-preference handling functional and compliant (CAN-SPAM/GDPR as applicable)

## 6. Analytics & SEO
- [ ] Plausible and PostHog production tracking IDs configured (test/dev traffic excluded from production analytics)
- [ ] Google Search Console and Bing Webmaster Tools verified for the production domain
- [ ] `sitemap.xml` and `robots.txt` live and correct (private routes disallowed, per `28_SEO.md`)
- [ ] Meta tags, OG images, and structured data spot-checked on key pages
- [ ] Core Web Vitals validated against production build (not just staging)

## 7. Monitoring & Backups
- [ ] Sentry error tracking active on production frontend and backend
- [ ] Uptime monitoring configured for production URLs with alerting to the team
- [ ] Automated daily database backups confirmed running against production
- [ ] A backup restore has been test-verified (not just assumed to work)
- [ ] Logging pipeline active and searchable for production traffic

## 8. Content & Legal
- [ ] Terms of Service, Privacy Policy, Refund Policy, and Cookie Policy published and linked in footer (matching `02_Business_Model.md` policies)
- [ ] Cookie/consent banner live and functioning correctly with analytics consent gating (per `29_Analytics.md`)
- [ ] All marketing copy proofread; no placeholder ("Lorem ipsum", "TBD") content remaining on public pages
- [ ] Contact information and support channels (email, live chat) live and monitored

## 9. Functional Verification (Smoke Test in Production)
- [ ] Full account registration + email verification flow works end-to-end
- [ ] Google OAuth login works in production (correct redirect URIs configured)
- [ ] Project submission form works, including file upload
- [ ] Admin can view and respond to a submitted request in the production admin panel
- [ ] Proposal creation, sending, and client acceptance works end-to-end
- [ ] A real (small, refundable) live payment completes successfully and appears correctly in Stripe and the internal dashboard
- [ ] Messaging between client and admin works, including attachments
- [ ] Notifications (email + in-app) fire correctly for the above actions
- [ ] Mobile responsiveness verified on real devices (not just browser emulation) for the core flows

## 10. Team Readiness
- [ ] Admin/support team trained on the admin panel and standard operating procedures
- [ ] Escalation path defined for production incidents (who gets notified, response expectations)
- [ ] Customer support channel staffed and ready to respond from hour one of launch

## 11. Go-Live
- [ ] Final staging → production deploy executed via the approved CI/CD pipeline (`31_DevOps.md`)
- [ ] DNS cutover (if migrating from a placeholder/coming-soon page) confirmed propagated
- [ ] Immediate post-launch monitoring window (first 24–48 hours) actively watched for errors, failed payments, or performance issues
- [ ] Rollback plan confirmed and ready if a critical issue is found post-launch

## 12. Post-Launch (First Week)
- [ ] Daily check of error rates, signups, and submitted requests
- [ ] First real client requests reviewed with extra care/manual oversight
- [ ] Analytics funnels (per `29_Analytics.md`) reviewed for unexpected drop-off, indicating UX friction
- [ ] Gather informal feedback from first real users and log issues for the next iteration
