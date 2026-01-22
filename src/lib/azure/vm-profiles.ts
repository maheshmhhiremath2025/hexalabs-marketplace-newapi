export interface LabProfile {
    // Azure Image Reference
    imageReference: {
        publisher: string;
        offer: string;
        sku: string;
        version: string;
    };
    // Azure VM Size
    vmSize: string;
    // List of Chocolatey packages to install
    software: string[];
}

export const LAB_PROFILES: Record<string, LabProfile> = {
    'default': {
        imageReference: {
            publisher: 'MicrosoftWindowsServer',
            offer: 'WindowsServer',
            sku: '2022-Datacenter',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['git', 'googlechrome', 'vscode']
    },
    'server2025': {
        imageReference: {
            publisher: 'MicrosoftWindowsServer',
            offer: 'WindowsServer',
            sku: '2025-Datacenter',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['git', 'googlechrome', 'vscode']
    },
    'windows11': {
        imageReference: {
            publisher: 'MicrosoftWindowsDesktop',
            offer: 'Windows-11',
            sku: 'win11-22h2-pro',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['git', 'googlechrome', 'vscode']
    },
    'docker': {
        imageReference: {
            publisher: 'MicrosoftWindowsServer',
            offer: 'WindowsServer',
            sku: '2022-Datacenter',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['docker-desktop', 'git', 'vscode', 'postman']
    },
    'docker2025': {
        imageReference: {
            publisher: 'MicrosoftWindowsServer',
            offer: 'WindowsServer',
            sku: '2025-Datacenter',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['docker-desktop', 'git', 'vscode', 'postman']
    },
    'kubernetes': {
        imageReference: {
            publisher: 'MicrosoftWindowsServer',
            offer: 'WindowsServer',
            sku: '2022-Datacenter',
            version: 'latest'
        },
        vmSize: 'Standard_D2s_v3',
        software: ['minikube', 'kubernetes-cli', 'helm', 'vscode']
    }
};

export function getProfileForCourse(tags: string[], title: string, courseCode?: string): LabProfile {
    const lowerTitle = title.toLowerCase();
    const lowerCode = courseCode?.toLowerCase() || '';

    // Check for Windows Server 2025
    if (lowerTitle.includes('server 2025') ||
        lowerTitle.includes('2025') ||
        lowerCode.includes('2025') ||
        lowerTitle.includes('windows server 2025')) {

        // Check if it's a Docker/Kubernetes course on Server 2025
        if (tags.some(t => t.toLowerCase().includes('docker')) || lowerTitle.includes('docker')) {
            return LAB_PROFILES['docker2025'];
        }

        return LAB_PROFILES['server2025'];
    }

    // Check for Windows 11
    if (lowerTitle.includes('windows 11') ||
        lowerTitle.includes('win11') ||
        lowerCode.includes('win11') ||
        lowerTitle.includes('windows11')) {
        return LAB_PROFILES['windows11'];
    }

    // Check for specific software profiles (Server 2022 default)
    if (tags.some(t => t.toLowerCase().includes('docker')) || lowerTitle.includes('docker')) {
        return LAB_PROFILES['docker'];
    }

    if (tags.some(t => t.toLowerCase().includes('kubernetes') || t.toLowerCase().includes('k8s')) ||
        lowerTitle.includes('kubernetes')) {
        return LAB_PROFILES['kubernetes'];
    }

    // Default to Windows Server 2022
    return LAB_PROFILES['default'];
}

export function generateSetupScript(software: string[]): string {
    const packages = software.join(' ');
    const script = `
    # Install Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force;
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'));
    
    # Install software packages
    choco install ${packages} -y --no-progress;
    
    # Install Myrtille (HTML5 RDP Gateway)
    # Download and install Myrtille
    $myrtilleUrl = "https://github.com/cedrozor/myrtille/releases/download/v2.9.3/Myrtille_2.9.3_x86_x64_Setup.exe";
    $installerPath = "C:\\Temp\\myrtille-setup.exe";
    New-Item -ItemType Directory -Force -Path C:\\Temp;
    Invoke-WebRequest -Uri $myrtilleUrl -OutFile $installerPath;
    Start-Process -FilePath $installerPath -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait;
    
    # Configure firewall for Myrtille (port 8080)
    New-NetFirewallRule -DisplayName "Myrtille Web Gateway" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow;
    
    # Enable RDP
    Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -name "fDenyTSConnections" -value 0;
    Enable-NetFirewallRule -DisplayGroup "Remote Desktop";
    
    # Restart IIS to apply Myrtille
    iisreset;
    `;

    return Buffer.from(script).toString('base64');
}
