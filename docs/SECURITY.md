# 🔐 Security Guide - GPT-5 MCP Server

**Version**: 1.0.0
**Last Updated**: 2026-05-15

---

## 📋 User Security Responsibilities

### 1. API Key Management

#### ✅ DO:
- **Store API keys in environment variables** only
- **Use separate keys** for development and production
- **Rotate keys regularly** (recommended: every 90 days)
- **Set key permissions** to minimum required (read-only if possible)
- **Monitor key usage** through your API provider dashboard
- **Revoke compromised keys** immediately

#### ❌ DON'T:
- Never commit API keys to git
- Never share keys via email/chat
- Never hardcode keys in source code
- Never use production keys in development
- Never reuse keys across projects

#### Implementation:
```bash
# Good: Use .env file (gitignored)
GPT5_API_KEY=sk-your-key-here
GPT5_API_URL=https://api.example.com/v1

# Bad: Hardcoded in code
const apiKey = "sk-your-key-here"; // ❌ NEVER DO THIS
```

---

### 2. Key Rotation Schedule

#### Recommended Schedule:
```
Regular rotation:     Every 90 days
After team changes:   Immediately
After breach:         Immediately
Compliance required:  Per policy
```

#### Rotation Process:
1. Generate new API key from provider
2. Update `.env` file with new key
3. Restart MCP server
4. Verify functionality
5. Revoke old key after 24 hours
6. Document rotation in security log

#### Automation Script:
```bash
#!/bin/bash
# key-rotation.sh

echo "🔄 Starting API key rotation..."

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d)

# Prompt for new key
read -sp "Enter new API key: " NEW_KEY
echo

# Update .env
sed -i "s/GPT5_API_KEY=.*/GPT5_API_KEY=$NEW_KEY/" .env

# Restart server
echo "🔄 Restarting server..."
./restart-server.sh

echo "✅ Key rotation complete!"
echo "⚠️  Remember to revoke old key in 24 hours"
```

---

### 3. Access Control

#### File Permissions:
```bash
# Secure .env file
chmod 600 .env
chown $USER:$USER .env

# Secure config files
chmod 600 ~/.antigravity/mcp.json
chmod 700 ~/.antigravity

# Verify permissions
ls -la .env
# Should show: -rw------- (600)
```

#### User Access:
- **Limit server access** to authorized users only
- **Use separate user accounts** for production
- **Implement sudo policies** for sensitive operations
- **Log all access attempts**

---

### 4. Network Security

#### Firewall Rules:
```bash
# Only allow localhost connections
sudo ufw allow from 127.0.0.1 to any port 3000

# Block external access
sudo ufw deny from any to any port 3000

# Verify rules
sudo ufw status
```

#### HTTPS Only:
```bash
# In .env, always use HTTPS endpoints
GPT5_API_URL=https://api.example.com/v1  # ✅ Good
GPT5_API_URL=http://api.example.com/v1   # ❌ Bad
```

---

### 5. Monitoring & Auditing

#### What to Monitor:
- **API usage patterns** - Detect unusual spikes
- **Error rates** - Identify potential attacks
- **Response times** - Detect performance issues
- **Failed authentication** - Track unauthorized access
- **Cost trends** - Prevent budget overruns

#### Monitoring Setup:
```typescript
// Enable monitoring in your server
import { monitor } from './enhancements/monitoring.js';

// Export metrics daily
setInterval(() => {
  const metrics = monitor.exportMetrics();
  fs.writeFileSync(
    `logs/metrics-${new Date().toISOString().split('T')[0]}.json`,
    metrics
  );
}, 24 * 60 * 60 * 1000);
```

#### Alert Thresholds:
```javascript
// Set up alerts
const ALERT_THRESHOLDS = {
  errorRate: 10,        // Alert if >10% errors
  costPerDay: 50,       // Alert if >$50/day
  requestsPerMin: 100,  // Alert if >100 req/min
  failedAuth: 5,        // Alert if >5 failed auth
};
```

---

### 6. Backup & Recovery

#### What to Backup:
- ✅ Configuration files (`.env`, `mcp.json`)
- ✅ Custom code modifications
- ✅ Monitoring logs
- ✅ Cache data (optional)

#### Backup Script:
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="$HOME/backups/gpt5-mcp-server"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup configs (without secrets)
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='dist' \
  .

# Backup .env separately (encrypted)
gpg --symmetric --cipher-algo AES256 \
  -o "$BACKUP_DIR/env-$DATE.gpg" \
  .env

echo "✅ Backup complete: $BACKUP_DIR"
```

#### Recovery Process:
1. Restore configuration files
2. Decrypt `.env` file
3. Verify API key validity
4. Test server functionality
5. Resume normal operations

---

### 7. Incident Response

#### If API Key is Compromised:

**Immediate Actions (within 5 minutes):**
1. ✅ Revoke compromised key immediately
2. ✅ Generate new key
3. ✅ Update `.env` file
4. ✅ Restart server
5. ✅ Check for unauthorized usage

**Investigation (within 1 hour):**
1. Review access logs
2. Identify breach source
3. Check for data exfiltration
4. Document incident timeline
5. Assess damage

**Follow-up (within 24 hours):**
1. Implement additional security measures
2. Update security policies
3. Train team on prevention
4. Report to management
5. Update incident response plan

#### Incident Response Template:
```markdown
# Security Incident Report

**Date**: YYYY-MM-DD
**Time**: HH:MM UTC
**Severity**: Critical/High/Medium/Low

## Incident Description
[What happened]

## Impact Assessment
- Systems affected: [list]
- Data compromised: [yes/no]
- Estimated cost: $[amount]

## Actions Taken
1. [Action 1]
2. [Action 2]

## Root Cause
[Why it happened]

## Prevention Measures
[How to prevent in future]
```

---

### 8. Compliance & Best Practices

#### Security Checklist:
```
Daily:
  [ ] Monitor API usage
  [ ] Check error logs
  [ ] Verify server health

Weekly:
  [ ] Review access logs
  [ ] Check for updates
  [ ] Backup configurations

Monthly:
  [ ] Review security policies
  [ ] Update dependencies
  [ ] Test incident response

Quarterly:
  [ ] Rotate API keys
  [ ] Security audit
  [ ] Team training
```

#### Compliance Requirements:
- **GDPR**: If processing EU user data
- **SOC 2**: For enterprise deployments
- **HIPAA**: If handling health data
- **PCI DSS**: If processing payments

---

### 9. Secure Development Practices

#### Code Review:
- ✅ Review all code changes
- ✅ Check for hardcoded secrets
- ✅ Verify input validation
- ✅ Test error handling
- ✅ Scan for vulnerabilities

#### Dependency Management:
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

---

### 10. Security Tools & Resources

#### Recommended Tools:
- **git-secrets**: Prevent committing secrets
- **truffleHog**: Scan for secrets in git history
- **npm audit**: Check for vulnerable dependencies
- **OWASP ZAP**: Security testing
- **Fail2ban**: Prevent brute force attacks

#### Installation:
```bash
# Install git-secrets
brew install git-secrets  # macOS
apt-get install git-secrets  # Ubuntu

# Configure for repo
cd gpt5-mcp-server
git secrets --install
git secrets --register-aws
```

#### Resources:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 🚨 Emergency Contacts

```
Security Team:     security@your-company.com
On-Call:          +1-XXX-XXX-XXXX
Incident Report:  https://your-company.com/security/report
API Provider:     support@api-provider.com
```

---

## 📝 Security Audit Log

Keep a log of all security-related activities:

```
Date       | Action              | User    | Status
-----------|---------------------|---------|--------
2026-05-15 | Key rotation        | admin   | Success
2026-05-15 | Security audit      | admin   | Pass
2026-05-15 | Backup created      | system  | Success
```

---

## ✅ Security Certification

After implementing all security measures:

```
I, [Your Name], certify that:
✅ All API keys are stored securely
✅ Key rotation schedule is in place
✅ Monitoring is enabled
✅ Backups are configured
✅ Incident response plan is documented
✅ Team is trained on security practices

Signed: ________________
Date: __________________
```

---

**Remember**: Security is an ongoing process, not a one-time setup!

**Questions?** Review this guide regularly and update as needed.

---

**Document Version**: 1.0.0
**Last Review**: 2026-05-15
**Next Review**: 2026-08-15
