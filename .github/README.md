# GitHub Actions Workflows

This repository uses GitHub Actions for continuous integration, testing, and deployment. The workflows are designed to ensure code quality, security, and reliable deployments.

## Workflows Overview

### 1. Test and Build (`test-and-build.yml`)
**Triggers:** Push to `main`, `master`, `production`, `development` branches and pull requests

**Jobs:**
- **Test**: Runs unit and integration tests on Node.js 18.x and 20.x
- **Build**: Compiles TypeScript and creates production build
- **Security**: Runs security audits and vulnerability scans
- **Docker**: Builds and pushes Docker images (all protected branches)

### 2. Pull Request Checks (`pr-checks.yml`)
**Triggers:** Pull requests to `main`, `master`, `production`, `development` branches

**Jobs:**
- **Quick Checks**: Fast feedback with type checking, unit tests, and security audit
- **Integration Tests**: Comprehensive integration tests with MongoDB memory server

### 3. Development Checks (`development.yml`)
**Triggers:** Push to `development` branch

**Jobs:**
- **Quick Development Checks**: Fast feedback with type checking, tests, and build
- **Development Deployment**: Automated deployment to development environment

### 4. Scheduled Checks (`scheduled-checks.yml`)
**Triggers:** Every Monday at 9 AM UTC and manual dispatch

**Jobs:**
- **Security Scan**: Weekly security audits and vulnerability checks
- **Dependency Update**: Manual dependency update checks and PR creation

## Workflow Features

### 🚀 **Fast Feedback**
- Parallel job execution
- Cached dependencies with pnpm
- Separate quick checks for PRs
- Matrix testing across Node.js versions

### 🔒 **Security First**
- Automated security audits
- Snyk vulnerability scanning
- Dependency vulnerability checks
- Security report generation

### 🧪 **Comprehensive Testing**
- Unit tests with Jest
- Integration tests with MongoDB memory server
- Type checking with TypeScript
- Coverage reporting

### 🐳 **Docker Integration**
- Multi-platform Docker builds
- Automated image tagging
- Docker Hub integration
- Build caching

### 📊 **Reporting & Artifacts**
- Test result artifacts
- Coverage reports
- Security scan reports
- Build artifacts

## Required Secrets

Configure these secrets in your GitHub repository settings:

### **Required Secrets**
```bash
# Docker Hub credentials (for Docker image publishing)
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# Snyk security scanning (optional but recommended)
SNYK_TOKEN=your-snyk-token
```

### **Optional Secrets**
```bash
# Codecov coverage reporting (optional)
CODECOV_TOKEN=your-codecov-token

# Additional security scanning tools
GITHUB_TOKEN=auto-provided
```

## Local Development

### **Running Tests Locally**
```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode
pnpm test:ci
```

### **Code Quality Checks**
```bash
# Type checking
pnpm type-check

# Security audit
pnpm audit

# Fix security issues
pnpm audit:fix
```

### **Building Locally**
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Development mode
pnpm dev
```

## Workflow Triggers

### **Automatic Triggers**
- **Push to main/master/production/development**: Full test, build, and deploy pipeline
- **Pull requests**: Quick checks and integration tests
- **Weekly schedule**: Security scans and dependency checks

### **Manual Triggers**
- **Workflow dispatch**: Manual security scans and dependency updates
- **Release creation**: Automated releases on main/master/production/development

## Job Dependencies

```
test-and-build.yml:
├── test (parallel: Node.js 18.x, 20.x)
├── build (depends on: test)
├── security (depends on: test)
└── docker (depends on: test, build)

pr-checks.yml:
├── quick-checks
└── integration-tests (depends on: quick-checks)

development.yml:
├── quick-dev-checks
└── development-deploy (depends on: quick-dev-checks)

scheduled-checks.yml:
├── security-scan
└── dependency-update (manual only)
```

## Performance Optimizations

### **Caching Strategy**
- **pnpm store**: Cached between runs
- **Docker layers**: Multi-stage build caching
- **Node modules**: npm cache enabled
- **Test artifacts**: Preserved for 30 days

### **Parallel Execution**
- Matrix testing across Node.js versions
- Independent job execution where possible
- Optimized dependency chains

### **Resource Usage**
- Ubuntu latest runners
- Efficient dependency installation
- Minimal artifact storage

## Monitoring & Alerts

### **Success Metrics**
- ✅ All tests passing
- ✅ Security scans clean
- ✅ Build successful
- ✅ Docker image published

### **Failure Alerts**
- ❌ Test failures
- ❌ Security vulnerabilities
- ❌ Build errors
- ❌ Type checking errors

### **Performance Metrics**
- Test execution time
- Build duration
- Cache hit rates
- Resource utilization

## Troubleshooting

### **Common Issues**

#### **Test Failures**
```bash
# Check test logs
# Verify MongoDB memory server setup
# Ensure all dependencies are installed
```

#### **Build Failures**
```bash
# Check TypeScript compilation
# Verify build configuration
# Check for missing dependencies
```

#### **Security Scan Failures**
```bash
# Review vulnerability reports
# Update vulnerable dependencies
# Check for false positives
```

#### **Docker Build Failures**
```bash
# Verify Dockerfile syntax
# Check Docker Hub credentials
# Ensure proper image tagging
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* pnpm test

# Run specific test file
pnpm test src/tests/unit/user.usecase.test.ts

# Run with verbose output
pnpm test --verbose
```

## Best Practices

### **For Developers**
1. **Write comprehensive tests** for all new features
2. **Run tests locally** before pushing
3. **Check type safety** with `pnpm type-check`
4. **Review security audits** regularly
5. **Update dependencies** when needed

### **For Maintainers**
1. **Monitor workflow runs** for failures
2. **Review security reports** weekly
3. **Update workflow configurations** as needed
4. **Maintain secret management** securely
5. **Optimize performance** regularly

### **For DevOps**
1. **Monitor resource usage** and costs
2. **Review deployment logs** for issues
3. **Update runner configurations** as needed
4. **Maintain backup strategies** for artifacts
5. **Document deployment procedures**

## Future Enhancements

### **Planned Features**
- [ ] **Performance testing** integration
- [ ] **Load testing** workflows
- [ ] **Automated deployment** to staging
- [ ] **Slack/Discord** notifications
- [ ] **Advanced caching** strategies

### **Potential Improvements**
- [ ] **Multi-environment** testing
- [ ] **Database migration** testing
- [ ] **API contract** testing
- [ ] **End-to-end** testing
- [ ] **Performance regression** detection

## Support

For issues with GitHub Actions workflows:

1. **Check workflow logs** for detailed error messages
2. **Review this documentation** for common solutions
3. **Create an issue** with workflow run details
4. **Contact the DevOps team** for complex issues

---

**Last Updated:** GitHub Actions workflows configured for comprehensive CI/CD  
**Status:** ✅ All workflows operational  
**Coverage:** Complete testing and deployment pipeline  
**Security:** Automated scanning and auditing enabled
