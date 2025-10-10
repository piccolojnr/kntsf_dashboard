# Knutsford University SRC Dashboard - Deployment Guide

## Prerequisites

Before deploying the SRC Dashboard, ensure you have the following:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **MySQL** 8.0 or higher
- **Git** for version control
- **Vercel CLI** (for Vercel deployment)
- **Cloudinary account** for media storage
- **Paystack account** for payment processing

## Environment Setup

### 1. Database Configuration

#### MySQL Database Setup

```sql
-- Create database
CREATE DATABASE knutsford_src_dashboard;

-- Create user with appropriate permissions
CREATE USER 'src_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON knutsford_src_dashboard.* TO 'src_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL="mysql://src_user:secure_password@localhost:3306/knutsford_src_dashboard"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# Paystack Configuration
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"

# Cloudinary Configuration
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@knutsford.edu.gh"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
```

### 2. Local Development Setup

#### Install Dependencies

```bash
npm install
```

#### Database Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run prisma:seed
```

#### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

#### 1. Prepare for Deployment

```bash
# Build the application
npm run build

# Test the build locally
npm start
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### 3. Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to Settings > Environment Variables
3. Add all required environment variables from the `.env.local` file

#### 4. Database Setup for Production

- Use **PlanetScale** or **Railway** for MySQL hosting
- Update `DATABASE_URL` with production database credentials
- Run migrations: `npx prisma migrate deploy`

### Option 2: Traditional VPS Deployment

#### 1. Server Requirements

- **OS**: Ubuntu 20.04 LTS or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB SSD minimum
- **CPU**: 2 cores minimum

#### 2. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 3. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd kntsf_dashboard_fork

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "src-dashboard" -- start
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/src-dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/src-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/src_dashboard
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3001
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=src_dashboard
      - MYSQL_USER=src_user
      - MYSQL_PASSWORD=userpassword
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u src_user -p knutsford_src_dashboard > backup_$DATE.sql
```

### Restore from Backup

```bash
mysql -u src_user -p knutsford_src_dashboard < backup_file.sql
```

## Monitoring and Maintenance

### 1. Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs src-dashboard

# Restart application
pm2 restart src-dashboard
```

### 2. Database Monitoring

```sql
-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'knutsford_src_dashboard'
GROUP BY table_schema;
```

### 3. Performance Optimization

```bash
# Enable MySQL query cache
# Add to /etc/mysql/mysql.conf.d/mysqld.cnf:
query_cache_type = 1
query_cache_size = 64M

# Restart MySQL
sudo systemctl restart mysql
```

## Security Checklist

### ✅ Pre-deployment Security

- [ ] Change default database passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS properly

### ✅ Post-deployment Security

- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup verification
- [ ] SSL certificate monitoring
- [ ] Database security audit

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u src_user -p -h localhost knutsford_src_dashboard
```

#### 2. Build Failures

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 3. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
chmod -R 755 /path/to/app
```

### Performance Issues

#### 1. Slow Database Queries

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

#### 2. Memory Issues

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Rollback Strategy

### 1. Application Rollback

```bash
# PM2 rollback
pm2 restart src-dashboard --update-env

# Git rollback
git checkout previous-stable-commit
npm install
npm run build
pm2 restart src-dashboard
```

### 2. Database Rollback

```bash
# Restore from backup
mysql -u src_user -p knutsford_src_dashboard < backup_file.sql
```

## Maintenance Schedule

### Daily

- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Verify backup completion

### Weekly

- [ ] Review security logs
- [ ] Update dependencies
- [ ] Performance analysis

### Monthly

- [ ] Security audit
- [ ] Database optimization
- [ ] SSL certificate check

---

_This deployment guide ensures a secure, scalable, and maintainable production
environment for the SRC Dashboard._
