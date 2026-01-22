
import { DefaultAzureCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ComputeManagementClient } from "@azure/arm-compute";
import { NetworkManagementClient } from "@azure/arm-network";
import { ContainerInstanceManagementClient } from "@azure/arm-containerinstance";
import { MOCK_COURSES } from "@/lib/mock-data";
import { getProfileForCourse, generateSetupScript } from "./vm-profiles";
import { guacamoleClient } from "@/lib/guacamole/client";

// Azure configuration from environment
const LOCATION = "centralus";

export interface LabSession {
    id: string; // Resource Group Name
    status: 'provisioning' | 'running' | 'stopped' | 'failed';
    vmName?: string;
    guacamoleConnectionId?: string;
    guacamoleUsername?: string;
    guacamolePassword?: string;
    guacamoleAuthToken?: string;
    publicIP?: string; // Gateway IP
    expiresAt: Date;
}

export class LabManager {
    private subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
    private resourceClient: ResourceManagementClient;
    private computeClient: ComputeManagementClient;
    private networkClient: NetworkManagementClient;
    private containerClient: ContainerInstanceManagementClient;

    constructor() {
        let credential;
        try {
            credential = new DefaultAzureCredential();
        } catch (e) {
            console.warn("No Azure credentials found");
        }

        if (!credential) {
            // Fallback for initializing clients (will fail on actual calls if env vars missing)
            credential = new DefaultAzureCredential();
        }

        // Initialize Clients
        console.log(`[LabManager] Initializing with Subscription ID: ${this.subscriptionId}`);
        this.resourceClient = new ResourceManagementClient(credential, this.subscriptionId || "mock-sub");
        this.computeClient = new ComputeManagementClient(credential, this.subscriptionId || "mock-sub");
        this.networkClient = new NetworkManagementClient(credential, this.subscriptionId || "mock-sub");
        this.containerClient = new ContainerInstanceManagementClient(credential, this.subscriptionId || "mock-sub");
    }

    async registerProviders(): Promise<void> {
        const providers = ['Microsoft.Network', 'Microsoft.Compute', 'Microsoft.ContainerInstance'];
        console.log(`[LabManager] Ensuring Resource Providers are registered: ${providers.join(', ')}`);
        for (const namespace of providers) {
            try {
                const provider = await this.resourceClient.providers.get(namespace);
                if (provider.registrationState === 'NotRegistered') {
                    console.log(`[LabManager] Registering provider ${namespace}...`);
                    await this.resourceClient.providers.register(namespace);
                    // We won't wait for completion here to avoid timeouts, but it usually kicks off quickly.
                }
            } catch (e: any) {
                console.warn(`[LabManager] Failed to check/register ${namespace}:`, e.message);
            }
        }
    }

    /**
     * Provisions a new Lab Environment (RG + VM + ACI Gateway).
     * If snapshotInfo is provided, will restore VM from snapshot.
     * If existingResourceGroup is provided, will reuse that RG instead of creating new one.
     */
    async launchLab(
        userId: string,
        courseId: string,
        snapshotInfo?: { snapshotId: string; snapshotName: string },
        existingResourceGroup?: string
    ): Promise<LabSession> {
        console.log(`[LabManager] Starting provision for user ${userId}, course ${courseId}`);
        if (snapshotInfo) {
            console.log(`[LabManager] Will restore from snapshot: ${snapshotInfo.snapshotName}`);
        }
        if (existingResourceGroup) {
            console.log(`[LabManager] Will reuse existing RG: ${existingResourceGroup}`);
        }

        // Register Providers first
        await this.registerProviders();

        // ... (existing setup code) ...
        const course = MOCK_COURSES.find(c => c.id === courseId);
        if (!course) throw new Error(`Course ${courseId} not found`);

        // Use existing RG if provided AND it exists, otherwise create new unique RG
        let resourceGroupName: string;
        let rgExists = false;

        if (existingResourceGroup) {
            // Check if the saved RG actually exists AND is active
            try {
                const rg = await this.resourceClient.resourceGroups.get(existingResourceGroup);

                // Check state - if deleting, we must discard it
                if (rg.properties?.provisioningState === 'Deleting' || rg.properties?.provisioningState === 'Failed') {
                    console.warn(`[LabManager] Existing RG ${existingResourceGroup} is in '${rg.properties.provisioningState}' state. discard it.`);

                    // Create NEW RG
                    const uniqueId = Math.random().toString(36).substring(2, 7);
                    resourceGroupName = `lab-${userId.substring(0, 5)}-${course.code.toLowerCase()}-${uniqueId}`;
                    rgExists = false;

                    // CRITICAL: We cannot restore from a snapshot if the parent RG is deleting!
                    // Discard snapshot info to force fresh VM creation
                    if (snapshotInfo) {
                        console.warn(`[LabManager] Discarding snapshot info because parent RG is deleting.`);
                        snapshotInfo = undefined;
                    }

                } else {
                    // RG is healthy, reuse it
                    resourceGroupName = existingResourceGroup;
                    rgExists = true;
                    console.log(`[LabManager] Reusing existing RG: ${resourceGroupName} (State: ${rg.properties?.provisioningState})`);
                }
            } catch (error: any) {
                if (error.code === 'ResourceGroupNotFound' || error.statusCode === 404) {
                    console.log(`[LabManager] Saved RG not found or deleted, creating new one`);
                    const uniqueId = Math.random().toString(36).substring(2, 7);
                    resourceGroupName = `lab-${userId.substring(0, 5)}-${course.code.toLowerCase()}-${uniqueId}`;
                    rgExists = false;

                    // Logic: If RG is gone, snapshot is definitely gone too involved in that RG
                    if (snapshotInfo) {
                        console.warn(`[LabManager] Discarding snapshot info because parent RG is missing.`);
                        snapshotInfo = undefined;
                    }
                } else {
                    throw error;
                }
            }
        } else {
            // First launch - create new unique RG
            const uniqueId = Math.random().toString(36).substring(2, 7);
            resourceGroupName = `lab-${userId.substring(0, 5)}-${course.code.toLowerCase()}-${uniqueId}`;
            rgExists = false;
        }

        const uniqueId = Math.random().toString(36).substring(2, 7);
        const vmName = `vm-${uniqueId}`; // Short name
        const vnetName = `vnet-${uniqueId}`;
        const subnetName = `subnet-${uniqueId}`;
        const gatewayName = `gw-${uniqueId}`;

        // Get Profile
        const profile = getProfileForCourse(course.tags, course.title);
        const setupScript = generateSetupScript(profile.software);

        // Simulation Mode Check
        if (!process.env.AZURE_CLIENT_ID) {
            // ... (simulation fallback) ...
            console.log("[LabManager] Simulation Mode: Provisioning", resourceGroupName);
            await new Promise(r => setTimeout(r, 2000));
            return {
                id: resourceGroupName,
                vmName: vmName,
                status: 'provisioning',
                expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
            };
        }

        try {
            // 1. Create Resource Group
            console.log(`[LabManager] Creating RG: ${resourceGroupName} in ${LOCATION}`);
            await this.resourceClient.resourceGroups.createOrUpdate(resourceGroupName, { location: LOCATION });
            console.log(`[LabManager] RG Created. Check Portal.`);

            // 2. Create Network (VNet + Subnet)
            console.log(`[LabManager] Creating Network ${vnetName}...`);
            await this.networkClient.virtualNetworks.beginCreateOrUpdateAndWait(resourceGroupName, vnetName, {
                location: LOCATION,
                addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
                subnets: [{ name: subnetName, addressPrefix: "10.0.0.0/24" }]
            });

            // 3. Create Public IP and NSG for VM (Direct Access Support)
            const pipName = `${vmName}-pip`;
            const nsgName = `${vmName}-nsg`;

            console.log(`[LabManager] Creating Public IP ${pipName}...`);
            const pip = await this.networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(resourceGroupName, pipName, {
                location: LOCATION,
                publicIPAllocationMethod: 'Static',
                sku: { name: 'Standard' }
            });

            console.log(`[LabManager] Creating NSG ${nsgName} (Allow 3389/22)...`);
            const nsg = await this.networkClient.networkSecurityGroups.beginCreateOrUpdateAndWait(resourceGroupName, nsgName, {
                location: LOCATION,
                securityRules: [
                    {
                        name: 'Allow-RDP',
                        protocol: 'Tcp',
                        sourcePortRange: '*',
                        destinationPortRange: '3389',
                        sourceAddressPrefix: '*',
                        destinationAddressPrefix: '*',
                        access: 'Allow',
                        priority: 1000,
                        direction: 'Inbound'
                    },
                    {
                        name: 'Allow-SSH',
                        protocol: 'Tcp',
                        sourcePortRange: '*',
                        destinationPortRange: '22',
                        sourceAddressPrefix: '*',
                        destinationAddressPrefix: '*',
                        access: 'Allow',
                        priority: 1010,
                        direction: 'Inbound'
                    }
                ]
            });

            // 4. Create NIC (Common for both paths)
            const nicName = `${vmName}-nic`;
            console.log(`[LabManager] Creating NIC ${nicName}...`);
            const nic = await this.networkClient.networkInterfaces.beginCreateOrUpdateAndWait(resourceGroupName, nicName, {
                location: LOCATION,
                ipConfigurations: [{
                    name: 'ipconfig1',
                    subnet: { id: `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/virtualNetworks/${vnetName}/subnets/${subnetName}` },
                    publicIPAddress: { id: pip.id }
                }],
                networkSecurityGroup: { id: nsg.id }
            });

            // 5. Create VM or Restore from Snapshot
            if (snapshotInfo) {
                console.log(`[LabManager] Restoring VM from snapshot: ${snapshotInfo.snapshotName}`);
                await this.createVMFromSnapshot(
                    snapshotInfo.snapshotId,
                    resourceGroupName,
                    vmName,
                    vnetName,
                    subnetName,
                    profile
                );
            } else {
                console.log(`[LabManager] Creating Fresh VM: ${vmName} (${profile.vmSize}, Spot)...`);

                // Deploy Fresh VM
                console.log(`[LabManager] Submitting VM deployment...`);
                await this.computeClient.virtualMachines.beginCreateOrUpdate(resourceGroupName, vmName, {
                    location: LOCATION,
                    hardwareProfile: { vmSize: profile.vmSize },
                    priority: 'Spot',
                    evictionPolicy: 'Deallocate',
                    billingProfile: { maxPrice: -1 },
                    storageProfile: {
                        imageReference: profile.imageReference,
                        // Explicitly name the OS disk for reliable deletion
                        osDisk: {
                            name: `${vmName}-osdisk`,
                            createOption: "FromImage",
                            managedDisk: { storageAccountType: "StandardSSD_LRS" }
                        }
                    },
                    osProfile: {
                        computerName: vmName,
                        adminUsername: "azureuser",
                        adminPassword: "P@ssw0rd1234!", // Use Key Vault in prod
                        customData: setupScript // Base64 script
                    },
                    networkProfile: {
                        networkInterfaces: [{ id: nic.id }]
                    }
                });
            }


            // 5. Wait for VM to get Public IP (works for both fresh and snapshot-restored VMs)
            console.log(`[LabManager] Waiting for VM Public IP...`);
            let vmPublicIP: string | undefined;
            let attempts = 0;
            while (!vmPublicIP && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                try {
                    for await (const pip of this.networkClient.publicIPAddresses.list(resourceGroupName)) {
                        if (pip.ipAddress) {
                            vmPublicIP = pip.ipAddress;
                            console.log(`[LabManager] VM Public IP assigned: ${vmPublicIP}`);
                            break;
                        }
                    }
                } catch (e) {
                    console.warn(`[LabManager] Attempt ${attempts + 1}: IP not ready yet`);
                }
                attempts++;
            }



            // 6. ALWAYS create Guacamole lab session (for both fresh and snapshot-restored VMs)
            let guacamoleData: { connectionId: string; username: string; password: string; authToken: string } | undefined;
            if (vmPublicIP) {
                try {
                    console.log(`[LabManager] Creating Guacamole lab session for ${vmPublicIP}...`);
                    guacamoleData = await guacamoleClient.createLabSession(vmPublicIP, resourceGroupName, userId);
                    console.log(`[LabManager] Guacamole session created - User: ${guacamoleData.username}, Connection: ${guacamoleData.connectionId}, Token: ${guacamoleData.authToken.substring(0, 20)}...`);
                } catch (error: any) {
                    console.error(`[LabManager] Failed to create Guacamole session:`, error.message);
                }
            }

            return {
                id: resourceGroupName,
                vmName: vmName,
                status: 'provisioning',
                guacamoleConnectionId: guacamoleData?.connectionId,
                guacamoleUsername: guacamoleData?.username,
                guacamolePassword: guacamoleData?.password,
                guacamoleAuthToken: guacamoleData?.authToken,
                expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
            };

        } catch (error: any) {
            console.error("[LabManager] CRITICAL DEPLOYMENT FAILURE:", error);
            console.error(JSON.stringify(error, null, 2));

            // this.deleteLab(resourceGroupName);
            throw error;
        }
    }

    async syncGuacamoleConnection(vmName: string, publicIP: string, existingConnectionId?: string): Promise<string | undefined> {
        if (existingConnectionId) return existingConnectionId;
        if (!publicIP) return undefined;

        try {
            console.log(`[LabManager] Syncing Guacamole Connection for ${vmName} (${publicIP})...`);
            // In our ephemeral architecture, the ACI IS the gateway.
            // The frontend just needs the IP to connect to via HTTP.
            // However, the LabConnectPage expects a 'guacamoleConnectionId' or similar to handle logic.
            // For now, we return the publicIP itself or a mock ID as the connection ID
            // just to satisfy the interface.

            // If we were using a central Guacamole server, we would call its API here.

            return `ephemeral-${publicIP}`;
        } catch (error) {
            console.error("[LabManager] Failed to sync guacamole:", error);
            // Return query ID for mock
            return `mock-conn-${vmName}`;
        }
    }

    async getLabStatus(resourceGroupName: string): Promise<{ status: string; publicIP?: string; vmPublicIP?: string }> {
        if (!resourceGroupName.startsWith('lab-')) {
            return { status: 'running', publicIP: '20.213.10.15' };
        }
        if (!process.env.AZURE_CLIENT_ID) return { status: 'running', publicIP: '20.213.10.15' };

        try {
            console.log(`[getLabStatus] Checking ${resourceGroupName}...`);

            // Check VM Status
            const vms = [];
            for await (const vm of this.computeClient.virtualMachines.list(resourceGroupName)) {
                vms.push(vm);
            }
            if (vms.length === 0) {
                console.log(`[getLabStatus] No VMs found in ${resourceGroupName}`);
                return { status: 'provisioning' };
            }
            const vm = vms[0];
            console.log(`[getLabStatus] Found VM: ${vm.name}`);

            // Get Instance View for Power State
            const instanceView = await this.computeClient.virtualMachines.instanceView(resourceGroupName, vm.name!);
            const powerState = instanceView.statuses?.find(s => s.code?.startsWith('PowerState'))?.displayStatus || 'Unknown';
            console.log(`[getLabStatus] VM Power State: ${powerState}`);

            // Get VM Public IP (for direct RDP)
            let vmPublicIP: string | undefined;
            try {
                for await (const pip of this.networkClient.publicIPAddresses.list(resourceGroupName)) {
                    if (pip.ipAddress) {
                        vmPublicIP = pip.ipAddress;
                        console.log(`[getLabStatus] Found VM PIP: ${vmPublicIP}`);
                        break;
                    }
                }
            } catch (e) {
                console.warn("[getLabStatus] Failed to fetch VM PIP", e);
            }

            const status = powerState.includes('running') ? 'running' : 'provisioning';
            console.log(`[getLabStatus] Returning Status: ${status}`);

            return {
                status: status,
                vmPublicIP: vmPublicIP
            };
        } catch (e: any) {
            console.error(`[LabManager] getLabStatus Error for ${resourceGroupName}:`, e.message);
            if (e.code === 'ResourceGroupNotFound') {
                console.warn('[LabManager] Resource Group Not Found - Marking session as stopped to allow relaunch.');
                return { status: 'stopped' };
            }
            // Keep provisioning if error is transient, unless it's a 404
            return { status: 'provisioning' };
        }
    }

    async restartVM(resourceGroupName: string): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID || !resourceGroupName.startsWith('lab-')) {
            throw new Error('Invalid configuration or resource group name');
        }

        console.log(`[LabManager] Restarting VM in resource group: ${resourceGroupName}`);

        try {
            // Get the VM name from the resource group
            const resourcesIterator = this.resourceClient.resources.listByResourceGroup(resourceGroupName);
            const resources = [];
            for await (const resource of resourcesIterator) {
                resources.push(resource);
            }

            const vmResource = resources.find((r: any) => r.type === 'Microsoft.Compute/virtualMachines');

            if (!vmResource || !vmResource.name) {
                throw new Error('VM not found in resource group');
            }

            // Restart the VM
            await this.computeClient.virtualMachines.beginRestart(resourceGroupName, vmResource.name);
            console.log(`[LabManager] VM ${vmResource.name} restart initiated`);
        } catch (error) {
            console.error(`[LabManager] Failed to restart VM:`, error);
            throw error;
        }
    }

    /**
     * Create a snapshot of a VM's OS disk
     */
    async createSnapshot(resourceGroupName: string, vmName: string): Promise<{
        snapshotId: string;
        snapshotName: string;
    }> {
        if (!process.env.AZURE_CLIENT_ID) {
            throw new Error('Azure credentials not configured');
        }

        console.log(`[LabManager] Creating snapshot for VM: ${vmName} in RG: ${resourceGroupName}`);

        try {
            // Step 1: Deallocate VM for consistent snapshot
            console.log(`[LabManager] Deallocating VM for consistent snapshot...`);
            try {
                const deallocatePoller = await this.computeClient.virtualMachines.beginDeallocate(resourceGroupName, vmName);
                await deallocatePoller.pollUntilDone();
                console.log(`[LabManager] VM deallocated successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to deallocate VM:`, error);
                }
            }

            // Step 2: Get VM details
            const vm = await this.computeClient.virtualMachines.get(resourceGroupName, vmName);

            if (!vm.storageProfile?.osDisk?.managedDisk?.id) {
                throw new Error('VM OS disk not found');
            }

            const osDiskId = vm.storageProfile.osDisk.managedDisk.id;
            const snapshotName = `snapshot-${vmName}-${Date.now()}`;

            // Create snapshot from OS disk
            const snapshotParams = {
                location: LOCATION,
                creationData: {
                    createOption: 'Copy',
                    sourceResourceId: osDiskId
                },
                sku: {
                    name: 'Standard_LRS' // Standard locally-redundant storage
                }
            };

            console.log(`[LabManager] Creating snapshot: ${snapshotName}`);
            const snapshotPoller = await this.computeClient.snapshots.beginCreateOrUpdate(
                resourceGroupName,
                snapshotName,
                snapshotParams
            );

            const snapshot = await snapshotPoller.pollUntilDone();

            console.log(`[LabManager] Snapshot created successfully: ${snapshot.id}`);

            return {
                snapshotId: snapshot.id || '',
                snapshotName: snapshotName
            };
        } catch (error) {
            console.error(`[LabManager] Failed to create snapshot:`, error);
            throw error;
        }
    }

    /**
     * Delete old snapshots, keeping only the latest N
     */
    async deleteOldSnapshots(resourceGroupName: string, vmName: string, keepLatest: number = 1): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID) {
            console.log('[LabManager] Skipping snapshot rotation (simulation mode)');
            return;
        }

        try {
            console.log(`[LabManager] Rotating snapshots in RG: ${resourceGroupName}, keeping latest ${keepLatest}`);

            // Use generic snapshot prefix since VM names change between launches
            const prefix = `snapshot-`;
            const snapshots = [];

            for await (const snap of this.computeClient.snapshots.listByResourceGroup(resourceGroupName)) {
                if (snap.name?.startsWith(prefix)) {
                    console.log(`[LabManager] Found snapshot: ${snap.name}, created: ${snap.timeCreated}`);
                    snapshots.push({
                        name: snap.name,
                        createdAt: snap.timeCreated || new Date(0)
                    });
                }
            }

            console.log(`[LabManager] Total snapshots found in RG '${resourceGroupName}': ${snapshots.length}`);

            snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const toDelete = snapshots.slice(keepLatest);
            console.log(`[LabManager] Snapshots to keep: ${keepLatest}, snapshots to delete: ${toDelete.length}`);

            for (const snap of toDelete) {
                console.log(`[LabManager] Deleting old snapshot: ${snap.name}`);
                try {
                    await this.computeClient.snapshots.beginDeleteAndWait(resourceGroupName, snap.name);
                    console.log(`[LabManager] ✅ Old snapshot deleted successfully: ${snap.name}`);
                } catch (error) {
                    console.error(`[LabManager] ❌ Failed to delete old snapshot ${snap.name}:`, error);
                }
            }

            console.log(`[LabManager] Snapshot rotation complete. Kept ${keepLatest}, deleted ${toDelete.length}`);
        } catch (error) {
            console.error(`[LabManager] Error during snapshot rotation:`, error);
        }
    }

    /**
     * Delete a snapshot
     */
    async deleteSnapshot(snapshotName: string, resourceGroupName: string): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID) {
            return; // Skip in simulation mode
        }

        console.log(`[LabManager] Deleting snapshot: ${snapshotName} from RG: ${resourceGroupName}`);

        try {
            await this.computeClient.snapshots.beginDelete(resourceGroupName, snapshotName);
            console.log(`[LabManager] Snapshot deleted successfully`);
        } catch (error: any) {
            if (error.code === 'ResourceNotFound') {
                console.log(`[LabManager] Snapshot not found, already deleted`);
            } else {
                console.error(`[LabManager] Failed to delete snapshot:`, error);
                // Don't throw - continue with cleanup
            }
        }
    }

    /**
     * Create a VM from a snapshot
     */
    async createVMFromSnapshot(
        snapshotId: string,
        resourceGroupName: string,
        vmName: string,
        vnetName: string,
        subnetName: string,
        profile: any
    ): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID) {
            throw new Error('Azure credentials not configured');
        }

        console.log(`[LabManager] Creating VM from snapshot: ${snapshotId}`);

        try {
            // Create managed disk from snapshot
            const diskName = `${vmName}-osdisk`;
            const diskParams = {
                location: LOCATION,
                creationData: {
                    createOption: 'Copy',
                    sourceResourceId: snapshotId
                },
                sku: {
                    name: 'Premium_LRS'
                }
            };

            console.log(`[LabManager] Creating managed disk from snapshot...`);
            const diskPoller = await this.computeClient.disks.beginCreateOrUpdate(
                resourceGroupName,
                diskName,
                diskParams
            );
            const disk = await diskPoller.pollUntilDone();

            // Get network interface (should already exist from network setup)
            const nicName = `${vmName}-nic`;

            // Create VM with the disk from snapshot
            const vmParams: any = {
                location: LOCATION,
                hardwareProfile: {
                    vmSize: profile.vmSize
                },
                storageProfile: {
                    osDisk: {
                        name: diskName,
                        createOption: 'Attach',
                        managedDisk: {
                            id: disk.id
                        },
                        osType: 'Windows'
                    }
                },
                networkProfile: {
                    networkInterfaces: [{
                        id: `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/networkInterfaces/${nicName}`,
                        primary: true
                    }]
                }
            };

            console.log(`[LabManager] Creating VM from snapshot disk...`);
            const vmPoller = await this.computeClient.virtualMachines.beginCreateOrUpdate(
                resourceGroupName,
                vmName,
                vmParams
            );
            await vmPoller.pollUntilDone();

            console.log(`[LabManager] VM created successfully from snapshot`);
        } catch (error) {
            console.error(`[LabManager] Failed to create VM from snapshot:`, error);
            throw error;
        }
    }

    /**
     * Delete VM and its resources (NIC, Public IP, Disk) but keep Resource Group and Snapshot
     * Used when closing a lab to preserve user work via snapshot
     */
    async deleteVMResources(resourceGroupName: string, vmName: string): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID || !resourceGroupName.startsWith('lab-')) {
            console.log('[LabManager] Skipping VM resource deletion (simulation mode or invalid RG)');
            return;
        }

        console.log(`[LabManager] Deleting VM resources in RG: ${resourceGroupName}`);

        try {
            // 0. Fetch VM info FIRST to get the actual OS disk name (auto-generated or explicit)
            let actualOsDiskName = `${vmName}-osdisk`; // Default fallback
            try {
                const vm = await this.computeClient.virtualMachines.get(resourceGroupName, vmName);
                if (vm.storageProfile?.osDisk?.name) {
                    actualOsDiskName = vm.storageProfile.osDisk.name;
                    console.log(`[LabManager] Identified OS Disk to delete: ${actualOsDiskName}`);
                }
            } catch (error) {
                console.warn(`[LabManager] Could not fetch VM details (might already be deleted?), will try default disk name: ${actualOsDiskName}`);
            }

            // 1. Delete VM and WAIT for completion
            try {
                console.log(`[LabManager] Deleting VM: ${vmName}...`);
                const vmPoller = await this.computeClient.virtualMachines.beginDelete(resourceGroupName, vmName);
                await vmPoller.pollUntilDone(); // Wait for VM deletion to complete
                console.log(`[LabManager] VM deleted successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to delete VM:`, error);
                    throw error; // Stop if VM deletion fails
                }
            }

            // 2. Delete NIC (now that VM is fully deleted)
            try {
                const nicName = `${vmName}-nic`;
                console.log(`[LabManager] Deleting NIC: ${nicName}...`);
                const nicPoller = await this.networkClient.networkInterfaces.beginDelete(resourceGroupName, nicName);
                await nicPoller.pollUntilDone();
                console.log(`[LabManager] NIC deleted successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to delete NIC:`, error);
                }
            }

            // 3. Delete Public IP (now that NIC is deleted)
            try {
                const pipName = `${vmName}-pip`;
                console.log(`[LabManager] Deleting Public IP: ${pipName}...`);
                const pipPoller = await this.networkClient.publicIPAddresses.beginDelete(resourceGroupName, pipName);
                await pipPoller.pollUntilDone();
                console.log(`[LabManager] Public IP deleted successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to delete Public IP:`, error);
                }
            }

            // 4. Delete NSG (Network Security Group)
            try {
                const nsgName = `${vmName}-nsg`;
                console.log(`[LabManager] Deleting NSG: ${nsgName}...`);
                const nsgPoller = await this.networkClient.networkSecurityGroups.beginDelete(resourceGroupName, nsgName);
                await nsgPoller.pollUntilDone();
                console.log(`[LabManager] NSG deleted successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to delete NSG:`, error);
                }
            }

            // 5. Delete OS Disk (using the identified name)
            try {
                console.log(`[LabManager] Deleting OS Disk: ${actualOsDiskName}...`);
                const diskPoller = await this.computeClient.disks.beginDelete(resourceGroupName, actualOsDiskName);
                await diskPoller.pollUntilDone();
                console.log(`[LabManager] OS Disk ${actualOsDiskName} deleted successfully`);
            } catch (error: any) {
                if (error.code !== 'ResourceNotFound') {
                    console.error(`[LabManager] Failed to delete OS Disk:`, error);
                } else {
                    console.log(`[LabManager] OS Disk not found (already deleted)`);
                }
            }

            console.log(`[LabManager] All VM resources deleted. RG and snapshot preserved.`);
        } catch (error) {
            console.error(`[LabManager] Error during VM resource deletion:`, error);
            throw error;
        }
    }

    async deleteLab(resourceGroupName: string, guacamoleUsername?: string): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID || !resourceGroupName.startsWith('lab-')) return;

        // Delete Guacamole user (which also removes their connections)
        if (guacamoleUsername) {
            try {
                await guacamoleClient.deleteUser(guacamoleUsername);
            } catch (error) {
                console.error(`[LabManager] Failed to delete Guacamole user:`, error);
            }
        }

        console.log(`[LabManager] Deleting Lab RG: ${resourceGroupName}`);
        await this.resourceClient.resourceGroups.beginDelete(resourceGroupName);
    }

    /**
     * Delete a Resource Group (for Azure Portal RG cleanup)
     * Does not delete Guacamole users - only the Azure RG
     */
    async deleteResourceGroup(resourceGroupName: string): Promise<void> {
        if (!process.env.AZURE_CLIENT_ID) return;

        console.log(`[LabManager] Deleting Resource Group: ${resourceGroupName}`);
        try {
            await this.resourceClient.resourceGroups.beginDelete(resourceGroupName);
            console.log(`[LabManager] Resource Group deletion initiated: ${resourceGroupName}`);
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log(`[LabManager] Resource Group not found (already deleted): ${resourceGroupName}`);
            } else {
                throw error;
            }
        }
    }
}

export const labManager = new LabManager();
