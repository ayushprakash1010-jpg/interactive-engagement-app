## Current Technology Stack

Frontend:
- Next.js 14
- React
- TypeScript

Backend:
- NestJS
- TypeScript

Database:
- MongoDB

Realtime:
- Socket.IO

Authentication:
- Auth0

Reporting:
- Puppeteer PDF Generation



## AWS Services Mapping

| Application Component | AWS Service |

| Frontend Hosting | S3 + CloudFront |

| Backend API | EC2 |

| WebSockets | EC2 |

| Database | MongoDB Atlas |

| File Storage | S3 |

| SSL Certificate | AWS Certificate Manager |

| DNS | Route53 |

| Monitoring | CloudWatch |




## Estimated Monthly Cost

| Service | Estimated Cost |
|----------|---------------|
| EC2 t3.small | ₹1200 - ₹1800 |
| S3 Storage | ₹50 - ₹100 |
| CloudFront | ₹50 - ₹200 |
| MongoDB Atlas | Free Tier / ₹500 |
| Route53 Domain | ₹80/month |
| SSL Certificate | Free |
| CloudWatch | ₹50 - ₹100 |

Total Estimated Cost:
₹1500 - ₹2500 per month



## Deployment Steps

Create AWS Account

Create S3 Bucket

Configure CloudFront

Launch EC2 Instance

Install Node.js

Install PM2

Configure Nginx

Configure SSL Certificate

Connect MongoDB Atlas

Configure Environment Variables

Deploy Frontend

Deploy Backend

Configure Domain

Enable Monitoring




## Required Environment Variables

Backend:
- MONGODB_URI
- JWT_SECRET
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET

Frontend:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_AUTH0_DOMAIN
- NEXT_PUBLIC_AUTH0_CLIENT_ID




## Security Considerations

- HTTPS enforced
- Security Groups configured
- MongoDB Atlas IP Whitelisting
- Environment variables not committed to Git
- IAM least privilege access
- Automatic backups enabled





## Monitoring

AWS CloudWatch:
- CPU Usage
- Memory Usage
- Disk Usage
- Network Traffic
- Application Logs

Alerts:
- High CPU usage
- Server downtime
- Failed deployments




## Backup Strategy

Database:
- MongoDB Atlas automatic backups

Files:
- S3 versioning enabled

Code:
- GitHub repository

Server:
- EC2 snapshots





## Future Scaling Strategy

Phase 1:
- Single EC2 Instance

Phase 2:
- Load Balancer
- Multiple EC2 Instances

Phase 3:
- Auto Scaling Groups

Phase 4:
- ECS / Kubernetes





## Recommendation

Recommended Architecture:

Frontend:
- S3 + CloudFront

Backend:
- EC2 t3.small

Database:
- MongoDB Atlas

Storage:
- S3

Realtime:
- Socket.IO on EC2

This architecture provides the best balance between cost, scalability, simplicity, and maintenance effort 