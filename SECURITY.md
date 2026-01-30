# Security Policy

## Overview

This document outlines the security measures implemented in the Poll System application.

## Security Measures Implemented

### 1. Input Validation & Sanitization

#### Backend Validation
- **NoSQL Injection Prevention**: All request bodies, query parameters, and URL params are sanitized to remove MongoDB operators (`$`, `.`)
- **Text Sanitization**: User inputs are sanitized to remove control characters and harmful content
- **Length Limits**: All text inputs have maximum length restrictions
  - Names: 100 characters max
  - Phone numbers: 20 characters max
  - Search queries: 100 characters max
- **Regex Escaping**: Search queries are escaped to prevent ReDoS attacks

#### Frontend Validation
- Phone number format validation
- Name length validation (2-100 characters)
- Required field validation

### 2. Rate Limiting

Multiple rate limiters protect different endpoints:

- **Vote Submission**: 10 requests per 15 minutes per IP
- **Admin Endpoints**: 100 requests per hour
- **PDF Export**: 20 exports per hour
- **General API**: 100 requests per 15 minutes

### 3. Database Security

#### MongoDB Security
- **Unique Constraints**: Phone numbers must be unique
- **Normalized Names**: Arabic text normalization prevents duplicate entries with diacritics
- **Indexed Fields**: Optimized queries prevent performance attacks
- **Schema Validation**: Mongoose schema enforces data types and constraints

#### Data Validation
- Phone number regex validation
- Answer enum validation (only "Yes" or "No")
- Date validation and sanitization

### 4. CORS Configuration

- **Origin Whitelist**: Only specified origins are allowed
- **No Wildcard Origins**: Production environment has strict origin checking
- **Credentials**: Properly configured for secure cross-origin requests
- **Development Mode**: Separate configuration for development

### 5. HTTP Security Headers

- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **X-XSS-Protection**: 1; mode=block - Enables XSS filtering
- **Referrer-Policy**: strict-origin-when-cross-origin - Controls referrer information
- **Content-Security-Policy**: Restricts resource loading to prevent XSS
- **X-Powered-By**: Removed - Hides server technology

### 6. Request Size Limits

- **JSON Body**: Limited to 1MB
- **URL Encoded**: Limited to 1MB
- **Prevents**: DoS attacks via large payloads

### 7. PDF Generation Security

#### Input Sanitization
- All user data is sanitized before PDF generation
- Text length limits enforced
- Control characters removed
- Phone numbers validated and cleaned

#### DoS Prevention
- **Maximum Votes**: 10,000 votes per PDF
- **Table Rows**: Limited to 1,000 rows
- **Font Loading**: Error handling for missing fonts
- **Buffer Management**: Proper stream handling

#### Safe Operations
- No user input in font paths
- Static font paths only
- Validation of all pollInfo fields
- Date sanitization and validation

### 8. Error Handling

- **Production Mode**: Generic error messages only
- **Development Mode**: Detailed errors for debugging
- **No Stack Traces**: Stack traces hidden in production
- **Logging**: Errors logged server-side only

### 9. Authentication & Authorization

Current Implementation:
- Vote submission is rate-limited
- Admin endpoints have separate rate limits
- No authentication required (by design for public voting)

Future Enhancements (Optional):
- Add JWT authentication for admin panel
- Implement role-based access control (RBAC)
- Add API keys for external integrations

## Vulnerability Assessments

### Fixed Vulnerabilities

1. **NoSQL Injection** ✓
   - Status: Fixed
   - Solution: Input sanitization middleware

2. **DoS via Large Payloads** ✓
   - Status: Fixed
   - Solution: Request body size limits

3. **DoS via Large PDFs** ✓
   - Status: Fixed
   - Solution: PDF generation limits

4. **XSS (Cross-Site Scripting)** ✓
   - Status: Fixed
   - Solution: Input sanitization + CSP headers

5. **CSRF (Cross-Site Request Forgery)** ✓
   - Status: Mitigated
   - Solution: Strict CORS + SameSite cookies

6. **Rate Limiting** ✓
   - Status: Fixed
   - Solution: Multiple rate limiters

7. **Information Disclosure** ✓
   - Status: Fixed
   - Solution: Removed server headers, hide errors in production

8. **ReDoS (Regular Expression DoS)** ✓
   - Status: Fixed
   - Solution: Regex escaping on search queries

### Known Limitations

1. **No Authentication**: Public voting system (by design)
2. **IP-based Rate Limiting**: Can be bypassed with VPN/proxy
3. **MongoDB Injection**: Sanitization is defensive, keep Mongoose updated

## Environment Variables Security

### Required Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
```

### Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Use strong MongoDB passwords** - 16+ characters, mixed case, numbers, symbols
3. **Whitelist IPs in MongoDB Atlas** - For production, use specific IPs if possible
4. **Rotate credentials regularly** - Change passwords and connection strings periodically
5. **Use separate databases** - Development, staging, and production should be separate

## Deployment Security

### Vercel Deployment

1. **Environment Variables**: Set via Vercel dashboard, never in code
2. **HTTPS Enforced**: All traffic encrypted
3. **Automatic Security Headers**: Vercel adds additional headers
4. **DDoS Protection**: Vercel provides edge network protection

### MongoDB Atlas

1. **Network Access**: IP whitelist configured
2. **Database Users**: Separate users with minimal permissions
3. **Encryption**: At-rest and in-transit encryption enabled
4. **Monitoring**: Enable Atlas monitoring and alerts

## Monitoring & Logging

### Current Logging

- Error logging to console
- CORS blocking logged
- Rate limit violations logged
- PDF generation warnings logged

### Recommended Monitoring

1. **Error Tracking**: Sentry, LogRocket, or similar
2. **Performance Monitoring**: New Relic, DataDog
3. **Security Monitoring**: Watch for unusual patterns
4. **Database Monitoring**: MongoDB Atlas monitoring

## Incident Response

### If You Discover a Vulnerability

1. **Do NOT** open a public GitHub issue
2. Email: hussamshannan5@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Assessment of severity
- **7 days**: Fix deployed (critical issues)
- **30 days**: Fix deployed (non-critical issues)

## Security Checklist for Developers

Before deploying:

- [ ] All environment variables set correctly
- [ ] NODE_ENV=production in production
- [ ] MongoDB connection string is secure
- [ ] CORS origins properly configured
- [ ] Rate limiters tested
- [ ] Input validation working
- [ ] Error handling hides sensitive info
- [ ] Security headers configured
- [ ] Dependencies updated (npm audit)
- [ ] No credentials in code
- [ ] .env files in .gitignore

## Regular Security Maintenance

### Weekly
- [ ] Review error logs for anomalies
- [ ] Check rate limit violations

### Monthly
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review access logs for suspicious patterns
- [ ] Update dependencies

### Quarterly
- [ ] Security assessment
- [ ] Penetration testing (if applicable)
- [ ] Review and update security policies
- [ ] Rotate API keys and tokens

## Dependencies Security

### Keeping Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Critical Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **pdfkit**: PDF generation
- **express-rate-limit**: Rate limiting
- **cors**: CORS handling
- **validator**: Input validation

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## License

This security policy is part of the Poll System project and is subject to the same license.

---

**Last Updated**: 2026-01-30
**Version**: 1.0.0
