# Family Hub - Operations & Maintenance

## Daily Operations

### User Management

#### Create New User (via Admin Panel)

1. Login with admin account
2. Navigate to Admin → Users
3. Click "Create New User"
4. Fill in:
   - Name
   - Email
   - Role (teacher, student, parent)
5. System generates temporary password
6. Share credentials with user securely

#### Reset User Password

1. Admin panel → Users
2. Find user in list
3. Click "Reset Password"
4. System emails new temporary password

#### Deactivate/Delete User

1. Admin panel → Users
2. Click user's delete button
3. Confirm - this is irreversible
4. Historical data is preserved

---

### Class Management

#### Create New Class

Classes are managed by teachers. To create a new class:

1. Teacher logs in
2. Teacher → Enroll Student
3. Select class from dropdown
4. If class doesn't exist, it's auto-created on first student enrollment

#### View Class Roster

1. Teacher → Dashboard
2. "एकूण विद्यार्थी" shows class size
3. Students list shows names, rolls, parents

---

### Daily Attendance

#### Mark Attendance

1. Teacher logs in → Attendance
2. Select date (defaults to today)
3. Mark each student: Present / Absent / Late
4. Click "Save Attendance"
5. System records with timestamp and teacher ID

#### View Attendance History

1. Teacher → Attendance
2. Select past date
3. View who was marked absent
4. Export as report if needed

#### Generate Attendance Report

```bash
# Backend utility (future feature)
npm run generate-report attendance 2024-01-01 2024-01-31
```

---

### Homework Management

#### Assign Homework

1. Teacher → Homework
2. Click "नवीन गृहपाठ" (New Homework)
3. Fill in:
   - Subject
   - Class
   - Title
   - Description
   - Due date (optional)
4. Click "पाठवा" (Submit)

#### Track Homework Status

1. Teacher → Homework
2. View list of assigned homework
3. Click on homework to see submission status
4. Mark as reviewed when complete

#### Student Homework Submission

1. Student logs in → Homework
2. View assigned homework for their class
3. Update status: "In Progress" → "Completed"
4. System records with timestamp

---

## Weekly Tasks

### Backup Verification

```bash
# Check latest backup
ls -lt /backups/ | head -5

# Verify backup integrity
mongodump --uri="mongodb:/..." --archive \
  --out=/tmp/verify.archive

# Test restore (to temporary database)
mongorestore --uri="mongodb://..." \
  /tmp/verify.archive
```

### Performance Monitoring

```bash
# Check database size
mongo family_hub
use family_hub
db.stats()
```

Healthy size:
- <100 MB: Small installation
- 100 MB - 1 GB: Medium (3000+ students)
- >1 GB: Consider archiving old records

---

### Security Review

- [ ] Check for failed login attempts
- [ ] Review active user sessions
- [ ] Verify no default credentials still in use
- [ ] Check error logs for suspicious activity

---

## Monthly Tasks

### Database Maintenance

#### Optimize Indexes

```bash
# Connect to database
mongosh family_hub

# Check index usage
db.collection.aggregate([
  { $indexStats: {} }
])
```

#### Archive Old Records

```bash
# Move records older than 1 year to archive
db.attendance.updateMany(
  { createdAt: { $lt: new Date(Date.now() - 365*24*60*60*1000) } },
  { $set: { archived: true } }
)
```

#### Compact Database

```bash
# Self-hosted MongoDB only
db.runCommand({ compact: 'collection_name' })
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Check for security vulnerabilities
npm audit
npm audit fix  # Fix automatically if safe

# Update vulnerable packages
npm install package@version
```

### Generate Reports

#### Student Performance Report

```javascript
// Query template
db.scores.aggregate([
  { $match: { date: { $gte: ISODate("2024-01-01") } } },
  { $group: {
      _id: "$studentId",
      avgScore: { $avg: "$scorePercent" },
      testCount: { $sum: 1 }
  }}
])
```

#### Attendance Report

```javascript
db.attendance.aggregate([
  { $match: { status: "absent" } },
  { $group: {
      _id: "$studentId",
      absenceCount: { $sum: 1 }
  }}
])
```

---

## Quarterly Tasks

### Security Audit

- [ ] Review all user accounts
- [ ] Check for inactive accounts (>90 days)
- [ ] Rotate JWT_SECRET
- [ ] Update security headers
- [ ] Run vulnerability scan
- [ ] Review access logs

### Performance Optimization

- [ ] Analyze slow queries
- [ ] Review database indexes again
- [ ] Optimize API response times
- [ ] Check frontend bundle size
- [ ] Review error logs for patterns

### Documentation Update

- [ ] Update CHANGELOG
- [ ] Review and update guides
- [ ] Document any new features
- [ ] Update troubleshooting guide

---

## Incident Response

### Database Corruption

**Symptoms**: Errors on data access, data inconsistencies

**Recovery**:
```bash
# 1. Stop application
pm2 stop all

# 2. Restore from latest backup
mongorestore --uri="mongodb://..." /path/to/backup

# 3. Verify data
mongosh family_hub
db.users.count()  # Check some counts

# 4. Restart application
pm2 start all

# 5. Test thoroughly before allowing users
```

### Disk Space Full

**Symptoms**: "No space left on device" errors

**Solution**:
```bash
# Find large files
du -sh /* | sort -rh

# Archive old logs
gzip /var/log/family-hub/*.log

# Delete temporary files
rm -rf /tmp/*

# MongoDB: Run cleanup if self-hosted
db.adminCommand({ cleanupOrphaned: 'collection_name' })
```

### Slow Performance

**Symptoms**: API times out, pages load slowly

**Debug**:
```bash
# Check CPU/Memory
top  # or Task Manager on Windows

# Check database performance
mongostat
mongotop

# Check application logs
pm2 logs family-hub-api
```

**Solutions**:
1. Increase server resources
2. Add database indexes
3. Scale horizontally (multiple API instances)
4. Enable caching layer

### Security Breach

**Immediate Actions**:
1. Rotate JWT_SECRET
2. Reset all user passwords
3. Review access logs for unauthorized access
4. Restore from backup if needed
5. Update credentials for external services

---

## Scheduled Jobs

### Automatic Backups

```bash
# Edit crontab
crontab -e

# Add:
0 2 * * * mongodump --uri="mongodb://..." \
  --out=/backups/family-hub-$(date +\%Y\%m\%d)

# Delete backups older than 30 days
0 3 * * * find /backups -mtime +30 -delete
```

### Cleanup Old Records

```bash
# Delete session logs older than 90 days
0 4 * * 0 mongo family_hub --eval \
  "db.sessions.deleteMany({ createdAt: { \$lt: new Date(Date.now() - 90*24*60*60*1000) } })"
```

### Health Checks

```bash
# Monitor endpoints
0 */6 * * * curl -f http://localhost:5000/api/health \
  || send_alert "API down"
```

---

## Monitoring Dashboards

### Key Metrics to Monitor

**Backend Performance**:
- API response time (target: <200ms)
- Error rate (target: <0.1%)
- CPU usage (target: <70%)
- Memory usage (target: <80%)

**Database Health**:
- Query time (target: <100ms)
- Storage used (alert: >90% capacity)
- Connection count (target: <100)

**Application Health**:
- Active users online
- Failed login attempts
- Resource consumption

### Monitoring Tools

**Free Options**:
- PM2 Plus (basic monitoring)
- Uptime Robot (endpoint monitoring)
- Google Analytics (frontend usage)

**Paid Options**:
- New Relic
- DataDog
- Sentry (error tracking)
- CloudWatch (AWS)

---

## Communication

### Alert Recipients

| Alert | Recipient | Frequency |
|-------|-----------|-----------|
| System Down | Dev Team | Immediate |
| Backup Failed | Admin | Daily digest |
| High CPU | Ops Team | When >90% |
| Storage Full | Admin | Immediate |
| Security Issue | Security Lead | Immediate |

### Status Page

Maintain a status page at: `https://status.your-domain.com`

Update during:
- Maintenance windows
- Outages
- Major incidents

---

## Disaster Recovery Procedures

### Scenario: Complete Data Loss

**RTO**: <2 hours  
**RPO**: <24 hours

1. Restore database from latest backup
2. Restore application from GitHub
3. Verify all data integrity
4. Notify users if data loss

### Scenario: Application Server Down

**RTO**: <30 minutes  
**RPO**: 0 (no data loss)

1. Restart server/container
2. Verify database connection
3. Run health checks
4. Monitor for issues

### Scenario: Database Server Down

**RTO**: <1 hour  
**RPO**: <24 hours

1. Failover to replica (if using replication)
2. Or restore from backup
3. Rebuild indexes
4. Verify data consistency

---

## Knowledge Base

### Common Admin Queries

**Q: How do I export student data?**
```bash
# Export as CSV
mongoexport --uri="mongodb://..." --collection students \
  --fields "name,email,class" --csv > students.csv
```

**Q: How do I search for a specific student?**
```bash
mongosh family_hub
db.students.findOne({ email: "student@school.edu" })
```

**Q: How do I count total students by class?**
```bash
db.students.aggregate([
  { $group: { _id: "$className", count: { $sum: 1 } } }
])
```

**Q: How do I reset the database to demo state?**
```bash
# Delete everything and reseed
npm run db:reset  # (if this script exists)
# Or manually:
db.dropDatabase()
npm run seed:all
```

---

## Contact Information

**On-call Support**: <contact-info>  
**Alert Email**: <admin-email>  
**Escalation**: <manager-email>  
**Documentation**: [family-hub-wiki.internal]

