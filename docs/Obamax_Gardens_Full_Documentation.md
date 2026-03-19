# Obamax Gardens Management Software - Full Documentation

## 1. Document Purpose

This document is the complete guide for using, administering, deploying, and troubleshooting Obamax Gardens Management Software.

## 2. Product Overview

Obamax Gardens Management Software is an integrated business platform for:

- Hotel management
- Restaurant management
- Bar management
- Staff and worker management
- AI-powered operational assistance
- Web and desktop app access

## 3. Company and Ownership

- Software Name: Obamax Gardens Management Software
- Developed By: Gothtech Consult
- Deployment Type: Laravel web app plus Electron desktop app

## 4. Access Points

- Main web URL: https://www.obamaxgardens.com
- Login page: https://www.obamaxgardens.com/login
- Desktop download routes:
  - https://www.obamaxgardens.com/download/desktop/zip
  - https://www.obamaxgardens.com/download/desktop/exe

## 5. Roles and Access

Typical users include:

- Manager
- Admin
- Operational staff (based on account privileges)

Only authenticated users can access operational modules.

## 6. Main Features and Modules

### 6.1 Dashboard

Provides operational overview including:

- Daily revenue summary
- Monthly revenue summary
- Active workers and rooms
- Low-stock drink indicators
- Recent activity snapshots

### 6.2 Worker Management

Functions:

- Add worker
- Edit worker details
- Activate or deactivate worker
- Delete worker

Use this module for staff lifecycle management.

### 6.3 Bar Module

Functions:

- Drinks master list management
- Depot inventory entries
- Issuance to bar
- Stock taking
- Daily closing

Expected outputs:

- Current stock levels
- Issuance history
- Daily closing totals

### 6.4 Restaurant Module

Functions:

- Tracked item management
- Kitchen issuance records
- Inventory updates
- Daily closing/reporting

Expected outputs:

- Cost and issuance visibility
- Daily report consistency

### 6.5 Hotel Module

Functions:

- Room setup and room status
- Booking records
- Hotel closing records

Expected outputs:

- Daily and monthly booking and payment insights

### 6.6 Archive and Monthly Summary

Functions:

- Historical records for restaurant, hotel, and bar
- Monthly performance visibility

Use this for reporting, review, and audit support.

### 6.7 AI Assistant

Functions:

- Answers operational questions using available live business data
- Supports prompts such as revenue, stock, workers, bookings, updates, and module guidance

Typical questions:

- Any low stock drinks?
- What is today's total revenue?
- How can I use this software?

## 7. How To Use the System

### 7.1 Login

1. Open https://www.obamaxgardens.com/login
2. Enter your email and password
3. Click Sign In to Dashboard

### 7.2 Daily Recommended Workflow

1. Check Dashboard first
2. Update worker status if needed
3. Record new stock or issuance
4. Enter bookings and room updates
5. Complete bar and restaurant closing
6. Review AI Assistant insights
7. Confirm archive records

### 7.3 Download Desktop App

Users can download directly from:

- Floating Download Desktop App button on the web interface
- Direct route: /download/desktop/zip
- Direct route: /download/desktop/exe

## 8. Desktop App Behavior

The desktop app loads the live web system URL.

If live pages fail to load, offline fallback messaging appears.

Download buttons are configured for web use and should not appear in desktop runtime when production blade logic is up to date.

## 9. Environment and Deployment Guide

### 9.1 DNS and Domain

Production domain must resolve to the active hosting server IP.

Nameserver and DNS propagation can take time globally.

### 9.2 SSL and HTTPS

Requirements:

- Valid SSL certificate on obamaxgardens.com and www.obamaxgardens.com
- Force HTTPS active in public/.htaccess

### 9.3 Required .env Production Values

Use these production-oriented settings:

- APP_URL=https://www.obamaxgardens.com
- SESSION_SECURE_COOKIE=true
- SESSION_DOMAIN=.obamaxgardens.com
- GEMINI_API_KEY=your_active_key

### 9.4 Cache Clear Endpoint

After config or deployment changes, run:

- https://www.obamaxgardens.com/clear-cache

This clears config, route, view, and optimize caches.

## 10. AI Assistant Technical Notes

Current assistant behavior includes:

- Snapshot generation from operational data
- External model response call with graceful fallback
- Error handling for unavailable services

If AI provider fails, fallback response is returned instead of crashing the module.

## 11. Troubleshooting Guide

### 11.1 404 on Desktop Download

Symptoms:

- Clicking download returns 404

Actions:

1. Ensure these files exist on server:
   - /home/obamaxga/public_html/public/downloads/Obamax_Gardens_App.zip
   - /home/obamaxga/public_html/public/downloads/Obamax_Gardens_Setup.exe
2. Confirm latest routes/web.php is deployed
3. Run /clear-cache

### 11.2 CSRF Token Mismatch

Symptoms:

- Form requests fail with CSRF mismatch

Actions:

1. Confirm APP_URL and SESSION_DOMAIN are correct
2. Confirm HTTPS settings are correct
3. Clear cache and hard refresh browser

### 11.3 Login or Session Issues

Actions:

1. Verify APP_URL uses current production domain
2. Verify HTTPS and SSL are active
3. Verify session cookie configuration
4. Clear cache

### 11.4 AI Assistant Returns Fallback Response

Symptoms:

- Assistant says it cannot connect to AI service

Actions:

1. Verify GEMINI_API_KEY is valid in .env
2. Confirm outbound internet from server
3. Check storage/logs/laravel.log for errors
4. Confirm current assistant service file is deployed

### 11.5 Logo or Favicon Not Showing

Actions:

1. Confirm files exist:
   - /public/logo.png
   - /public/logo.jpg
2. Confirm app blade meta and favicon links are updated
3. Hard refresh browser or open private window

### 11.6 Not Secure Browser Warning

Actions:

1. Install SSL certificate in hosting panel
2. Force HTTPS redirect in public/.htaccess
3. Use only https URLs in production

## 12. Security and Operational Best Practices

- Remove temporary admin reset routes after stabilization
- Rotate API keys if exposed
- Use strong passwords and role-based access
- Keep dependencies updated
- Back up database and uploads regularly
- Restrict who can access deployment credentials

## 13. Backup and Recovery Recommendations

Minimum backup strategy:

- Daily database backup
- Weekly full application backup
- Keep copies of:
  - .env
  - public/downloads files
  - latest build assets

Recovery checklist:

1. Restore codebase
2. Restore .env
3. Restore database
4. Restore public assets and downloads
5. Run cache clear endpoint
6. Verify login, dashboard, and assistant

## 14. Maintenance Checklist

Daily:

- Check dashboard values
- Verify worker and stock updates

Weekly:

- Review logs for repeated errors
- Validate archive consistency

Monthly:

- Verify backup restoration process
- Validate desktop download files are still reachable
- Review user accounts and security

## 15. Change Management

When deploying updates:

1. Upload changed files
2. Upload updated public/build assets if frontend changed
3. Run /clear-cache
4. Test login, dashboard, key modules, assistant, and download links

## 16. Acceptance Test Script

Use this quick script after major updates:

1. Open login page
2. Log in successfully
3. Add or edit a worker
4. Record one module transaction (bar, restaurant, or hotel)
5. Ask assistant a business question
6. Download desktop app from web button
7. Confirm no major errors in logs

## 17. Support and Escalation

Primary support provider:

- Gothtech Consult

When reporting an issue, include:

- Exact URL
- Screenshot
- Time of issue
- Error text
- Steps to reproduce

## 18. Appendix: Key File Locations

Project root examples:

- routes/web.php
- app/Http/Middleware/HandleInertiaRequests.php
- app/Services/ProjectAssistantService.php
- resources/views/app.blade.php
- resources/js/Pages/Auth/Login.jsx
- public/downloads/
- public/build/

## 19. Documentation Version

- Version: 1.0
- Date: 2026-03-14
- Owner: Gothtech Consult
