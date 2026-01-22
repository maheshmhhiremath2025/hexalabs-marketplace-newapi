# Deploy Shared Guacamole Gateway

## Prerequisites
- Azure CLI installed
- Logged in to Azure (`az login`)
- Correct subscription selected

## Deployment Steps

### 1. Deploy the Guacamole Gateway VM
```bash
# Create resource group
az group create --name hexalabs-gateway --location centralus

# Deploy ARM template
az deployment group create \
  --resource-group hexalabs-gateway \
  --template-file azure-templates/guacamole-gateway.json \
  --parameters adminPassword='Guacamole@2026!'

# Get the public IP
az network public-ip show \
  --resource-group hexalabs-gateway \
  --name guacamole-pip \
  --query ipAddress \
  --output tsv
```

### 2. Configure Environment Variable
Add the Guacamole IP to `.env.local`:
```
GUACAMOLE_GATEWAY_IP=<IP_FROM_STEP_1>
```

### 3. Test Guacamole
Open browser to `http://<GUACAMOLE_IP>:8080/guacamole`
- Default login: `guacadmin` / `guacadmin`

### 4. Configure RDP Connections
For each lab VM, you'll need to manually add RDP connections in Guacamole:
1. Login to Guacamole
2. Go to Settings → Connections
3. Add new RDP connection with VM's **public IP**
4. Use credentials: `azureuser` / `P@ssw0rd1234!`

## Alternative: Automated Connection Creation
To automate connection creation, use Guacamole's REST API (requires additional setup).
