import { LabInstruction } from '@/types/lab-instructions';

/**
 * Professional Lab Instructions - Skillable Style
 * 
 * Features:
 * - Realistic business scenarios
 * - Structured step-by-step instructions
 * - Knowledge blocks (notes, warnings, tips)
 * - Code snippets with syntax highlighting
 * - Quizzes for knowledge validation
 * - Resource links to documentation
 * - Azure resource restrictions enforced
 * - Azure Portal access only for "Cloud Slice Provided" labs
 */

export const LAB_INSTRUCTIONS: Record<string, LabInstruction> = {
    /**
     * AZ-400T00-A: DevOps Solutions [Cloud Slice Provided]
     * Enables Azure Portal Access
     */
    'az-400t00-a': {
        id: 'az-400-lab-1',
        courseId: 'az-400t00-a',
        title: 'Implement CI/CD Pipeline with Azure DevOps',
        description: 'Build an end-to-end CI/CD pipeline to automate application deployment to Azure App Service.',
        scenario: 'Contoso Corporation is modernizing their development process. As a DevOps engineer, you need to implement automated build and deployment pipelines for their web application.',
        estimatedTime: 60,
        difficulty: 'advanced',

        objectives: [
            'Create and configure an Azure DevOps project',
            'Set up a Git repository with application code',
            'Build a CI pipeline for automated builds',
            'Deploy an Azure App Service for hosting',
            'Create a CD pipeline for automated deployments',
            'Implement continuous deployment triggers'
        ],

        prerequisites: [
            'Basic understanding of Git and version control',
            'Familiarity with Azure Portal navigation',
            'Knowledge of web application deployment concepts',
            'Understanding of CI/CD principles'
        ],

        introduction: {
            overview: 'Azure DevOps provides a complete set of tools for implementing DevOps practices. In this lab, you will create a full CI/CD pipeline that automatically builds and deploys a web application whenever code changes are committed.',
            scenario: 'Contoso Corporation currently deploys applications manually, leading to errors and delays. Your task is to automate the entire process from code commit to production deployment using Azure DevOps and Azure App Service.',
            architecture: 'You will build: Azure Repos (Git) → Azure Pipelines (CI Build) → Azure Pipelines (CD Release) → Azure App Service (Production)'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Azure DevOps Project',
                description: 'Set up a new Azure DevOps organization and project to host your source code and pipelines.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'What is Azure DevOps?',
                        content: 'Azure DevOps is a suite of development tools including version control, build automation, release management, and project tracking. It supports both cloud-hosted and on-premises deployments.'
                    },
                    {
                        type: 'tip',
                        title: 'Free Tier Benefits',
                        content: 'Azure DevOps provides free unlimited private Git repositories and CI/CD pipelines for up to 5 users, making it perfect for small teams and learning.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Open the Azure Portal using the credentials provided in the Resources tab'
                    },
                    {
                        step: 2,
                        action: 'In the search bar at the top, type **Azure DevOps** and press Enter'
                    },
                    {
                        step: 3,
                        action: 'Click **My Azure DevOps Organizations** from the search results'
                    },
                    {
                        step: 4,
                        action: 'Click **Create new organization** button',
                        context: 'If you already have an organization, you can use it instead'
                    },
                    {
                        step: 5,
                        action: 'Accept the terms of service and click **Continue**'
                    },
                    {
                        step: 6,
                        action: 'On the organization page, click **+ New project**'
                    },
                    {
                        step: 7,
                        action: 'Enter **ContosoWebApp** as the project name'
                    },
                    {
                        step: 8,
                        action: 'Set visibility to **Private**',
                        context: 'Private projects are only accessible to team members'
                    },
                    {
                        step: 9,
                        action: 'Click **Create** and wait for the project to be provisioned'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify you can see the project dashboard',
                    expectedResult: 'You should see the ContosoWebApp project dashboard with navigation tabs for Boards, Repos, Pipelines, Test Plans, and Artifacts'
                },

                hint: 'If you encounter permission issues, ensure you are logged in with the correct Azure account provided in the lab resources.',

                resources: [
                    {
                        title: 'Azure DevOps Documentation',
                        url: 'https://docs.microsoft.com/azure/devops/',
                        type: 'documentation'
                    }
                ]
            },

            {
                id: 'task-2',
                order: 2,
                title: 'Initialize Git Repository and Add Code',
                description: 'Create a Git repository and push sample web application code to Azure Repos.',

                knowledgeBlocks: [
                    {
                        type: 'important',
                        title: 'Git Basics',
                        content: 'Git is a distributed version control system. Azure Repos provides unlimited free private Git repositories with full Git functionality including branches, pull requests, and code reviews.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In your ContosoWebApp project, click **Repos** in the left navigation menu'
                    },
                    {
                        step: 2,
                        action: 'Click the **Initialize** button to create the main branch with a README file'
                    },
                    {
                        step: 3,
                        action: 'Click the **Clone** button in the top-right corner'
                    },
                    {
                        step: 4,
                        action: 'Copy the HTTPS clone URL to your clipboard'
                    },
                    {
                        step: 5,
                        action: 'In the VM, click the **Cloud Shell** icon (>_) in the top toolbar'
                    },
                    {
                        step: 6,
                        action: 'Select **PowerShell** when prompted for the shell type',
                        context: 'Cloud Shell provides a browser-based terminal with pre-installed tools'
                    },
                    {
                        step: 7,
                        action: 'Wait for Cloud Shell to initialize (first-time setup may take 1-2 minutes)'
                    },
                    {
                        step: 8,
                        action: 'In PowerShell, run the git clone command with your repository URL'
                    },
                    {
                        step: 9,
                        action: 'When prompted for credentials, use your Azure DevOps credentials'
                    },
                    {
                        step: 10,
                        action: 'Navigate into the cloned repository directory'
                    },
                    {
                        step: 11,
                        action: 'Create a simple HTML file for the web application'
                    },
                    {
                        step: 12,
                        action: 'Stage the new file with git add'
                    },
                    {
                        step: 13,
                        action: 'Commit the changes with a descriptive message'
                    },
                    {
                        step: 14,
                        action: 'Push the changes to the remote repository'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'bash',
                        code: `# Clone the repository (replace with your URL)
git clone https://dev.azure.com/yourorg/ContosoWebApp/_git/ContosoWebApp
cd ContosoWebApp

# Create a simple web page
echo '<!DOCTYPE html>
<html>
<head>
<title>Contoso Web App</title>
<style>
body { font-family: Arial; text-align: center; padding: 50px; }
h1 { color: #0078d4; }
</style>
</head>
<body>
<h1>Welcome to Contoso Corporation</h1>
<p>This application is deployed via Azure DevOps CI/CD</p>
<p>Version: 1.0.0</p>
</body>
</html>' > index.html

# Commit and push
git add .
git commit -m "Initial commit: Add homepage"
git push origin main`,
                        description: 'Commands to clone repository and add web application code'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the code appears in Azure Repos',
                    expectedResult: 'Navigate back to Repos in Azure DevOps and confirm index.html is visible in the file list'
                },

                troubleshooting: [
                    'If git clone fails, ensure you copied the correct HTTPS URL',
                    'If authentication fails, generate a Personal Access Token (PAT) in Azure DevOps settings',
                    'If push is rejected, ensure you have Write permissions on the repository'
                ],

                hint: 'You can also use the Azure DevOps web interface to create files directly without using Git commands.'
            },

            {
                id: 'task-3',
                order: 3,
                title: 'Create CI Build Pipeline',
                description: 'Configure an automated build pipeline that triggers on every code commit.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Continuous Integration (CI)',
                        content: 'CI is the practice of automatically building and testing code whenever changes are committed. This helps catch integration issues early and ensures code quality.'
                    },
                    {
                        type: 'warning',
                        title: 'Pipeline Minutes',
                        content: 'Azure DevOps provides 1,800 free pipeline minutes per month for private projects. Monitor your usage to avoid unexpected charges.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Click **Pipelines** in the left navigation menu'
                    },
                    {
                        step: 2,
                        action: 'Click **Create Pipeline** button'
                    },
                    {
                        step: 3,
                        action: 'Select **Azure Repos Git** as the code source'
                    },
                    {
                        step: 4,
                        action: 'Select your **ContosoWebApp** repository from the list'
                    },
                    {
                        step: 5,
                        action: 'Choose **Starter pipeline** template',
                        context: 'This provides a basic YAML pipeline you can customize'
                    },
                    {
                        step: 6,
                        action: 'Replace the entire YAML content with the provided build configuration'
                    },
                    {
                        step: 7,
                        action: 'Review the pipeline YAML to understand each step'
                    },
                    {
                        step: 8,
                        action: 'Click **Save and run** button'
                    },
                    {
                        step: 9,
                        action: 'In the dialog, enter commit message: **Add CI build pipeline**'
                    },
                    {
                        step: 10,
                        action: 'Click **Save and run** again to commit and execute the pipeline'
                    },
                    {
                        step: 11,
                        action: 'Watch the pipeline execute in real-time',
                        context: 'You can click on each job to see detailed logs'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'yaml',
                        code: `# Azure Pipelines CI Build Configuration
trigger:
branches:
include:
- main

pool:
vmImage: 'ubuntu-latest'

steps:
# Step 1: Display build information
- script: |
echo "Building Contoso Web App"
echo "Build Number: $(Build.BuildNumber)"
echo "Source Branch: $(Build.SourceBranchName)"
displayName: 'Display Build Info'

# Step 2: Copy files to staging directory
- task: CopyFiles@2
inputs:
Contents: '**'
TargetFolder: '$(Build.ArtifactStagingDirectory)'
displayName: 'Copy Files to Staging'

# Step 3: Publish build artifacts
- task: PublishBuildArtifacts@1
inputs:
PathtoPublish: '$(Build.ArtifactStagingDirectory)'
ArtifactName: 'drop'
publishLocation: 'Container'
displayName: 'Publish Artifacts'`,
                        description: 'CI Pipeline YAML configuration'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the pipeline completes successfully',
                    expectedResult: 'All steps should show green checkmarks, and you should see "drop" artifact published'
                },

                troubleshooting: [
                    'If the pipeline fails, check the logs for specific error messages',
                    'Ensure the YAML syntax is correct (indentation matters)',
                    'Verify you have sufficient pipeline minutes remaining'
                ],

                hint: 'The pipeline will automatically trigger on every push to the main branch from now on.'
            },

            {
                id: 'task-4',
                order: 4,
                title: 'Create Azure App Service',
                description: 'Provision an Azure App Service to host your web application.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Azure App Service',
                        content: 'App Service is a fully managed platform for building, deploying, and scaling web apps. It supports multiple languages and frameworks including .NET, Node.js, Python, and PHP.'
                    },
                    {
                        type: 'important',
                        title: 'Allowed Configurations',
                        content: 'For this lab, use: Runtime Stack = Node.js, OS = Linux, Pricing Plan = Free F1. These are within the allowed Azure sandbox restrictions.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure Portal, click **Create a resource** (+ icon) in the top-left'
                    },
                    {
                        step: 2,
                        action: 'Search for **App Service** and press Enter'
                    },
                    {
                        step: 3,
                        action: 'Click **Create** on the App Service card'
                    },
                    {
                        step: 4,
                        action: 'Select your subscription from the dropdown'
                    },
                    {
                        step: 5,
                        action: 'Select your existing resource group or create a new one'
                    },
                    {
                        step: 6,
                        action: 'Enter a globally unique name: **contoso-webapp-[your-initials]-[random-number]**',
                        context: 'Example: contoso-webapp-jd-8472'
                    },
                    {
                        step: 7,
                        action: 'Select **Publish: Code**'
                    },
                    {
                        step: 8,
                        action: 'Select **Runtime stack: Node 18 LTS**'
                    },
                    {
                        step: 9,
                        action: 'Select **Operating System: Linux**'
                    },
                    {
                        step: 10,
                        action: 'Select **Region: East US**',
                        context: 'Allowed regions: East US, West US, Central US'
                    },
                    {
                        step: 11,
                        action: 'Under Pricing plan, click **Change size**'
                    },
                    {
                        step: 12,
                        action: 'Select **Dev/Test** tab, then choose **F1 (Free)**'
                    },
                    {
                        step: 13,
                        action: 'Click **Apply** to confirm the pricing tier'
                    },
                    {
                        step: 14,
                        action: 'Click **Review + create** at the bottom'
                    },
                    {
                        step: 15,
                        action: 'Review the configuration and click **Create**'
                    },
                    {
                        step: 16,
                        action: 'Wait for deployment to complete (1-2 minutes)'
                    },
                    {
                        step: 17,
                        action: 'Click **Go to resource** when deployment finishes'
                    },
                    {
                        step: 18,
                        action: 'Note the **URL** shown in the overview page',
                        context: 'This is where your app will be accessible'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the App Service is running',
                    expectedResult: 'Click the URL to open the default Azure App Service page in a new tab'
                },

                troubleshooting: [
                    'If the name is taken, try a different random number',
                    'If deployment fails, check you selected allowed configurations',
                    'Ensure you have sufficient quota in your subscription'
                ],

                hint: 'Save the App Service name - you will need it for the release pipeline configuration.'
            },

            {
                id: 'task-5',
                order: 5,
                title: 'Create CD Release Pipeline',
                description: 'Set up continuous deployment to automatically deploy builds to Azure App Service.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Continuous Deployment (CD)',
                        content: 'CD extends CI by automatically deploying successful builds to target environments. This reduces manual effort and ensures consistent deployments.'
                    },
                    {
                        type: 'tip',
                        title: 'Service Connections',
                        content: 'Azure DevOps uses service connections to securely authenticate with Azure. You will create one to allow pipeline access to your subscription.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure DevOps, navigate to **Pipelines** → **Releases**'
                    },
                    {
                        step: 2,
                        action: 'Click **New pipeline** button'
                    },
                    {
                        step: 3,
                        action: 'Select **Azure App Service deployment** template'
                    },
                    {
                        step: 4,
                        action: 'Click **Apply** to use this template'
                    },
                    {
                        step: 5,
                        action: 'Name the stage **Production**'
                    },
                    {
                        step: 6,
                        action: 'Click the **X** to close the stage panel'
                    },
                    {
                        step: 7,
                        action: 'Click **Add an artifact** in the Artifacts box'
                    },
                    {
                        step: 8,
                        action: 'Select **Source type: Build**'
                    },
                    {
                        step: 9,
                        action: 'Select your build pipeline from the dropdown'
                    },
                    {
                        step: 10,
                        action: 'Click **Add** to attach the artifact'
                    },
                    {
                        step: 11,
                        action: 'Click the **lightning bolt** icon on the artifact box',
                        context: 'This enables continuous deployment trigger'
                    },
                    {
                        step: 12,
                        action: 'Toggle **Enabled** for the continuous deployment trigger'
                    },
                    {
                        step: 13,
                        action: 'Close the trigger panel'
                    },
                    {
                        step: 14,
                        action: 'Click **1 job, 1 task** link under Production stage'
                    },
                    {
                        step: 15,
                        action: 'Click **Azure subscription** dropdown and select **New service connection**'
                    },
                    {
                        step: 16,
                        action: 'Select **Azure Resource Manager** → **Service principal (automatic)**'
                    },
                    {
                        step: 17,
                        action: 'Select your subscription and click **OK** to authorize'
                    },
                    {
                        step: 18,
                        action: 'Select **App type: Web App on Linux**'
                    },
                    {
                        step: 19,
                        action: 'Select your App Service name from the dropdown'
                    },
                    {
                        step: 20,
                        action: 'Click **Save** in the top toolbar'
                    },
                    {
                        step: 21,
                        action: 'Click **OK** to save the release pipeline'
                    },
                    {
                        step: 22,
                        action: 'Click **Create release** → **Create** to trigger first deployment'
                    },
                    {
                        step: 23,
                        action: 'Click the release link to watch deployment progress'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the application is deployed',
                    expectedResult: 'Open your App Service URL in a browser and see your "Welcome to Contoso Corporation" page instead of the default Azure page'
                },

                troubleshooting: [
                    'If authorization fails, ensure you have Owner/Contributor role on the subscription',
                    'If deployment fails, check the deployment logs for specific errors',
                    'If the page doesn\'t update, try a hard refresh (Ctrl+F5)'
                ],

                hint: 'Future commits to the main branch will now automatically trigger build and deployment!',

                resources: [
                    {
                        title: 'Azure Pipelines Documentation',
                        url: 'https://docs.microsoft.com/azure/devops/pipelines/',
                        type: 'documentation'
                    },
                    {
                        title: 'App Service Deployment',
                        url: 'https://docs.microsoft.com/azure/app-service/deploy-continuous-deployment',
                        type: 'documentation'
                    }
                ]
            },

            {
                id: 'task-6',
                order: 6,
                title: 'Test Continuous Deployment',
                description: 'Make a code change and verify the entire CI/CD pipeline executes automatically.',

                instructions: [
                    {
                        step: 1,
                        action: 'Return to Cloud Shell in Azure Portal'
                    },
                    {
                        step: 2,
                        action: 'Navigate to your repository directory if not already there'
                    },
                    {
                        step: 3,
                        action: 'Edit the index.html file to change the version number'
                    },
                    {
                        step: 4,
                        action: 'Commit the change with a descriptive message'
                    },
                    {
                        step: 5,
                        action: 'Push the change to trigger the pipeline'
                    },
                    {
                        step: 6,
                        action: 'Navigate to Pipelines in Azure DevOps'
                    },
                    {
                        step: 7,
                        action: 'Watch the build pipeline execute automatically'
                    },
                    {
                        step: 8,
                        action: 'Navigate to Releases and watch the deployment trigger'
                    },
                    {
                        step: 9,
                        action: 'Wait for both build and release to complete'
                    },
                    {
                        step: 10,
                        action: 'Refresh your App Service URL to see the updated version'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'bash',
                        code: `# Update the version number
sed -i 's/Version: 1.0.0/Version: 2.0.0/' index.html

# Commit and push
git add index.html
git commit -m "Update version to 2.0.0"
git push origin main`,
                        description: 'Commands to update and deploy new version'
                    }
                ],

                verification: {
                    type: 'quiz',
                    description: 'Test your understanding of CI/CD',
                    quiz: {
                        question: 'What triggers the release pipeline to deploy your application?',
                        options: [
                            'Manual click of the "Deploy" button',
                            'Successful completion of the build pipeline',
                            'Scheduled deployment at midnight',
                            'Email notification from Azure'
                        ],
                        correctAnswer: 1,
                        explanation: 'The continuous deployment trigger automatically starts the release pipeline when a new build artifact is published by the CI pipeline.'
                    }
                },

                hint: 'The entire process from code commit to production deployment should take 3-5 minutes.'
            }
        ],

        summary: {
            whatYouLearned: [
                'How to create and configure Azure DevOps projects and repositories',
                'How to build CI pipelines using YAML for automated builds',
                'How to provision Azure App Service within allowed configurations',
                'How to create CD release pipelines for automated deployments',
                'How to implement continuous deployment triggers',
                'How to test end-to-end CI/CD workflows'
            ],
            nextSteps: [
                'Explore deployment slots for blue-green deployments',
                'Add automated testing to your CI pipeline',
                'Implement approval gates in release pipelines',
                'Configure Application Insights for monitoring',
                'Learn about infrastructure as code with ARM templates'
            ],
            additionalResources: [
                {
                    title: 'Azure DevOps Labs',
                    url: 'https://azuredevopslabs.com/',
                    type: 'tutorial'
                },
                {
                    title: 'YAML Pipeline Schema',
                    url: 'https://docs.microsoft.com/azure/devops/pipelines/yaml-schema',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * SC-200T00-A: Security Operations Analyst [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'sc-200t00-a': {
        id: 'sc-200-lab-1',
        courseId: 'sc-200t00-a',
        title: 'Configure Microsoft Sentinel for Threat Detection',
        description: 'Deploy and configure Microsoft Sentinel to collect security data, detect threats, and investigate incidents.',
        scenario: 'Fabrikam Inc. needs to improve their security posture. As a Security Operations Analyst, you will implement Microsoft Sentinel to monitor their Azure environment and detect potential security threats.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Deploy a Log Analytics workspace for Sentinel',
            'Enable Microsoft Sentinel in your workspace',
            'Connect Azure Activity data connector',
            'Create analytics rules for threat detection',
            'Simulate and investigate security incidents',
            'Understand KQL queries for security analysis'
        ],

        prerequisites: [
            'Understanding of security concepts and threats',
            'Familiarity with Azure Portal navigation',
            'Basic knowledge of log analysis',
            'Understanding of SIEM concepts'
        ],

        introduction: {
            overview: 'Microsoft Sentinel is a cloud-native Security Information and Event Management (SIEM) solution that provides intelligent security analytics across your enterprise. In this lab, you will deploy Sentinel and configure it to detect suspicious activities.',
            scenario: 'Fabrikam Inc. has experienced several security incidents and needs better visibility into their Azure environment. Your task is to deploy Microsoft Sentinel, connect data sources, and create detection rules to identify suspicious activities.',
            architecture: 'You will build: Log Analytics Workspace → Microsoft Sentinel → Data Connectors → Analytics Rules → Incidents & Investigation'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Log Analytics Workspace',
                description: 'Deploy a Log Analytics workspace as the foundation for Microsoft Sentinel.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'What is Log Analytics?',
                        content: 'Log Analytics is a service that collects and analyzes data from various sources. It stores logs in a workspace and provides powerful query capabilities using Kusto Query Language (KQL).'
                    },
                    {
                        type: 'important',
                        title: 'Allowed Configurations',
                        content: 'For this lab, use: Region = East US, West US, or Central US. These are within the allowed Azure sandbox restrictions.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Connect to the VM using RDP using the credentials provided in the Resources tab'
                    },
                    {
                        step: 2,
                        action: 'In the search bar, type **Log Analytics workspaces** and press Enter'
                    },
                    {
                        step: 3,
                        action: 'Click **+ Create** to start provisioning a new workspace'
                    },
                    {
                        step: 4,
                        action: 'Select your subscription from the dropdown'
                    },
                    {
                        step: 5,
                        action: 'Select your existing resource group or create a new one named **rg-sentinel-lab**'
                    },
                    {
                        step: 6,
                        action: 'Enter workspace name: **sentinel-workspace-[random-number]**',
                        context: 'Example: sentinel-workspace-8472'
                    },
                    {
                        step: 7,
                        action: 'Select **Region: East US**',
                        context: 'Allowed regions: East US, West US, Central US'
                    },
                    {
                        step: 8,
                        action: 'Click **Review + create** at the bottom'
                    },
                    {
                        step: 9,
                        action: 'Review the configuration and click **Create**'
                    },
                    {
                        step: 10,
                        action: 'Wait for deployment to complete (30-60 seconds)'
                    },
                    {
                        step: 11,
                        action: 'Click **Go to resource** when deployment finishes'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the workspace is created',
                    expectedResult: 'You should see the Log Analytics workspace overview page with a green "Running" status'
                },

                hint: 'The workspace name must be globally unique across Azure. If your chosen name is taken, try a different random number.',

                resources: [
                    {
                        title: 'Log Analytics Workspace Documentation',
                        url: 'https://docs.microsoft.com/azure/azure-monitor/logs/log-analytics-workspace-overview',
                        type: 'documentation'
                    }
                ]
            },

            {
                id: 'task-2',
                order: 2,
                title: 'Enable Microsoft Sentinel',
                description: 'Add Microsoft Sentinel to your Log Analytics workspace to enable security analytics.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Microsoft Sentinel Pricing',
                        content: 'Sentinel charges based on data ingestion volume. The first 10 GB per day is free for the first 31 days, making it perfect for learning and testing.'
                    },
                    {
                        type: 'tip',
                        title: 'Data Retention',
                        content: 'Sentinel retains data for 90 days by default. You can configure longer retention periods if needed for compliance requirements.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In the Azure Portal search bar, type **Microsoft Sentinel**'
                    },
                    {
                        step: 2,
                        action: 'Click **Microsoft Sentinel** from the search results'
                    },
                    {
                        step: 3,
                        action: 'Click **+ Create** to add Sentinel to a workspace'
                    },
                    {
                        step: 4,
                        action: 'Select your **sentinel-workspace** from the list'
                    },
                    {
                        step: 5,
                        action: 'Click **Add** at the bottom'
                    },
                    {
                        step: 6,
                        action: 'Wait for Sentinel to be enabled (1-2 minutes)',
                        context: 'You will see a progress indicator'
                    },
                    {
                        step: 7,
                        action: 'Once enabled, you will be redirected to the Sentinel dashboard'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Sentinel is enabled',
                    expectedResult: 'You should see the Microsoft Sentinel dashboard with tabs for Overview, Logs, Incidents, Hunting, Notebooks, and more'
                },

                troubleshooting: [
                    'If Sentinel fails to enable, ensure you have Contributor permissions on the workspace',
                    'If you don\'t see your workspace, refresh the page and try again',
                    'Ensure the workspace is in a supported region'
                ],

                hint: 'Sentinel is now collecting data, but you need to connect data sources to see security events.'
            },

            {
                id: 'task-3',
                order: 3,
                title: 'Connect Azure Activity Data Connector',
                description: 'Enable the Azure Activity connector to collect subscription-level management events.',

                knowledgeBlocks: [
                    {
                        type: 'important',
                        title: 'Azure Activity Logs',
                        content: 'Azure Activity logs capture all management operations in your subscription, such as creating resources, deleting resources, and changing configurations. These are critical for security monitoring.'
                    },
                    {
                        type: 'note',
                        title: 'Data Connectors',
                        content: 'Sentinel supports 100+ data connectors including Azure services, Microsoft 365, third-party solutions, and custom sources via APIs.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Microsoft Sentinel, click **Data connectors** in the left menu under Configuration'
                    },
                    {
                        step: 2,
                        action: 'In the search box, type **Azure Activity**'
                    },
                    {
                        step: 3,
                        action: 'Click on the **Azure Activity** connector card'
                    },
                    {
                        step: 4,
                        action: 'Click **Open connector page** in the right panel'
                    },
                    {
                        step: 5,
                        action: 'Scroll down to the Instructions section'
                    },
                    {
                        step: 6,
                        action: 'Click **Launch Azure Policy Assignment Wizard**'
                    },
                    {
                        step: 7,
                        action: 'On the Basics tab, select your subscription from the Scope dropdown'
                    },
                    {
                        step: 8,
                        action: 'Click **Next** to go to Parameters tab'
                    },
                    {
                        step: 9,
                        action: 'Select your Log Analytics workspace from the dropdown'
                    },
                    {
                        step: 10,
                        action: 'Click **Next** to go to Remediation tab'
                    },
                    {
                        step: 11,
                        action: 'Check the box for **Create a remediation task**',
                        context: 'This applies the policy to existing resources'
                    },
                    {
                        step: 12,
                        action: 'Click **Review + create**'
                    },
                    {
                        step: 13,
                        action: 'Click **Create** to apply the policy'
                    },
                    {
                        step: 14,
                        action: 'Wait 2-3 minutes for the policy to take effect'
                    },
                    {
                        step: 15,
                        action: 'Return to the Data connectors page and refresh'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the connector is connected',
                    expectedResult: 'The Azure Activity connector should show "Connected" status with a green checkmark and display "1 subscription connected"'
                },

                troubleshooting: [
                    'If the connector doesn\'t show as connected, wait a few more minutes and refresh',
                    'Ensure you have Owner or Contributor role on the subscription',
                    'Check that the policy assignment was created successfully in Azure Policy'
                ],

                hint: 'It may take 5-10 minutes for data to start flowing into Sentinel after connecting.'
            },

            {
                id: 'task-4',
                order: 4,
                title: 'Create Analytics Rule for Threat Detection',
                description: 'Configure a scheduled analytics rule to detect suspicious resource deletion activities.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Analytics Rules',
                        content: 'Analytics rules use KQL queries to analyze data and create incidents when suspicious patterns are detected. Sentinel includes 200+ built-in rules based on Microsoft security research.'
                    },
                    {
                        type: 'warning',
                        title: 'False Positives',
                        content: 'Tune your detection rules carefully to minimize false positives. Too many false alerts can lead to alert fatigue and missed real threats.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Click **Analytics** in the left menu under Configuration'
                    },
                    {
                        step: 2,
                        action: 'Click **+ Create** and select **Scheduled query rule**'
                    },
                    {
                        step: 3,
                        action: 'On the General tab, enter Name: **Suspicious Resource Deletion**'
                    },
                    {
                        step: 4,
                        action: 'Enter Description: **Detects when multiple Azure resources are deleted in a short time period**'
                    },
                    {
                        step: 5,
                        action: 'Under Tactics, select **Impact**',
                        context: 'This aligns with MITRE ATT&CK framework'
                    },
                    {
                        step: 6,
                        action: 'Set Severity to **High**'
                    },
                    {
                        step: 7,
                        action: 'Click **Next: Set rule logic**'
                    },
                    {
                        step: 8,
                        action: 'In the Rule query box, paste the provided KQL query'
                    },
                    {
                        step: 9,
                        action: 'Under Query scheduling, set **Run query every: 5 Minutes**'
                    },
                    {
                        step: 10,
                        action: 'Set **Lookup data from the last: 5 Minutes**'
                    },
                    {
                        step: 11,
                        action: 'Click **Next: Incident settings**'
                    },
                    {
                        step: 12,
                        action: 'Ensure **Create incidents from alerts** is Enabled'
                    },
                    {
                        step: 13,
                        action: 'Click **Next: Automated response**'
                    },
                    {
                        step: 14,
                        action: 'Skip automation for now, click **Next: Review**'
                    },
                    {
                        step: 15,
                        action: 'Review the rule configuration and click **Create**'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'kusto',
                        code: `// Detect multiple resource deletions in short time
AzureActivity
| where OperationNameValue endswith "DELETE"
| where ActivityStatusValue == "Success"
| summarize DeleteCount = count(), DeletedResources = make_set(Resource) by Caller, bin(TimeGenerated, 5m)
| where DeleteCount >= 3
| project TimeGenerated, Caller, DeleteCount, DeletedResources`,
                        description: 'KQL query to detect suspicious deletion activity'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the rule is created and enabled',
                    expectedResult: 'The rule should appear in the Analytics rules list with Status = Enabled'
                },

                hint: 'This rule will check every 5 minutes for deletion patterns. You will test it in the next task.'
            },

            {
                id: 'task-5',
                order: 5,
                title: 'Simulate Security Incident',
                description: 'Create test activity to trigger the analytics rule and generate a security incident.',

                knowledgeBlocks: [
                    {
                        type: 'tip',
                        title: 'Testing Detection Rules',
                        content: 'Always test your detection rules with simulated activity to ensure they work correctly before relying on them for real security monitoring.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure Portal, click the **Cloud Shell** icon (>_) in the top toolbar'
                    },
                    {
                        step: 2,
                        action: 'Select **PowerShell** if prompted'
                    },
                    {
                        step: 3,
                        action: 'Wait for Cloud Shell to initialize'
                    },
                    {
                        step: 4,
                        action: 'Run the provided script to create test resource groups'
                    },
                    {
                        step: 5,
                        action: 'Wait for all resource groups to be created (30-60 seconds)'
                    },
                    {
                        step: 6,
                        action: 'Run the deletion commands to trigger the detection rule'
                    },
                    {
                        step: 7,
                        action: 'Wait 5-10 minutes for the analytics rule to process the events',
                        context: 'The rule runs every 5 minutes'
                    },
                    {
                        step: 8,
                        action: 'In Sentinel, click **Incidents** in the left menu'
                    },
                    {
                        step: 9,
                        action: 'Look for the **Suspicious Resource Deletion** incident'
                    },
                    {
                        step: 10,
                        action: 'Click on the incident to open the details panel'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'powershell',
                        code: `# Create test resource groups
az group create --name test-rg-1 --location eastus
az group create --name test-rg-2 --location eastus
az group create --name test-rg-3 --location eastus
az group create --name test-rg-4 --location eastus

# Delete them to trigger the detection rule
az group delete --name test-rg-1 --yes --no-wait
az group delete --name test-rg-2 --yes --no-wait
az group delete --name test-rg-3 --yes --no-wait
az group delete --name test-rg-4 --yes --no-wait

Write-Host "Test activity created. Wait 5-10 minutes for incident to appear in Sentinel."`,
                        description: 'Script to simulate suspicious deletion activity'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the incident was created',
                    expectedResult: 'You should see a High severity incident titled "Suspicious Resource Deletion" with details about the deleted resources'
                },

                troubleshooting: [
                    'If no incident appears after 10 minutes, check the Analytics rule is Enabled',
                    'Verify the deletions were successful by checking Activity Log',
                    'Check the rule query ran successfully in the Analytics page'
                ],

                hint: 'Real incidents would require investigation, evidence collection, and remediation actions.'
            },

            {
                id: 'task-6',
                order: 6,
                title: 'Investigate Security Incident',
                description: 'Use Sentinel investigation tools to analyze the security incident and understand the attack timeline.',

                instructions: [
                    {
                        step: 1,
                        action: 'In the incident details panel, review the **Entities** section',
                        context: 'Entities include users, IPs, hosts involved in the incident'
                    },
                    {
                        step: 2,
                        action: 'Click the **View full details** button'
                    },
                    {
                        step: 3,
                        action: 'Review the incident timeline showing when events occurred'
                    },
                    {
                        step: 4,
                        action: 'Click the **Investigate** button to open the investigation graph'
                    },
                    {
                        step: 5,
                        action: 'Explore the visual graph showing relationships between entities'
                    },
                    {
                        step: 6,
                        action: 'Click on the **Caller** entity to see related activities'
                    },
                    {
                        step: 7,
                        action: 'Return to the incident details page'
                    },
                    {
                        step: 8,
                        action: 'Change the incident **Status** to **Active**'
                    },
                    {
                        step: 9,
                        action: 'Assign the incident to yourself using the **Owner** dropdown'
                    },
                    {
                        step: 10,
                        action: 'Add a comment: **Investigating suspicious deletion activity**'
                    },
                    {
                        step: 11,
                        action: 'Click **Apply** to save your changes'
                    }
                ],

                verification: {
                    type: 'quiz',
                    description: 'Test your understanding of incident investigation',
                    quiz: {
                        question: 'What is the primary purpose of the investigation graph in Microsoft Sentinel?',
                        options: [
                            'To delete security incidents automatically',
                            'To visualize relationships between entities involved in an incident',
                            'To create new analytics rules',
                            'To export incident data to Excel'
                        ],
                        correctAnswer: 1,
                        explanation: 'The investigation graph provides a visual representation of how different entities (users, IPs, resources) are related in a security incident, helping analysts understand the full scope of an attack.'
                    }
                },

                hint: 'In a real scenario, you would gather evidence, determine if it\'s a false positive, and take remediation actions if needed.',

                resources: [
                    {
                        title: 'Investigate Incidents in Sentinel',
                        url: 'https://docs.microsoft.com/azure/sentinel/investigate-cases',
                        type: 'documentation'
                    },
                    {
                        title: 'KQL Query Language',
                        url: 'https://docs.microsoft.com/azure/data-explorer/kusto/query/',
                        type: 'documentation'
                    }
                ]
            }
        ],

        summary: {
            whatYouLearned: [
                'How to deploy Log Analytics workspace for security monitoring',
                'How to enable and configure Microsoft Sentinel',
                'How to connect data sources using data connectors',
                'How to create analytics rules using KQL queries',
                'How to simulate and investigate security incidents',
                'How to use the investigation graph for threat analysis'
            ],
            nextSteps: [
                'Explore built-in analytics rule templates',
                'Connect additional data sources (Azure AD, Microsoft 365)',
                'Create automation playbooks using Logic Apps',
                'Learn advanced KQL for threat hunting',
                'Implement workbooks for security dashboards'
            ],
            additionalResources: [
                {
                    title: 'Microsoft Sentinel Documentation',
                    url: 'https://docs.microsoft.com/azure/sentinel/',
                    type: 'documentation'
                },
                {
                    title: 'KQL Learning Path',
                    url: 'https://docs.microsoft.com/learn/paths/sc-200-utilize-kql-for-azure-sentinel/',
                    type: 'tutorial'
                }
            ]
        }
    },

    /**
    * WS-HYPERV-2022: Windows Server Hyper-V
    * NO Cloud Slice - VM-based lab only
    */
    'ws-hyperv-2022': {
        id: 'ws-hyperv-2022-lab-1',
        courseId: 'ws-hyperv-2022',
        title: 'Getting Started with Hyper-V on Windows Server',
        description: 'Learn to install and configure Hyper-V, create virtual machines, and manage virtual networking on Windows Server 2022.',
        scenario: 'Northwind Traders is consolidating their physical servers using virtualization. As a systems administrator, you will set up Hyper-V and create virtual machines to host their applications.',
        estimatedTime: 45,
        difficulty: 'beginner',

        objectives: [
            'Install the Hyper-V role on Windows Server',
            'Create and configure virtual network switches',
            'Create a new virtual machine',
            'Configure VM settings and resources',
            'Manage VM snapshots for backup'
        ],

        prerequisites: [
            'Basic Windows Server administration knowledge',
            'Understanding of virtualization concepts',
            'Familiarity with PowerShell basics'
        ],

        introduction: {
            overview: 'Hyper-V is Microsoft\'s hardware virtualization platform that allows you to create and manage virtual machines on Windows Server. In this lab, you will install Hyper-V and create your first virtual machine.',
            scenario: 'Northwind Traders has multiple physical servers running different applications. To reduce hardware costs and improve resource utilization, they want to consolidate these servers using Hyper-V virtualization.',
            architecture: 'You will build: Windows Server 2022 → Hyper-V Role → Virtual Switch → Virtual Machine → Snapshot Management'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Install Hyper-V Role',
                description: 'Enable the Hyper-V role on your Windows Server 2022 instance.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Hyper-V Requirements',
                        content: 'Hyper-V requires a 64-bit processor with Second Level Address Translation (SLAT), VM Monitor Mode extensions, and hardware-assisted virtualization enabled in BIOS.'
                    },
                    {
                        type: 'important',
                        title: 'Server Restart Required',
                        content: 'Installing Hyper-V requires a server restart. Save any work before proceeding.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Connect to your Windows Server VM using the provided credentials'
                    },
                    {
                        step: 2,
                        action: 'Click the **Start** button and open **Server Manager**'
                    },
                    {
                        step: 3,
                        action: 'In Server Manager, click **Manage** in the top-right corner'
                    },
                    {
                        step: 4,
                        action: 'Select **Add Roles and Features** from the dropdown menu'
                    },
                    {
                        step: 5,
                        action: 'Click **Next** on the Before You Begin page'
                    },
                    {
                        step: 6,
                        action: 'Select **Role-based or feature-based installation** and click **Next**'
                    },
                    {
                        step: 7,
                        action: 'Ensure your server is selected and click **Next**'
                    },
                    {
                        step: 8,
                        action: 'On the Server Roles page, check the box for **Hyper-V**'
                    },
                    {
                        step: 9,
                        action: 'In the popup dialog, click **Add Features** to include management tools'
                    },
                    {
                        step: 10,
                        action: 'Click **Next** through the Features page'
                    },
                    {
                        step: 11,
                        action: 'Read the Hyper-V information and click **Next**'
                    },
                    {
                        step: 12,
                        action: 'On the Virtual Switches page, click **Next** (we\'ll create switches later)'
                    },
                    {
                        step: 13,
                        action: 'On the Migration page, click **Next**'
                    },
                    {
                        step: 14,
                        action: 'On the Default Stores page, accept defaults and click **Next**'
                    },
                    {
                        step: 15,
                        action: 'On the Confirmation page, check **Restart the destination server automatically if required**'
                    },
                    {
                        step: 16,
                        action: 'Click **Yes** to confirm automatic restart'
                    },
                    {
                        step: 17,
                        action: 'Click **Install** and wait for installation to complete'
                    },
                    {
                        step: 18,
                        action: 'The server will restart automatically'
                    },
                    {
                        step: 19,
                        action: 'After restart, reconnect to the server'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'powershell',
                        code: `# Alternative: Install Hyper-V using PowerShell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart

# Verify installation
Get-WindowsFeature -Name Hyper-V`,
                        description: 'PowerShell commands to install Hyper-V'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Hyper-V is installed',
                    expectedResult: 'After reconnecting, open Start menu and verify "Hyper-V Manager" is available in the Windows Administrative Tools folder'
                },

                troubleshooting: [
                    'If installation fails, verify virtualization is enabled in BIOS/UEFI',
                    'Ensure the server meets minimum hardware requirements',
                    'Check Windows Update is not blocking the installation'
                ],

                hint: 'The installation process takes 5-10 minutes including the restart.'
            },

            {
                id: 'task-2',
                order: 2,
                title: 'Create Virtual Network Switch',
                description: 'Set up a virtual network switch to enable network connectivity for your virtual machines.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Virtual Switch Types',
                        content: 'Hyper-V supports three switch types: External (connects to physical network), Internal (host and VMs only), and Private (VMs only). Each serves different networking scenarios.'
                    },
                    {
                        type: 'tip',
                        title: 'Management OS Sharing',
                        content: 'When creating an External switch, you can allow the management OS to share the network adapter. This is recommended for most scenarios.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Hyper-V Manager** from the Start menu'
                    },
                    {
                        step: 2,
                        action: 'In the left pane, click on your server name to select it'
                    },
                    {
                        step: 3,
                        action: 'In the right Actions pane, click **Virtual Switch Manager**'
                    },
                    {
                        step: 4,
                        action: 'Under Create virtual switch, select **External**'
                    },
                    {
                        step: 5,
                        action: 'Click **Create Virtual Switch**'
                    },
                    {
                        step: 6,
                        action: 'In the Name field, enter **External-Switch**'
                    },
                    {
                        step: 7,
                        action: 'Ensure **External network** is selected'
                    },
                    {
                        step: 8,
                        action: 'From the dropdown, select your physical network adapter'
                    },
                    {
                        step: 9,
                        action: 'Ensure **Allow management operating system to share this network adapter** is checked'
                    },
                    {
                        step: 10,
                        action: 'Click **OK** to create the switch'
                    },
                    {
                        step: 11,
                        action: 'Click **Yes** to confirm the network configuration change',
                        context: 'Your connection may briefly disconnect'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'powershell',
                        code: `# Create external virtual switch using PowerShell
New-VMSwitch -Name "External-Switch" -NetAdapterName "Ethernet" -AllowManagementOS $true

# Verify switch creation
Get-VMSwitch`,
                        description: 'PowerShell commands to create virtual switch'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the switch is created',
                    expectedResult: 'The External-Switch should appear in the Virtual Switch Manager list with Type = External'
                },

                hint: 'External switches allow VMs to communicate with the physical network and the internet.'
            },

            {
                id: 'task-3',
                order: 3,
                title: 'Create Your First Virtual Machine',
                description: 'Use the New Virtual Machine Wizard to create a Generation 2 virtual machine.',

                knowledgeBlocks: [
                    {
                        type: 'important',
                        title: 'Generation 1 vs Generation 2',
                        content: 'Generation 2 VMs support UEFI firmware, Secure Boot, and PXE boot using standard network adapter. Use Gen 2 for modern operating systems (Windows 8/Server 2012 and later).'
                    },
                    {
                        type: 'note',
                        title: 'Dynamic Memory',
                        content: 'Dynamic Memory allows Hyper-V to automatically adjust VM memory allocation based on demand, improving resource utilization across multiple VMs.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Hyper-V Manager, right-click on your server name'
                    },
                    {
                        step: 2,
                        action: 'Select **New** → **Virtual Machine**'
                    },
                    {
                        step: 3,
                        action: 'Click **Next** on the Before You Begin page'
                    },
                    {
                        step: 4,
                        action: 'Enter Name: **TestVM-01**'
                    },
                    {
                        step: 5,
                        action: 'Optionally, change the storage location if needed'
                    },
                    {
                        step: 6,
                        action: 'Click **Next**'
                    },
                    {
                        step: 7,
                        action: 'Select **Generation 2** and click **Next**'
                    },
                    {
                        step: 8,
                        action: 'Enter Startup memory: **2048** MB'
                    },
                    {
                        step: 9,
                        action: 'Check the box for **Use Dynamic Memory for this virtual machine**'
                    },
                    {
                        step: 10,
                        action: 'Click **Next**'
                    },
                    {
                        step: 11,
                        action: 'From the Connection dropdown, select **External-Switch**'
                    },
                    {
                        step: 12,
                        action: 'Click **Next**'
                    },
                    {
                        step: 13,
                        action: 'Select **Create a virtual hard disk**'
                    },
                    {
                        step: 14,
                        action: 'Enter Size: **40** GB'
                    },
                    {
                        step: 15,
                        action: 'Click **Next**'
                    },
                    {
                        step: 16,
                        action: 'Select **Install an operating system later**'
                    },
                    {
                        step: 17,
                        action: 'Click **Next**'
                    },
                    {
                        step: 18,
                        action: 'Review the summary and click **Finish**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the VM is created',
                    expectedResult: 'TestVM-01 should appear in the Virtual Machines list in Hyper-V Manager with State = Off'
                },

                troubleshooting: [
                    'If VM creation fails, ensure you have sufficient disk space',
                    'Verify the default VM storage path is accessible',
                    'Check you have administrative privileges'
                ],

                hint: 'You can start the VM later after attaching an ISO file or network boot source.'
            },

            {
                id: 'task-4',
                order: 4,
                title: 'Configure VM Settings',
                description: 'Modify virtual machine settings to optimize performance and configure additional resources.',

                instructions: [
                    {
                        step: 1,
                        action: 'In Hyper-V Manager, right-click on **TestVM-01**'
                    },
                    {
                        step: 2,
                        action: 'Select **Settings** from the context menu'
                    },
                    {
                        step: 3,
                        action: 'In the left pane, click **Processor**'
                    },
                    {
                        step: 4,
                        action: 'Change Number of virtual processors to **2**'
                    },
                    {
                        step: 5,
                        action: 'Click **Memory** in the left pane'
                    },
                    {
                        step: 6,
                        action: 'Note the Minimum RAM is 512 MB and Maximum RAM is 2048 MB',
                        context: 'These are set automatically with Dynamic Memory'
                    },
                    {
                        step: 7,
                        action: 'Click **Integration Services** in the left pane'
                    },
                    {
                        step: 8,
                        action: 'Verify all integration services are enabled',
                        context: 'These provide enhanced VM functionality'
                    },
                    {
                        step: 9,
                        action: 'Click **Checkpoints** in the left pane'
                    },
                    {
                        step: 10,
                        action: 'Note that Production checkpoints are enabled by default'
                    },
                    {
                        step: 11,
                        action: 'Click **OK** to save the settings'
                    }
                ],

                verification: {
                    type: 'quiz',
                    description: 'Test your understanding of VM configuration',
                    quiz: {
                        question: 'What is the benefit of using Dynamic Memory in Hyper-V?',
                        options: [
                            'It makes VMs start faster',
                            'It automatically adjusts memory allocation based on VM demand',
                            'It reduces disk space usage',
                            'It improves network performance'
                        ],
                        correctAnswer: 1,
                        explanation: 'Dynamic Memory allows Hyper-V to automatically allocate memory to VMs based on their current needs, improving overall host resource utilization when running multiple VMs.'
                    }
                },

                hint: 'You can modify VM settings at any time, but some changes require the VM to be powered off.'
            },

            {
                id: 'task-5',
                order: 5,
                title: 'Create and Manage VM Snapshots',
                description: 'Learn to create checkpoints (snapshots) for backup and recovery purposes.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Checkpoints vs Snapshots',
                        content: 'Hyper-V calls snapshots "checkpoints". They capture the state, data, and hardware configuration of a VM at a specific point in time, allowing you to revert if needed.'
                    },
                    {
                        type: 'warning',
                        title: 'Production Checkpoints',
                        content: 'Production checkpoints use Volume Shadow Copy Service (VSS) and are recommended for production environments. Standard checkpoints save the exact memory state but may cause issues with some applications.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'In Hyper-V Manager, right-click on **TestVM-01**'
                    },
                    {
                        step: 2,
                        action: 'Select **Checkpoint** from the context menu'
                    },
                    {
                        step: 3,
                        action: 'Wait for the checkpoint to be created (5-10 seconds)'
                    },
                    {
                        step: 4,
                        action: 'In the Checkpoints section (bottom-middle pane), you will see the new checkpoint'
                    },
                    {
                        step: 5,
                        action: 'Right-click on the checkpoint'
                    },
                    {
                        step: 6,
                        action: 'Select **Rename** and enter **Initial Configuration**'
                    },
                    {
                        step: 7,
                        action: 'Press Enter to save the name'
                    },
                    {
                        step: 8,
                        action: 'Right-click on the checkpoint again'
                    },
                    {
                        step: 9,
                        action: 'Review the available options: Apply, Export, Delete'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'powershell',
                        code: `# Create a checkpoint using PowerShell
Checkpoint-VM -Name "TestVM-01" -SnapshotName "Initial Configuration"

# List all checkpoints
Get-VMSnapshot -VMName "TestVM-01"

# Apply (revert to) a checkpoint
Restore-VMSnapshot -Name "Initial Configuration" -VMName "TestVM-01" -Confirm:$false`,
                        description: 'PowerShell commands for checkpoint management'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify the checkpoint is created',
                    expectedResult: 'You should see "Initial Configuration" checkpoint in the Checkpoints pane with the current date and time'
                },

                troubleshooting: [
                    'If checkpoint creation fails, ensure you have sufficient disk space',
                    'Verify the VM is not in a saved state',
                    'Check that checkpoints are enabled in VM settings'
                ],

                hint: 'Checkpoints are stored as .avhdx files in the same location as the VM\'s virtual hard disk.',

                resources: [
                    {
                        title: 'Hyper-V Checkpoints',
                        url: 'https://docs.microsoft.com/windows-server/virtualization/hyper-v/manage/choose-between-standard-or-production-checkpoints-in-hyper-v',
                        type: 'documentation'
                    }
                ]
            }
        ],

        summary: {
            whatYouLearned: [
                'How to install and configure the Hyper-V role on Windows Server',
                'How to create virtual network switches for VM connectivity',
                'How to create Generation 2 virtual machines',
                'How to configure VM settings including processors and memory',
                'How to create and manage VM checkpoints for backup',
                'How to use PowerShell for Hyper-V management tasks'
            ],
            nextSteps: [
                'Install an operating system on your VM',
                'Explore live migration for moving VMs between hosts',
                'Learn about Hyper-V Replica for disaster recovery',
                'Configure virtual machine resource metering',
                'Implement nested virtualization for testing'
            ],
            additionalResources: [
                {
                    title: 'Hyper-V on Windows Server',
                    url: 'https://docs.microsoft.com/windows-server/virtualization/hyper-v/hyper-v-on-windows-server',
                    type: 'documentation'
                },
                {
                    title: 'Hyper-V PowerShell Module',
                    url: 'https://docs.microsoft.com/powershell/module/hyper-v/',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * DP-700T00-A: Implement data engineering solutions using Microsoft Fabric [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'dp-700t00-a': {
        id: 'dp-700-lab-1',
        courseId: 'dp-700t00-a',
        title: 'Build a Lakehouse in Microsoft Fabric',
        description: 'Design and implement a Lakehouse architecture using Microsoft Fabric for end-to-end data engineering.',
        scenario: 'Wide World Importers wants to modernize their data analytics platform. As a Data Engineer, you need to set up a Lakehouse in Microsoft Fabric to ingest, transform, and serve data for their sales and inventory teams.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Create a Microsoft Fabric workspace',
            'Provision a Lakehouse artifact',
            'Ingest data using Dataflow Gen2',
            'Transform data with Notebooks using PySpark',
            'Build a data model for reporting'
        ],

        prerequisites: [
            'Understanding of data engineering concepts',
            'Familiarity with SQL and Python (PySpark)',
            'Microsoft Fabric enabled subscription (provided)'
        ],

        introduction: {
            overview: 'Microsoft Fabric is an all-in-one analytics solution for enterprises. In this lab, you will explore the Data Engineering experience by building a Lakehouse, which combines the flexibility of a data lake with the management of a data warehouse.',
            scenario: 'Wide World Importers has legacy data in CSV files and SQL databases. They want to consolidate this into a single source of truth. You will create a Lakehouse to store this data and use Fabric tools to process it.',
            architecture: 'Source Data (CSV/SQL) → Dataflow Gen2 → Lakehouse (Bronze/Silver/Gold) → SQL Endpoint → Power BI'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Fabric Workspace and Lakehouse',
                description: 'Set up the environment by creating a new workspace and a Lakehouse artifact.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Fabric Workspaces',
                        content: 'Workspaces are places to collaborate with colleagues to create collections of items such as lakehouses, warehouses, and reports.'
                    }
                ],

                instructions: [
                    {
                        step: 1,
                        action: 'Open the Microsoft Fabric portal (https://app.fabric.microsoft.com)'
                    },
                    {
                        step: 2,
                        action: 'Select the **Data Engineering** experience from the bottom left icon'
                    },
                    {
                        step: 3,
                        action: 'Click **Workspaces** in the left navigation and select **+ New workspace**'
                    },
                    {
                        step: 4,
                        action: 'Name the workspace **WWI-Fabric-[YourInitials]** and click **Apply**'
                    },
                    {
                        step: 5,
                        action: 'In the workspace, click **New** and select **Lakehouse**'
                    },
                    {
                        step: 6,
                        action: 'Name it **SalesLakehouse** and click **Create**'
                    },
                    {
                        step: 7,
                        action: 'Wait for the Lakehouse editor to open'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Lakehouse creation',
                    expectedResult: 'You should see the Lakehouse explorer with "Tables" and "Files" sections.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Ingest Data with Dataflow Gen2',
                description: 'Use the low-code Dataflow Gen2 to import data from an eternal source.',

                instructions: [
                    {
                        step: 1,
                        action: 'In the Lakehouse, click **Get data** -> **New Dataflow Gen2**'
                    },
                    {
                        step: 2,
                        action: 'Select **Import from text/CSV**'
                    },
                    {
                        step: 3,
                        action: 'Enter the URL for sample sales data provided in the lab resources'
                    },
                    {
                        step: 4,
                        action: 'Click **Next** to preview the data'
                    },
                    {
                        step: 5,
                        action: 'Transform column types if necessary (e.g., ensure Dates are Date type)'
                    },
                    {
                        step: 6,
                        action: 'Click **Publish** to run the dataflow and load data into the Lakehouse'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify data load',
                    expectedResult: 'After the dataflow completes, refresh the "Tables" section in Lakehouse explorer to see the new table.'
                }
            },
            {
                id: 'task-3',
                order: 3,
                title: 'Transform Data with Notebooks',
                description: 'Use a Spark notebook to perform advanced data transformations.',

                instructions: [
                    {
                        step: 1,
                        action: 'Click **Open notebook** -> **New notebook** in the top menu'
                    },
                    {
                        step: 2,
                        action: 'Drag the sales table from the explorer to a code cell to generate load code'
                    },
                    {
                        step: 3,
                        action: 'Add PySpark code to aggregate sales by region'
                    },
                    {
                        step: 4,
                        action: 'Run the notebook cell'
                    },
                    {
                        step: 5,
                        action: 'Write the aggregated data back to a new table "SalesByRegion"'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'python',
                        code: `df = spark.sql("SELECT * FROM SalesLakehouse.Sales")
aggregated_df = df.groupBy("Region").sum("Amount")
aggregated_df.write.format("delta").saveAsTable("SalesByRegion")`,
                        description: 'PySpark aggregation code'
                    }
                ],

                verification: {
                    type: 'quiz',
                    description: 'Check understanding',
                    quiz: {
                        question: 'Which engine processes the notebook code?',
                        options: ['SQL Serverless', 'Spark', 'Dataflow', 'KQL'],
                        correctAnswer: 1,
                        explanation: 'Fabric Notebooks use Apache Spark for distributed data processing.'
                    }
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Provisioning Fabric workspaces and Lakehouses',
                'Ingesting data using low-code Dataflows',
                'Processing data using Spark Notebooks',
                'Managing Lakehouse tables'
            ],
            nextSteps: [
                'Connect Power BI to your Lakehouse SQL Endpoint',
                'Explore Data Pipelines for orchestration',
                'Implement Row-Level Security'
            ],
            additionalResources: [
                {
                    title: 'Microsoft Fabric Documentation',
                    url: 'https://learn.microsoft.com/fabric/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
     * WS011WV-2025: Windows Server 2025 Administration - Comprehensive 16-Module Training
     * VM-ONLY LAB: No Azure Portal access required
     */
    'ws011wv-2025': {
        id: 'ws011-lab-comprehensive',
        courseId: 'ws011wv-2025',
        title: 'Windows Server 2025 Administration - Complete Hands-On Training',
        description: 'Comprehensive 16-module hands-on lab covering all aspects of Windows Server 2025 administration from User Management to Real-world Troubleshooting.',
        scenario: 'You are a Windows Server Administrator at Contoso Corporation. This comprehensive training will prepare you for real-world server administration tasks across all key areas.',
        estimatedTime: 480,
        difficulty: 'intermediate',

        objectives: [
            'Master local and Active Directory user management',
            'Deploy and manage Active Directory Domain Services',
            'Configure DNS and DHCP services',
            'Implement Group Policy for centralized management',
            'Manage file servers and storage solutions',
            'Configure networking and security hardening',
            'Automate tasks using PowerShell',
            'Implement backup and disaster recovery',
            'Manage Hyper-V virtualization',
            'Monitor and optimize server performance',
            'Handle real-world troubleshooting scenarios'
        ],

        prerequisites: [
            'Basic Windows operating system knowledge',
            'Understanding of networking concepts (TCP/IP, DNS, DHCP)',
            'RDP client installed for VM access'
        ],

        introduction: {
            overview: 'This comprehensive lab covers 16 modules of Windows Server 2025 administration. You will work through practical scenarios that mirror real-world enterprise environments, building skills from basic server setup to advanced troubleshooting.',
            scenario: 'Throughout this lab, you will build and manage a complete Windows Server infrastructure for Contoso Corporation, implementing best practices and handling common administrative tasks.',
            architecture: 'Windows Server 2025 VM → Active Directory Domain → DNS/DHCP Services → File Services → Group Policy → Hyper-V → Monitoring & Security'
        },

        tasks: [
            // TASK 1: Module 1 & 2 - Server Setup and User Management
            {
                id: 'task-1',
                order: 1,
                title: 'Module 2: User & Group Management (Local & AD)',
                description: 'Comprehensive user/group management using GUI and PowerShell, including NTFS permissions and password policies.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Windows Server 2025 New Features',
                        content: 'Windows Server 2025 introduces Hotpatching, enhanced security features, improved Hyper-V capabilities, and better cloud integration options.'
                    },
                    {
                        type: 'tip',
                        title: 'NTFS vs Share Permissions',
                        content: 'NTFS permissions apply to both local and network access, while Share permissions only apply to network access. The most restrictive permission always wins.'
                    }
                ],

                instructions: [
                    // Local User Management
                    { step: 1, action: 'Open **Computer Management** → **Local Users and Groups**' },
                    { step: 2, action: 'Create local user **JohnDoe** with password **P@ssw0rd123**' },
                    { step: 3, action: 'Create local group **IT_Admins**' },
                    { step: 4, action: 'Add JohnDoe to IT_Admins group' },

                    // NTFS Permissions
                    { step: 5, action: 'Create folder **C:\\SharedData**' },
                    { step: 6, action: 'Right-click → **Properties** → **Security** tab' },
                    { step: 7, action: 'Click **Edit** → **Add** → Add **IT_Admins** group with **Modify** permission' },
                    { step: 8, action: 'Add **Users** group with **Read** permission' },

                    // PowerShell User Management
                    { step: 9, action: 'Open **PowerShell** as Administrator' },
                    { step: 10, action: 'Run: `New-LocalUser -Name "JaneSmith" -Password (ConvertTo-SecureString "P@ssw0rd123" -AsPlainText -Force)`' },
                    { step: 11, action: 'Run: `Add-LocalGroupMember -Group "IT_Admins" -Member "JaneSmith"`' },
                    { step: 12, action: 'Run: `Get-LocalGroupMember -Group "IT_Admins"` to verify' },

                    // Password Policies
                    { step: 13, action: 'Open **Local Security Policy** (secpol.msc)' },
                    { step: 14, action: 'Navigate to **Account Policies** → **Password Policy**' },
                    { step: 15, action: 'Set **Minimum password length** to **12 characters**' },
                    { step: 16, action: 'Enable **Password must meet complexity requirements**' },
                    { step: 17, action: 'Set **Maximum password age** to **90 days**' },

                    // Account Lockout Policy
                    { step: 18, action: 'Navigate to **Account Policies** → **Account Lockout Policy**' },
                    { step: 19, action: 'Set **Account lockout threshold** to **5 invalid attempts**' },
                    { step: 20, action: 'Set **Account lockout duration** to **30 minutes**' },
                    { step: 21, action: 'Click **Apply** and close Local Security Policy' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify user and group configuration',
                    expectedResult: 'Users JohnDoe and JaneSmith exist in IT_Admins group. C:\\SharedData has IT_Admins with Modify and Users with Read permissions. Password policy requires 12 characters minimum with complexity. Account lockout set to 5 attempts.'
                }
            },

            // TASK 2: Module 3 - Active Directory Domain Services
            {
                id: 'task-2',
                order: 2,
                title: 'Module 3: Active Directory Domain Services (AD DS)',
                description: 'Install AD DS, promote server to Domain Controller, create domain structure, and manage FSMO roles.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'FSMO Roles',
                        content: 'Five FSMO roles: Schema Master and Domain Naming Master (forest-wide); RID Master, PDC Emulator, and Infrastructure Master (domain-wide).'
                    },
                    {
                        type: 'warning',
                        title: 'Domain Controller Promotion',
                        content: 'Promoting a server to Domain Controller will restart the server automatically. Ensure all work is saved before proceeding.'
                    }
                ],

                instructions: [
                    // Install AD DS Role
                    { step: 1, action: 'Open **Server Manager** → **Manage** → **Add Roles and Features**' },
                    { step: 2, action: 'Click **Next** until **Server Roles** page' },
                    { step: 3, action: 'Select **Active Directory Domain Services**' },
                    { step: 4, action: 'Click **Add Features** when prompted, then **Next**' },
                    { step: 5, action: 'Click **Next** → **Next** → **Install**' },
                    { step: 6, action: 'Wait for installation to complete (do not close window)' },

                    // Promote to Domain Controller
                    { step: 7, action: 'Click **Promote this server to a domain controller** link' },
                    { step: 8, action: 'Select **Add a new forest**' },
                    { step: 9, action: 'Enter Root domain name: **contoso.local**' },
                    { step: 10, action: 'Click **Next**' },
                    { step: 11, action: 'Set Forest/Domain functional level to **Windows Server 2025**' },
                    { step: 12, action: 'Ensure **Domain Name System (DNS) server** is checked' },
                    { step: 13, action: 'Enter DSRM password: **P@ssw0rd123!** (confirm it)' },
                    { step: 14, action: 'Click **Next** (ignore DNS delegation warning)' },
                    { step: 15, action: 'Verify NetBIOS name is **CONTOSO**, click **Next**' },
                    { step: 16, action: 'Accept default paths for Database, Log files, and SYSVOL' },
                    { step: 17, action: 'Review options, click **Next**' },
                    { step: 18, action: 'Wait for prerequisite check, then click **Install**' },
                    { step: 19, action: 'Server will restart automatically - wait for restart' },
                    { step: 20, action: 'Login as **CONTOSO\\Administrator** with your password' },

                    // Create OU Structure
                    { step: 21, action: 'Open **Active Directory Users and Computers** (dsa.msc)' },
                    { step: 22, action: 'Expand **contoso.local** domain' },
                    { step: 23, action: 'Right-click **contoso.local** → **New** → **Organizational Unit**' },
                    { step: 24, action: 'Name it **Departments**, uncheck **Protect from deletion**' },
                    { step: 25, action: 'Create sub-OUs under Departments: **IT**, **HR**, **Sales**' },

                    // Create Domain Users
                    { step: 26, action: 'Right-click **IT** OU → **New** → **User**' },
                    { step: 27, action: 'First name: **Admin**, Last name: **User**, Logon name: **adminuser**' },
                    { step: 28, action: 'Set password **P@ssw0rd123!**, uncheck **User must change password**' },
                    { step: 29, action: 'Right-click **adminuser** → **Add to a group** → Enter **Domain Admins** → **OK**' },
                    { step: 30, action: 'Create 2 more users in HR OU: **hruser1** and **hruser2**' },

                    // Create Security and Distribution Groups
                    { step: 31, action: 'Right-click **IT** OU → **New** → **Group**' },
                    { step: 32, action: 'Name: **IT_Security**, Group scope: **Global**, Group type: **Security**' },
                    { step: 33, action: 'Create another group: **IT_Distribution**, Group type: **Distribution**' },
                    { step: 34, action: 'Add adminuser to IT_Security group' },

                    // Verify FSMO Roles
                    { step: 35, action: 'Open **PowerShell** as Administrator' },
                    { step: 36, action: 'Run: `netdom query fsmo`' },
                    { step: 37, action: 'Verify all 5 FSMO roles are on **WS2025-DC01**' },

                    // Backup System State
                    { step: 38, action: 'In Server Manager, click **Tools** → **Windows Server Backup**' },
                    { step: 39, action: 'Click **Backup Once** → **Different options**' },
                    { step: 40, action: 'Select **Custom**, click **Next**' },
                    { step: 41, action: 'Click **Add Items** → Select **System state** → **OK**' },
                    { step: 42, action: 'Choose **Local drives**, select a drive with space, click **Next** → **Backup**' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Active Directory configuration',
                    expectedResult: 'Domain contoso.local created with OUs (Departments/IT/HR/Sales). User adminuser in Domain Admins. Groups IT_Security and IT_Distribution created. All 5 FSMO roles on WS2025-DC01. System State backup completed.'
                }
            },

            // TASK 3: Module 4 - DNS Administration
            {
                id: 'task-3',
                order: 3,
                title: 'Module 4: DNS Administration',
                description: 'Configure DNS zones, create DNS records, and integrate with Active Directory.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'DNS Record Types',
                        content: 'A record: Maps hostname to IPv4. CNAME: Alias for another name. MX: Mail exchange server. PTR: Reverse lookup (IP to hostname).'
                    }
                ],

                instructions: [
                    // DNS Configuration
                    { step: 1, action: 'Open **DNS Manager** from Server Manager → Tools' },
                    { step: 2, action: 'Expand **WS2025-DC01** → **Forward Lookup Zones**' },
                    { step: 3, action: 'Verify **contoso.local** zone exists (created during AD installation)' },

                    // Create Forward Lookup Zone
                    { step: 4, action: 'Right-click **Forward Lookup Zones** → **New Zone**' },
                    { step: 5, action: 'Click **Next** → Select **Primary zone** → **Next**' },
                    { step: 6, action: 'Enter zone name: **lab.contoso.local** → **Next**' },
                    { step: 7, action: 'Accept default zone file name → **Next** → **Finish**' },

                    // Create DNS Records
                    { step: 8, action: 'Right-click **lab.contoso.local** → **New Host (A or AAAA)**' },
                    { step: 9, action: 'Name: **web**, IP: **192.168.1.100** → **Add Host**' },
                    { step: 10, action: 'Create another A record: Name: **mail**, IP: **192.168.1.101**' },

                    // Create CNAME Record
                    { step: 11, action: 'Right-click **lab.contoso.local** → **New Alias (CNAME)**' },
                    { step: 12, action: 'Alias name: **www**, FQDN: **web.lab.contoso.local** → **OK**' },

                    // Create MX Record
                    { step: 13, action: 'Right-click **lab.contoso.local** → **New Mail Exchanger (MX)**' },
                    { step: 14, action: 'Leave Host blank, FQDN: **mail.lab.contoso.local**, Priority: **10** → **OK**' },

                    // Create Reverse Lookup Zone
                    { step: 15, action: 'Right-click **Reverse Lookup Zones** → **New Zone**' },
                    { step: 16, action: 'Click **Next** → **Primary zone** → **Next**' },
                    { step: 17, action: 'Select **IPv4 Reverse Lookup Zone** → **Next**' },
                    { step: 18, action: 'Network ID: **192.168.1** → **Next** → **Next** → **Finish**' },

                    // Create PTR Record
                    { step: 19, action: 'Right-click **1.168.192.in-addr.arpa** zone → **New Pointer (PTR)**' },
                    { step: 20, action: 'Host IP: **192.168.1.10**, Hostname: **ws2025-dc01.contoso.local** → **OK**' },

                    // Test DNS
                    { step: 21, action: 'Open **PowerShell**' },
                    { step: 22, action: 'Run: `nslookup web.lab.contoso.local` - should return 192.168.1.100' },
                    { step: 23, action: 'Run: `nslookup www.lab.contoso.local` - should resolve to web.lab.contoso.local' },
                    { step: 24, action: 'Run: `nslookup 192.168.1.10` - should return ws2025-dc01.contoso.local' },
                    { step: 25, action: 'Run: `ping web.lab.contoso.local` to test resolution' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify DNS configuration',
                    expectedResult: 'Forward zone lab.contoso.local created with A records (web, mail), CNAME (www), and MX record. Reverse zone 1.168.192.in-addr.arpa created with PTR record. nslookup tests successful.'
                }
            },

            // TASK 4: Module 5 - DHCP Administration
            {
                id: 'task-4',
                order: 4,
                title: 'Module 5: DHCP Administration',
                description: 'Install DHCP role, create scopes, configure options, and set up reservations.',

                instructions: [
                    // Install DHCP Role
                    { step: 1, action: 'Open **Server Manager** → **Add Roles and Features**' },
                    { step: 2, action: 'Click **Next** until **Server Roles**, select **DHCP Server**' },
                    { step: 3, action: 'Click **Add Features** → **Next** → **Next** → **Install**' },
                    { step: 4, action: 'After installation, click **Complete DHCP configuration**' },
                    { step: 5, action: 'Click **Commit** → **Close**' },

                    // Create DHCP Scope
                    { step: 6, action: 'Open **DHCP** from Server Manager → Tools' },
                    { step: 7, action: 'Expand **WS2025-DC01** → Right-click **IPv4** → **New Scope**' },
                    { step: 8, action: 'Click **Next**, Name: **Lab Scope**, Description: **Main office network**' },
                    { step: 9, action: 'Start IP: **192.168.1.100**, End IP: **192.168.1.200**, Subnet mask: **255.255.255.0**' },
                    { step: 10, action: 'Click **Next**' },

                    // Configure Exclusions
                    { step: 11, action: 'Add exclusion: Start: **192.168.1.100**, End: **192.168.1.110** (reserve for servers)' },
                    { step: 12, action: 'Click **Add** → **Next**' },

                    // Set Lease Duration
                    { step: 13, action: 'Set lease duration to **8 days** → **Next**' },

                    // Configure DHCP Options
                    { step: 14, action: 'Select **Yes, I want to configure these options now** → **Next**' },
                    { step: 15, action: 'Router (Default Gateway): **192.168.1.1** → **Add** → **Next**' },
                    { step: 16, action: 'DNS Server: **192.168.1.10** (this server) → **Add** → **Next**' },
                    { step: 17, action: 'WINS Servers: Skip → **Next**' },
                    { step: 18, action: 'Select **Yes, I want to activate this scope now** → **Next** → **Finish**' },

                    // Create Reservation
                    { step: 19, action: 'Expand **Scope [192.168.1.0] Lab Scope**' },
                    { step: 20, action: 'Right-click **Reservations** → **New Reservation**' },
                    { step: 21, action: 'Name: **Printer1**, IP: **192.168.1.150**, MAC: **00-15-5D-00-00-01**' },
                    { step: 22, action: 'Click **Add** → **Close**' },

                    // Verify DHCP
                    { step: 23, action: 'Right-click **IPv4** → **Display Statistics**' },
                    { step: 24, action: 'Verify scope is active and shows available addresses' },
                    { step: 25, action: 'In PowerShell, run: `Get-DhcpServerv4Scope` to verify configuration' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify DHCP configuration',
                    expectedResult: 'DHCP scope 192.168.1.100-200 created with exclusion 100-110. Lease duration 8 days. Options configured: Gateway 192.168.1.1, DNS 192.168.1.10. Reservation for Printer1 at 192.168.1.150.'
                }
            },

            // TASK 5: Module 6 - Group Policy (GPO)
            {
                id: 'task-5',
                order: 5,
                title: 'Module 6: Group Policy (GPO)',
                description: 'Create and configure Group Policy Objects for centralized management, including password policies, desktop restrictions, and software deployment.',

                knowledgeBlocks: [
                    {
                        type: 'tip',
                        title: 'GPO Processing Order',
                        content: 'GPOs are processed in order: Local → Site → Domain → OU. Settings applied last take precedence unless "Enforced" is set.'
                    }
                ],

                instructions: [
                    // Create Password Policy GPO
                    { step: 1, action: 'Open **Group Policy Management** from Server Manager → Tools' },
                    { step: 2, action: 'Expand **Forest: contoso.local** → **Domains** → **contoso.local**' },
                    { step: 3, action: 'Right-click **Group Policy Objects** → **New**' },
                    { step: 4, action: 'Name: **Domain Password Policy** → **OK**' },
                    { step: 5, action: 'Right-click **Domain Password Policy** → **Edit**' },
                    { step: 6, action: 'Navigate to **Computer Configuration** → **Policies** → **Windows Settings** → **Security Settings** → **Account Policies** → **Password Policy**' },
                    { step: 7, action: 'Set **Minimum password length** to **14 characters**' },
                    { step: 8, action: 'Enable **Password must meet complexity requirements**' },
                    { step: 9, action: 'Set **Maximum password age** to **60 days**' },
                    { step: 10, action: 'Close Group Policy Editor' },
                    { step: 11, action: 'Link GPO: Right-click **contoso.local** domain → **Link an Existing GPO** → Select **Domain Password Policy**' },

                    // Create Desktop Restrictions GPO
                    { step: 12, action: 'Create new GPO: **Desktop Restrictions**' },
                    { step: 13, action: 'Edit the GPO, navigate to **User Configuration** → **Policies** → **Administrative Templates** → **Control Panel**' },
                    { step: 14, action: 'Enable **Prohibit access to Control Panel and PC settings**' },
                    { step: 15, action: 'Navigate to **Desktop** → Enable **Remove Recycle Bin icon from desktop**' },
                    { step: 16, action: 'Navigate to **System** → **Removable Storage Access**' },
                    { step: 17, action: 'Enable **All Removable Storage classes: Deny all access** (USB blocking)' },
                    { step: 18, action: 'Close editor, link GPO to **HR** OU' },

                    // Create Folder Redirection GPO
                    { step: 19, action: 'Create new GPO: **Folder Redirection**' },
                    { step: 20, action: 'Edit GPO, navigate to **User Configuration** → **Policies** → **Windows Settings** → **Folder Redirection** → **Documents**' },
                    { step: 21, action: 'Right-click **Documents** → **Properties**' },
                    { step: 22, action: 'Setting: **Basic**, Target folder location: **\\\\\\\\WS2025-DC01\\\\Users\\\\%USERNAME%\\\\Documents**' },
                    { step: 23, action: 'Click **OK**, link GPO to **IT** OU' },

                    // Test GPO Application
                    { step: 24, action: 'Open **PowerShell** as Administrator' },
                    { step: 25, action: 'Run: `gpupdate /force` to apply GPOs immediately' },
                    { step: 26, action: 'Run: `gpresult /r` to view applied GPOs' },
                    { step: 27, action: 'Run: `rsop.msc` to open Resultant Set of Policy' },
                    { step: 28, action: 'Verify password policy and desktop restrictions are applied' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Group Policy configuration',
                    expectedResult: 'Three GPOs created: Domain Password Policy (linked to domain), Desktop Restrictions (linked to HR OU with Control Panel blocked and USB disabled), Folder Redirection (linked to IT OU). gpresult shows policies applied.'
                }
            },

            // TASK 6: Module 7-8 - File Server & Networking
            {
                id: 'task-6',
                order: 6,
                title: 'Module 7-8: File Server & Windows Networking',
                description: 'Configure file shares, NTFS/Share permissions, quotas, and network settings including firewall rules.',

                instructions: [
                    // Create Shared Folders
                    { step: 1, action: 'Create folder **C:\\\\Shares\\\\Public**' },
                    { step: 2, action: 'Right-click folder → **Properties** → **Sharing** tab → **Advanced Sharing**' },
                    { step: 3, action: 'Check **Share this folder**, Share name: **Public**' },
                    { step: 4, action: 'Click **Permissions** → Add **Everyone** with **Read** permission' },
                    { step: 5, action: 'Click **OK**, switch to **Security** tab' },
                    { step: 6, action: 'Add **Domain Users** with **Modify** NTFS permission' },
                    { step: 7, action: 'Create another share: **C:\\\\Shares\\\\IT** with share name **IT$** (hidden share)' },
                    { step: 8, action: 'Give **IT_Security** group **Full Control** on both Share and NTFS permissions' },

                    // Configure Quotas
                    { step: 9, action: 'Open **Server Manager** → **File and Storage Services** → **Shares**' },
                    { step: 10, action: 'Right-click **Public** share → **Properties** → **Quota**' },
                    { step: 11, action: 'Enable quotas, set **Limit disk space to: 100 MB**' },
                    { step: 12, action: 'Set warning level to **80 MB** → **OK**' },

                    // Network Configuration
                    { step: 13, action: 'Open **Network and Sharing Center** → **Change adapter settings**' },
                    { step: 14, action: 'Right-click network adapter → **Properties**' },
                    { step: 15, action: 'Verify **Internet Protocol Version 4 (TCP/IPv4)** settings: IP 192.168.1.10, Subnet 255.255.255.0, Gateway 192.168.1.1, DNS 127.0.0.1' },

                    // Firewall Configuration
                    { step: 16, action: 'Open **Windows Defender Firewall with Advanced Security**' },
                    { step: 17, action: 'Click **Inbound Rules** → **New Rule**' },
                    { step: 18, action: 'Rule Type: **Port** → **Next**' },
                    { step: 19, action: 'Protocol: **TCP**, Specific ports: **8080** → **Next**' },
                    { step: 20, action: 'Action: **Allow the connection** → **Next**' },
                    { step: 21, action: 'Apply to: **Domain, Private, Public** → **Next**' },
                    { step: 22, action: 'Name: **Allow Web App Port 8080** → **Finish**' },

                    // Test Connectivity
                    { step: 23, action: 'Open **PowerShell**' },
                    { step: 24, action: 'Run: `Test-Connection -ComputerName 192.168.1.1 -Count 4` (ping gateway)' },
                    { step: 25, action: 'Run: `Test-NetConnection -ComputerName web.lab.contoso.local -Port 80`' },
                    { step: 26, action: 'Run: `Get-NetFirewallRule -DisplayName "Allow Web App*"` to verify firewall rule' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify file sharing and networking',
                    expectedResult: 'Shares created: Public (Everyone Read, Domain Users Modify) and IT$ (IT_Security Full Control). Quota set to 100MB on Public. Firewall rule created for port 8080. Network connectivity tests successful.'
                }
            },

            // TASK 7: Module 9-10 - Security & PowerShell
            {
                id: 'task-7',
                order: 7,
                title: 'Module 9-10: Security Hardening & PowerShell Automation',
                description: 'Configure Windows Defender, BitLocker, audit policies, and create PowerShell automation scripts.',

                knowledgeBlocks: [
                    {
                        type: 'warning',
                        title: 'BitLocker Requirements',
                        content: 'BitLocker requires TPM 2.0 or a startup key on USB. In VMs, you may need to enable TPM in VM settings.'
                    }
                ],

                instructions: [
                    // Windows Defender
                    { step: 1, action: 'Open **Windows Security** from Start menu' },
                    { step: 2, action: 'Click **Virus & threat protection** → **Manage settings**' },
                    { step: 3, action: 'Ensure **Real-time protection** is **On**' },
                    { step: 4, action: 'Click **Virus & threat protection** → **Scan options** → Run **Quick scan**' },

                    // Audit Policy
                    { step: 5, action: 'Open **Local Security Policy** (secpol.msc)' },
                    { step: 6, action: 'Navigate to **Local Policies** → **Audit Policy**' },
                    { step: 7, action: 'Enable **Audit account logon events** for **Success** and **Failure**' },
                    { step: 8, action: 'Enable **Audit logon events** for **Success** and **Failure**' },
                    { step: 9, action: 'Enable **Audit object access** for **Failure**' },

                    // Event Viewer
                    { step: 10, action: 'Open **Event Viewer** (eventvwr.msc)' },
                    { step: 11, action: 'Navigate to **Windows Logs** → **Security**' },
                    { step: 12, action: 'Review recent security events (logon attempts, policy changes)' },
                    { step: 13, action: 'Right-click **Security** → **Filter Current Log** → Event ID: **4624** (successful logon)' },

                    // PowerShell Automation - User Creation
                    { step: 14, action: 'Open **PowerShell ISE** as Administrator' },
                    { step: 15, action: 'Create new script: `New-ADUser -Name "TestUser1" -GivenName "Test" -Surname "User1" -SamAccountName "testuser1" -UserPrincipalName "testuser1@contoso.local" -Path "OU=IT,OU=Departments,DC=contoso,DC=local" -AccountPassword (ConvertTo-SecureString "P@ssw0rd123" -AsPlainText -Force) -Enabled $true`' },
                    { step: 16, action: 'Run the script to create user' },

                    // Bulk User Creation from CSV
                    { step: 17, action: 'Create CSV file **C:\\\\Scripts\\\\users.csv** with headers: FirstName,LastName,Username,OU' },
                    { step: 18, action: 'Add sample data: `John,Smith,jsmith,OU=HR,OU=Departments,DC=contoso,DC=local`' },
                    { step: 19, action: 'Create PowerShell script: `Import-Csv "C:\\\\Scripts\\\\users.csv" | ForEach-Object { New-ADUser -Name "$($_.FirstName) $($_.LastName)" -GivenName $_.FirstName -Surname $_.LastName -SamAccountName $_.Username -UserPrincipalName "$($_.Username)@contoso.local" -Path $_.OU -AccountPassword (ConvertTo-SecureString "P@ssw0rd123" -AsPlainText -Force) -Enabled $true }`' },
                    { step: 20, action: 'Run script to create users from CSV' },

                    // Service Management
                    { step: 21, action: 'Run: `Get-Service -Name "Spooler" | Select-Object Name, Status, StartType`' },
                    { step: 22, action: 'Run: `Stop-Service -Name "Spooler"`' },
                    { step: 23, action: 'Run: `Set-Service -Name "Spooler" -StartupType Manual`' },
                    { step: 24, action: 'Run: `Start-Service -Name "Spooler"`' },

                    // AD Reporting
                    { step: 25, action: 'Run: `Get-ADUser -Filter * -Properties * | Select-Object Name, SamAccountName, Enabled, LastLogonDate | Export-Csv "C:\\\\Reports\\\\ADUsers.csv" -NoTypeInformation`' },
                    { step: 26, action: 'Run: `Get-ADGroup -Filter * | Select-Object Name, GroupScope, GroupCategory | Export-Csv "C:\\\\Reports\\\\ADGroups.csv" -NoTypeInformation`' },
                    { step: 27, action: 'Open the CSV files to verify reports' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify security and PowerShell configuration',
                    expectedResult: 'Windows Defender active with scan completed. Audit policies enabled for logon events. Event Viewer shows security logs. PowerShell scripts created users (TestUser1 and CSV imports). Service management commands executed. AD reports exported to CSV.'
                }
            },

            // TASK 8: Module 11-16 - Backup, Hyper-V, Monitoring & Real-world Scenarios
            {
                id: 'task-8',
                order: 8,
                title: 'Module 11-16: Backup, Hyper-V, Monitoring & Troubleshooting',
                description: 'Configure backups, manage Hyper-V, monitor performance, and handle real-world troubleshooting scenarios.',

                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Hyper-V Requirements',
                        content: 'Hyper-V requires hardware virtualization support (Intel VT-x or AMD-V). Nested virtualization must be enabled if running in a VM.'
                    },
                    {
                        type: 'tip',
                        title: 'Performance Monitoring',
                        content: 'Use Performance Monitor (perfmon) to track CPU, Memory, Disk, and Network metrics over time. Create baselines during normal operation.'
                    }
                ],

                instructions: [
                    // Windows Server Backup
                    { step: 1, action: 'Open **Windows Server Backup** from Server Manager → Tools' },
                    { step: 2, action: 'Click **Local Backup** → **Backup Schedule**' },
                    { step: 3, action: 'Select **Different options** → **Next**' },
                    { step: 4, action: 'Select **Custom** → **Next** → **Add Items**' },
                    { step: 5, action: 'Select **C:\\\\ drive** and **System State** → **OK** → **Next**' },
                    { step: 6, action: 'Set backup time: **Once a day at 2:00 AM** → **Next**' },
                    { step: 7, action: 'Select backup destination (dedicated disk or network location) → **Next** → **Finish**' },

                    // Hyper-V Installation
                    { step: 8, action: 'Open **Server Manager** → **Add Roles and Features**' },
                    { step: 9, action: 'Select **Hyper-V** role → **Add Features**' },
                    { step: 10, action: 'Click **Next**, select network adapter for virtual switch → **Next** → **Install**' },
                    { step: 11, action: 'Restart server after installation' },

                    // Create Virtual Switch
                    { step: 12, action: 'Open **Hyper-V Manager** from Server Manager → Tools' },
                    { step: 13, action: 'Click **Virtual Switch Manager** → **New virtual network switch**' },
                    { step: 14, action: 'Select **External** → **Create Virtual Switch**' },
                    { step: 15, action: 'Name: **External Switch**, select network adapter → **OK**' },

                    // Create Virtual Machine
                    { step: 16, action: 'In Hyper-V Manager, click **New** → **Virtual Machine**' },
                    { step: 17, action: 'Click **Next**, Name: **TestVM1** → **Next**' },
                    { step: 18, action: 'Generation: **Generation 2** → **Next**' },
                    { step: 19, action: 'Startup memory: **2048 MB**, enable **Dynamic Memory** → **Next**' },
                    { step: 20, action: 'Connection: **External Switch** → **Next**' },
                    { step: 21, action: 'Create virtual hard disk: **50 GB** → **Next** → **Finish**' },

                    // Performance Monitoring
                    { step: 22, action: 'Open **Task Manager** (Ctrl+Shift+Esc)' },
                    { step: 23, action: 'Review **Performance** tab for CPU, Memory, Disk, Network usage' },
                    { step: 24, action: 'Open **Resource Monitor** (resmon.exe)' },
                    { step: 25, action: 'Review CPU, Memory, Disk, and Network tabs for detailed metrics' },
                    { step: 26, action: 'Open **Performance Monitor** (perfmon.msc)' },
                    { step: 27, action: 'Click **Performance Monitor** → **Add counters** (green +)' },
                    { step: 28, action: 'Add: **Processor** → **% Processor Time**, **Memory** → **Available MBytes**, **PhysicalDisk** → **% Disk Time**' },
                    { step: 29, action: 'Monitor for 2 minutes to see real-time performance' },

                    // Real-world Troubleshooting Scenarios
                    { step: 30, action: '**Scenario 1: User Cannot Login** - Open **Event Viewer** → **Security** log → Filter Event ID **4625** (failed logon) → Check for account lockout' },
                    { step: 31, action: 'Run: `net user username /domain` to check account status' },
                    { step: 32, action: 'If locked, run: `Unlock-ADAccount -Identity username`' },

                    { step: 33, action: '**Scenario 2: DNS Resolution Failure** - Run: `nslookup contoso.local` to test DNS' },
                    { step: 34, action: 'Run: `ipconfig /flushdns` to clear DNS cache' },
                    { step: 35, action: 'Verify DNS service is running: `Get-Service -Name "DNS"`' },

                    { step: 36, action: '**Scenario 3: GPO Not Applying** - Run: `gpupdate /force` on client' },
                    { step: 37, action: 'Run: `gpresult /h C:\\\\GPReport.html` to generate detailed report' },
                    { step: 38, action: 'Open report in browser, check for errors or filtering issues' },

                    { step: 39, action: '**Scenario 4: Disk Full** - Open **Disk Management** (diskmgmt.msc)' },
                    { step: 40, action: 'Run: `Get-ChildItem C:\\\\ -Recurse | Sort-Object Length -Descending | Select-Object -First 20 FullName, @{Name="SizeMB";Expression={$_.Length / 1MB}}` to find large files' },
                    { step: 41, action: 'Use **Disk Cleanup** (cleanmgr.exe) to free space' },

                    { step: 42, action: '**Scenario 5: Server Down Recovery** - Boot from Windows Server installation media' },
                    { step: 43, action: 'Select **Repair your computer** → **Troubleshoot** → **System Image Recovery**' },
                    { step: 44, action: 'Select backup image created earlier → Follow wizard to restore' }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify backup, Hyper-V, monitoring, and troubleshooting',
                    expectedResult: 'Backup schedule configured for daily 2AM backup. Hyper-V installed with External Switch and TestVM1 created. Performance Monitor showing CPU, Memory, Disk metrics. Troubleshooting scenarios completed: account unlock, DNS flush, GPO report generated, large files identified, recovery steps documented.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Windows Server 2025 complete administration from setup to advanced topics',
                'User and group management (local and Active Directory)',
                'Active Directory Domain Services deployment and management',
                'DNS and DHCP configuration and troubleshooting',
                'Group Policy implementation for centralized management',
                'File server configuration with NTFS and Share permissions',
                'Network configuration and firewall management',
                'Security hardening with Windows Defender and audit policies',
                'PowerShell automation for user management and reporting',
                'Backup and disaster recovery procedures',
                'Hyper-V virtualization management',
                'Performance monitoring and optimization',
                'Real-world troubleshooting scenarios'
            ],
            nextSteps: [
                'Practice advanced PowerShell scripting',
                'Explore Windows Admin Center for remote management',
                'Study for Microsoft certification exams (AZ-800, AZ-801)',
                'Implement advanced security features (AppLocker, WSUS)',
                'Learn Azure Arc for hybrid cloud management'
            ],
            additionalResources: [
                {
                    title: 'Windows Server 2025 Documentation',
                    url: 'https://learn.microsoft.com/windows-server/',
                    type: 'documentation'
                },
                {
                    title: 'Active Directory Best Practices',
                    url: 'https://learn.microsoft.com/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory',
                    type: 'documentation'
                },
                {
                    title: 'PowerShell Documentation',
                    url: 'https://learn.microsoft.com/powershell/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * DP-3028: Implement Generative AI Engineering with Azure Databricks [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'dp-3028': {
        id: 'dp-3028-lab-1',
        courseId: 'dp-3028',
        title: 'Generative AI with Azure Databricks',
        description: 'Build a RAG (Retrieval Augmented Generation) application using Azure Databricks and OpenAI.',
        scenario: 'Contoso needs a customer support chatbot that can answer questions based on their internal product documentation. You will build this using Databricks Vector Search and Azure OpenAI.',
        estimatedTime: 90,
        difficulty: 'advanced',

        objectives: [
            'Configure Azure Databricks Workspace',
            'Ingest and chunk text data',
            'Create vector embeddings',
            'Set up a Vector Search index',
            'Implement a specific RAG chain'
        ],

        prerequisites: [
            'Azure Databricks familiarity',
            'Python programming skills',
            'Understanding of LLMs and embeddings'
        ],

        introduction: {
            overview: 'Retrieval Augmented Generation (RAG) combines the power of LLMs with your own data. Azure Databricks provides a unified platform to build, test, and deploy RAG applications.',
            scenario: 'You are tasked with building a chatbot backend that retrieves relevant documents from a knowledge base and uses GPT-4 to generate accurate answers.',
            architecture: 'Documents → Chunking → Embedding Model → Vector Database → Retriever → LLM → Answer'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Prepare Databricks Environment',
                description: 'Set up the compute cluster and install necessary libraries.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open your Azure Databricks workspace'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Compute** and create a cluster with **12.2 LTS ML** runtime or higher'
                    },
                    {
                        step: 3,
                        action: 'Install libraries: `langchain`, `databricks-vectorsearch`, `openai`'
                    },
                    {
                        step: 4,
                        action: 'Wait for the cluster to be running'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify cluster state',
                    expectedResult: 'Cluster state should be green (Running).'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Ingest and Vectorize Data',
                description: 'Process sample documentation into vector embeddings.',

                instructions: [
                    {
                        step: 1,
                        action: 'Create a new Notebook attached to your cluster'
                    },
                    {
                        step: 2,
                        action: 'Load the sample dataset provided in `/databricks-datasets`'
                    },
                    {
                        step: 3,
                        action: 'Split text into chunks using a recursive character text splitter'
                    },
                    {
                        step: 4,
                        action: 'Generate embeddings using `embeddings.create` (simulated or via Azure OpenAI connection)'
                    },
                    {
                        step: 5,
                        action: 'Save embeddings to a Delta table'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'python',
                        code: `from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = text_splitter.split_documents(raw_documents)`,
                        description: 'Text chunking code'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Delta table',
                    expectedResult: 'Query the table to ensure it contains text chunks and embedding columns.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Building LLM applications on Databricks',
                'Implementing RAG architecture',
                'Managing vector embeddings'
            ],
            nextSteps: [
                'Deploy the model as an endpoint',
                'Build a frontend UI'
            ],
            additionalResources: [
                {
                    title: 'Databricks AI Documentation',
                    url: 'https://docs.databricks.com/machine-learning/index.html',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * M55631A: Mastering Windows 11 Deployment with MDT
    */
    'm55631a': {
        id: 'm55631a-lab-1',
        courseId: 'm55631a',
        title: 'Deploy Windows 11 using MDT',
        description: 'Configure Microsoft Deployment Toolkit to deploy a custom Windows 11 image.',
        scenario: 'A branch office needs 50 new laptops imaged with a standard corporate Windows 11 build. You will set up an MDT server to automate this.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Install and configure MDT',
            'Import Windows 11 operating system',
            'Create a Task Sequence',
            'Deploy to a client VM'
        ],

        prerequisites: [
            'Windows Server knowledge',
            'Understanding of PXE boot',
            'Access to a lab environment with DC and DHCP'
        ],

        introduction: {
            overview: 'MDT provides a unified collection of tools and guidance for automating desktop and server deployment.',
            scenario: 'You need to standardize the OS deployment process to ensure consistency and reduce support calls.',
            architecture: 'MDT Server → Deployment Share → Network Boot (PXE) → Client PC'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Initialize Deployment Share',
                description: 'Create the repository for OS images and scripts.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Deployment Workbench** on the MDT server'
                    },
                    {
                        step: 2,
                        action: 'Right-click **Deployment Shares** and select **New Deployment Share**'
                    },
                    {
                        step: 3,
                        action: 'Path: `C:\\DeploymentShare`'
                    },
                    {
                        step: 4,
                        action: 'Share name: `DeploymentShark$`'
                    },
                    {
                        step: 5,
                        action: 'Accept defaults for the rest and click **Finish**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check file system',
                    expectedResult: 'Verify C:\\DeploymentShare folder exists and is populated.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Import Windows 11 OS',
                description: 'Add the source files for Windows 11.',

                instructions: [
                    {
                        step: 1,
                        action: 'Mount the Windows 11 ISO'
                    },
                    {
                        step: 2,
                        action: 'In Workbench, right-click **Operating Systems** -> **Import Operating System**'
                    },
                    {
                        step: 3,
                        action: 'Select **Full set of source files**'
                    },
                    {
                        step: 4,
                        action: 'Browse to the mounted ISO drive'
                    },
                    {
                        step: 5,
                        action: 'Name the directory **Windows 11 Enterprise x64**'
                    },
                    {
                        step: 6,
                        action: 'Finish the wizard'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify OS import',
                    expectedResult: 'Windows 11 should appear in the Operating Systems node.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Setting up MDT Deployment Shares',
                'Importing Operating Systems',
                'Creating Basic Task Sequences'
            ],
            nextSteps: [
                'Add applications to the image',
                'Configure driver injection'
            ],
            additionalResources: [
                {
                    title: 'MDT Documentation',
                    url: 'https://learn.microsoft.com/mem/configmgr/mdt/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * M55601-1A: Implementing and Managing Microsoft Virtualization Platforms
    */
    'm55601-1a': {
        id: 'm55601-lab-1',
        courseId: 'm55601-1a',
        title: 'Manage Hyper-V Virtual Machines',
        description: 'Configure Hyper-V networking and storage, and manage VMs.',
        scenario: 'You are consolidating several physical servers into virtual machines. You need to configure the Hyper-V host networking and storage to support high availability.',
        estimatedTime: 45,
        difficulty: 'advanced',

        objectives: [
            'Configure Hyper-V Virtual Switch',
            'Create and configure VHDX files',
            'Manage VM settings'
        ],

        prerequisites: [
            'Access to a physical or nested virtualization host',
            'Hyper-V role installed'
        ],

        introduction: {
            overview: 'Hyper-V is Microsoft\'s hardware virtualization product. It lets you create and run a software version of a computer, called a virtual machine.',
            scenario: 'You need to isolate network traffic for the new Finance department VMs. You will create a new private virtual switch and attach VMs to it.',
            architecture: 'Hyper-V Host → Virtual Switch → Virtual Machines'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Configure Virtual Networking',
                description: 'Create a Private Virtual Switch for isolated communication.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Hyper-V Manager**'
                    },
                    {
                        step: 2,
                        action: 'Click **Virtual Switch Manager** in the Actions pane'
                    },
                    {
                        step: 3,
                        action: 'Select **Private** and click **Create Virtual Switch**'
                    },
                    {
                        step: 4,
                        action: 'Name it **Finance-Private-Switch**'
                    },
                    {
                        step: 5,
                        action: 'Click **Apply** and **OK**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Switch',
                    expectedResult: 'The new switch should be listed in Virtual Switch Manager.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Hyper-V networking types',
                'Creating Virtual Switches',
                'Isolating VM traffic'
            ],
            nextSteps: [
                'Implement NIC Teaming',
                'Configure Storage Migration'
            ],
            additionalResources: [
                {
                    title: 'Hyper-V on Windows Server',
                    url: 'https://learn.microsoft.com/windows-server/virtualization/hyper-v/hyper-v-on-windows-server',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * DP-3029: Work smarter with Copilot in Microsoft Fabric [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'dp-3029': {
        id: 'dp-3029-lab-1',
        courseId: 'dp-3029',
        title: 'Data Engineering with Copilot',
        description: 'Use Copilot in Microsoft Fabric to accelerate data engineering tasks.',
        scenario: 'You are a data engineer at Contoso. You need to ingest, transform, and analyze sales data. You will use Copilot to generate code and insights, significantly reducing development time.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Enable Copilot in Fabric',
            'Use Copilot to generate PySpark code',
            'Use Copilot to explain complex SQL queries',
            'Build a data pipeline with AI assistance'
        ],

        prerequisites: [
            'Microsoft Fabric enabled subscription',
            'Basic data engineering knowledge'
        ],

        introduction: {
            overview: 'Copilot in Microsoft Fabric provides AI-powered assistance for data professionals. It can generate code, explain logic, and suggest data transformations.',
            scenario: 'You have a raw dataset of customer feedback. You need to clean it, perform sentiment analysis, and aggregate the results. Copilot will be your pair programmer.',
            architecture: 'Data Science Experience → Notebook → Copilot Chat → Code Generation'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Generate Transformation Code',
                description: 'Use Copilot to write PySpark code for data cleaning.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open a new Notebook in your Fabric workspace'
                    },
                    {
                        step: 2,
                        action: 'Load the "CustomerFeedback" sample table'
                    },
                    {
                        step: 3,
                        action: 'Click the **Copilot** button in the notebook toolbar'
                    },
                    {
                        step: 4,
                        action: 'In the chat, type: "Write code to remove null values from the Comment column and filter for recent records"'
                    },
                    {
                        step: 5,
                        action: 'Review the generated code and insert it into a cell'
                    },
                    {
                        step: 6,
                        action: 'Run the cell to clean the data'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'python',
                        code: `# Generated by Copilot
df_clean = df.filter(df.Comment.isNotNull()).filter(df.Date >= '2023-01-01')
display(df_clean)`,
                        description: 'Copilot generated cleaning code'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify data quality',
                    expectedResult: 'The output dataframe should have no null comments.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Using Copilot for code generation',
                'Accelerating data prep with AI',
                'Debugging with Copilot'
            ],
            nextSteps: [
                'Use Copilot in Power BI',
                'Explore Copilot for Data Factory'
            ],
            additionalResources: [
                {
                    title: 'Copilot in Fabric',
                    url: 'https://learn.microsoft.com/fabric/get-started/copilot-fabric-overview',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-2007: Accelerate app development by using GitHub Copilot
    * Enables Azure Portal Access
    */
    'az-2007': {
        id: 'az-2007-lab-1',
        courseId: 'az-2007',
        title: 'GitHub Copilot for Developers',
        description: 'Leverage GitHub Copilot to write code, write tests, and document a Node.js application.',
        scenario: 'You are joining a new project team building an e-commerce API. You will use GitHub Copilot to implement new endpoints and ensure high code quality with automated tests.',
        estimatedTime: 45,
        difficulty: 'beginner',

        objectives: [
            'Install and configure GitHub Copilot extension',
            'Use code completions to write functions',
            'Generate unit tests with Copilot',
            'Use Copilot Chat to refactor code'
        ],

        prerequisites: [
            'GitHub account with Copilot license',
            'VS Code installed',
            'Node.js installed'
        ],

        introduction: {
            overview: 'GitHub Copilot is an AI pair programmer. This lab demonstrates how to use its features to boost productivity in a real-world coding scenario.',
            scenario: 'You need to add a "calculateDiscount" function to the API. It has complex business rules. Instead of writing it from scratch, you will prompt Copilot to generate it.',
            architecture: 'VS Code → GitHub Copilot Extension → OpenAI Codex'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Implement Business Logic',
                description: 'Generate a complex function using natural language comments.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open VS Code and create a new file `discount.js`'
                    },
                    {
                        step: 2,
                        action: 'Type a comment: `// Service to calculate order discount based on total amount and user tier`'
                    },
                    {
                        step: 3,
                        action: 'Press Enter and wait for Copilot to suggest the function body'
                    },
                    {
                        step: 4,
                        action: 'Press **Tab** to accept the suggestion'
                    },
                    {
                        step: 5,
                        action: 'Review the logic (Gold tier gets 20%, Silver 10%, etc.)'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'javascript',
                        code: `function calculateDiscount(total, tier) {
if (tier === 'Gold') return total * 0.2;
if (tier === 'Silver') return total * 0.1;
return 0;
}`,
                        description: 'Example Copilot suggestion'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check function validity',
                    expectedResult: 'The generated code should be syntactically correct and implement the rules described.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Prompt engineering for code generation',
                'Using Copilot for boilerplate',
                'Writing tests with AI'
            ],
            nextSteps: [
                'Explore Copilot Labs',
                'Use Copilot for SQL queries'
            ],
            additionalResources: [
                {
                    title: 'GitHub Copilot Documentation',
                    url: 'https://docs.github.com/copilot',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AB-6002: Introduction to finance in Dynamics 365
    */
    'ab-6002': {
        id: 'ab-6002-lab-1',
        courseId: 'ab-6002',
        title: 'Configure General Ledger',
        description: 'Set up the General Ledger module in Dynamics 365 Finance.',
        scenario: 'A new subsidiary needs their accounting system configured. You will set up the chart of accounts, currencies, and fiscal calendars.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Create a robust Chart of Accounts',
            'Configure Fiscal Calendars',
            'Set up Currencies and Exchange Rates',
            'Define Ledger configuration'
        ],

        prerequisites: [
            'Basic accounting knowledge',
            'Access to Dynamics 365 Finance environment'
        ],

        introduction: {
            overview: 'The General Ledger is the core of any financial system. Correct configuration is critical for accurate reporting.',
            scenario: 'Fabrikam Japan is a new legal entity. You must configure their ledger to support JPY and a custom fiscal year.',
            architecture: 'D365 Finance → General Ledger → Chart of Accounts'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Chart of Accounts',
                description: 'Define the main accounts for assets, liabilities, and revenue.',

                instructions: [
                    {
                        step: 1,
                        action: 'Navigate to **General Ledger** > **Chart of Accounts** > **Accounts**'
                    },
                    {
                        step: 2,
                        action: 'Click **New** to create a new COA named "SharedEU"'
                    },
                    {
                        step: 3,
                        action: 'Add new main accounts (e.g., 1000 for Cash, 4000 for Sales)'
                    },
                    {
                        step: 4,
                        action: 'Validate the structure'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify COA',
                    expectedResult: 'The new shared chart of accounts is available for selection in the Ledger setup.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Structure of D365 General Ledger',
                'Creating Main Accounts',
                'Configuring Fiscal Periods'
            ],
            nextSteps: [
                'Configure Accounts Payable',
                'Set up Bank Management'
            ],
            additionalResources: [
                {
                    title: 'Dynamics 365 Finance Docs',
                    url: 'https://learn.microsoft.com/dynamics365/finance/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AI-102T00-A: Designing and Implementing a Microsoft Azure AI Solution [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'ai-102t00-a': {
        id: 'ai-102-lab-1',
        courseId: 'ai-102t00-a',
        title: 'Implement Azure AI Services',
        description: 'Provision and consume Azure AI Services including Computer Vision and Language.',
        scenario: 'A retail company wants to analyze product images and customer reviews. You will deploy Azure AI services to extract insights automatically.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Create an Azure AI Services multi-service resource',
            'Analyze images with Computer Vision',
            'Analyze text with Language service',
            'Secure API keys'
        ],

        prerequisites: [
            'Azure subscription',
            'Python or C# basic knowledge'
        ],

        introduction: {
            overview: 'Azure AI Services provide pre-built AI models that can be accessed via REST APIs.',
            scenario: 'You will build a Python script that takes a URL of a product image, identifies the object, and then analyzes the sentiment of the product description.',
            architecture: 'Python Script → Azure AI Services (Multi-service) → JSON Response'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Provision AI Resource',
                description: 'Create a single resource for all AI services.',

                instructions: [
                    {
                        step: 1,
                        action: 'Search for **Azure AI services** in Azure Portal'
                    },
                    {
                        step: 2,
                        action: 'Click **Create**'
                    },
                    {
                        step: 3,
                        action: 'Name: **ai-lab-[initials]**'
                    },
                    {
                        step: 4,
                        action: 'Price tier: **Standard S0**'
                    },
                    {
                        step: 5,
                        action: 'Review and Create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Get Keys',
                    expectedResult: 'Navigate to "Keys and Endpoint" and copy Key 1.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Provisioning Azure AI Services',
                'Calling REST APIs',
                'Parsing JSON responses'
            ],
            nextSteps: [
                'Implement Custom Vision',
                'Build a bot with Bot Framework'
            ],
            additionalResources: [
                {
                    title: 'Azure AI Services',
                    url: 'https://learn.microsoft.com/azure/ai-services/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-104T00-A: Microsoft Azure Administrator [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'az-104t00-a': {
        id: 'az-104-lab-1',
        courseId: 'az-104t00-a',
        title: 'Manage Azure Identities and Governance',
        description: 'Implement Entra ID users, groups, and Azure Policy.',
        scenario: 'You are the new Azure Administrator. You need to tidy up the directory, create groups for departments, and enforce tagging policies for cost management.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Manage Entra ID (Azure AD) Users and Groups',
            'Create and Assign Azure Policies',
            'Implement Resource Locks',
            'Manage Tags'
        ],

        prerequisites: [
            'Azure Subscription',
            'Global Admin or User Access Administrator role'
        ],

        introduction: {
            overview: 'Governance is critical in the cloud. This lab covers the identity and policy foundations required for a well-managed Azure environment.',
            scenario: 'The "Marketing" department needs a group. Also, all resources must have a "CostCenter" tag or they should be blocked from creation.',
            architecture: 'Entra ID → Management Groups → Azure Policy → Resource Groups'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Manage Entra ID Groups',
                description: 'Create a dynamic group for the marketing team.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Microsoft Entra ID** in the portal'
                    },
                    {
                        step: 2,
                        action: 'Click **Groups** > **New Group**'
                    },
                    {
                        step: 3,
                        action: 'Type: **Security**, Name: **Marketing-Dynamic**'
                    },
                    {
                        step: 4,
                        action: 'Membership type: **Dynamic User**'
                    },
                    {
                        step: 5,
                        action: 'Add query: `department Equals "Marketing"`'
                    },
                    {
                        step: 6,
                        action: 'Create the group'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Membership',
                    expectedResult: 'Create a new user with department "Marketing" and verify they are automatically added to the group.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Managing Entra ID Dynamic Groups',
                'Implementing Azure Policy',
                'Using Tags for Governance'
            ],
            nextSteps: [
                'Configure Role-Based Access Control (RBAC)',
                'Set up Budget Alerts'
            ],
            additionalResources: [
                {
                    title: 'Azure Governance',
                    url: 'https://learn.microsoft.com/azure/governance/',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * AZ-500T00-A: Microsoft Azure Security Technologies [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'az-500t00-a': {
        id: 'az-500-lab-1',
        courseId: 'az-500t00-a',
        title: 'Manage Azure Identity and Access',
        description: 'Configure PIM (Privileged Identity Management) and secure Azure resources.',
        scenario: 'You are a Security Engineer. You need to implement Just-In-Time access for administrators and ensure no standing access remains.',
        estimatedTime: 60,
        difficulty: 'advanced',

        objectives: [
            'Configure Privileged Identity Management (PIM)',
            'Create Access Reviews',
            'Implement Conditional Access policies'
        ],

        prerequisites: [
            'Azure AD Premium P2 (included in lab)',
            'Global Administrator role'
        ],

        introduction: {
            overview: 'Privileged Identity Management (PIM) provides a time-based and approval-based role activation to mitigate the risks of excessive, unnecessary, or misused access permissions.',
            scenario: 'The compliance team requires that no user has permanent "Global Admin" rights. You will set up PIM to require approval and MFA for role activation.',
            architecture: 'Entra ID → PIM → Role Activation → Approval Workflow'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Configure PIM for Global Admin Role',
                description: 'Set up activation settings for the Global Administrator role.',

                instructions: [
                    {
                        step: 1,
                        action: 'Navigate to **Privileged Identity Management** in the Azure Portal'
                    },
                    {
                        step: 2,
                        action: 'Click **Microsoft Entra Roles** under Manage'
                    },
                    {
                        step: 3,
                        action: 'Click **Roles** and search for **Global Administrator**'
                    },
                    {
                        step: 4,
                        action: 'Click **Settings** (gear icon) for the role'
                    },
                    {
                        step: 5,
                        action: 'Set "Maximum duration" to **1 hour**'
                    },
                    {
                        step: 6,
                        action: 'Require **Azure MFA** on activation'
                    },
                    {
                        step: 7,
                        action: 'Click **Update**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Settings',
                    expectedResult: 'Try to activate the role with a test user; it should prompt for MFA and limit duration to 1 hour.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Configuring PIM role settings',
                'Securing privileged roles',
                'Understanding JIT access'
            ],
            nextSteps: [
                'Configure PIM for Azure Resources',
                'Set up Access Reviews'
            ],
            additionalResources: [
                {
                    title: 'Azure PIM Documentation',
                    url: 'https://learn.microsoft.com/azure/active-directory/privileged-identity-management/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-204T00-A: Developing Solutions for Microsoft Azure [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'az-204t00-a': {
        id: 'az-204-lab-1',
        courseId: 'az-204t00-a',
        title: 'Develop Azure Compute Solutions',
        description: 'Create and deploy Azure Functions and Web Apps.',
        scenario: 'You are building a serverless backend for a mobile app. You need to deploy an Azure Function that processes image uploads.',
        estimatedTime: 50,
        difficulty: 'intermediate',

        objectives: [
            'Create an Azure Function App',
            'Develop a strict-trigger function',
            'Deploy code to Azure',
            'Monitor with Application Insights'
        ],

        prerequisites: [
            'VS Code with Azure Tools extension',
            'Node.js or .NET SDK'
        ],

        introduction: {
            overview: 'Azure Functions is a serverless compute service that lets you run event-triggered code without having to explicitly provision or manage infrastructure.',
            scenario: 'Users upload profile pictures to a blob container. You need a function to resize these images automatically.',
            architecture: 'Blob Storage (Trigger) → Azure Function → Blob Storage (Output)'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Function App',
                description: 'Provision the serverless resources.',

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure Portal, searching for **Function App**'
                    },
                    {
                        step: 2,
                        action: 'Click **Create**'
                    },
                    {
                        step: 3,
                        action: 'Stack: **Node.js**, Version: **18 LTS**'
                    },
                    {
                        step: 4,
                        action: 'Hosting: **Consumption (Serverless)**'
                    },
                    {
                        step: 5,
                        action: 'Create new Storage Account'
                    },
                    {
                        step: 6,
                        action: 'Review and Create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Resource',
                    expectedResult: 'Function App status is Running.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Create Blob Trigger Function',
                description: 'Add the code to process blobs.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to the Function App blade > **Functions**'
                    },
                    {
                        step: 2,
                        action: 'Click **Create** -> **Azure Blob Storage trigger**'
                    },
                    {
                        step: 3,
                        action: 'Name: **ResizeImage**'
                    },
                    {
                        step: 4,
                        action: 'Path: `uploads/{name}`'
                    },
                    {
                        step: 5,
                        action: 'Save and test'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'javascript',
                        code: `module.exports = async function (context, myBlob) {
context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
};`,
                        description: 'Default Blob Trigger Template'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Trigger',
                    expectedResult: 'Upload a file to the "uploads" container and check the "Monitor" tab logs for execution.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Creating Function Apps',
                'Configuring Triggers',
                'Monitoring Serverless Apps'
            ],
            nextSteps: [
                'Implement Durable Functions',
                'Secure functions with Managed Identity'
            ],
            additionalResources: [
                {
                    title: 'Azure Functions Docs',
                    url: 'https://learn.microsoft.com/azure/azure-functions/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-900T00-A: Introduction to Microsoft Azure [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'az-900t00-a': {
        id: 'az-900-lab-1',
        courseId: 'az-900t00-a',
        title: 'Create an Azure Virtual Machine',
        description: 'Learn the basics of creating and connecting to a VM in the cloud.',
        scenario: 'You are new to the cloud. Your first task is to provision a Windows Server VM and connect to it via RDP.',
        estimatedTime: 30,
        difficulty: 'beginner',

        objectives: [
            'Understand Resource Groups',
            'Create a Virtual Machine',
            'Connect via RDP'
        ],

        prerequisites: [
            'None (Beginner level)'
        ],

        introduction: {
            overview: 'Azure Virtual Machines (VMs) provide on-demand, scalable computing resources. In this lab, you will create a simple Windows VM.',
            scenario: 'You need a remote computer to run a legacy Windows application. You will create this computer in the Azure cloud.',
            architecture: 'User PC → RDP (Internet) → Azure VM'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create a Resource Group',
                description: 'Create a container for your resources.',

                instructions: [
                    {
                        step: 1,
                        action: 'Search or select **Resource groups**'
                    },
                    {
                        step: 2,
                        action: 'Click **+ Create**'
                    },
                    {
                        step: 3,
                        action: 'Name: **AZ900-Lab-RG**'
                    },
                    {
                        step: 4,
                        action: 'Region: **East US**'
                    },
                    {
                        step: 5,
                        action: 'Review + create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check RG',
                    expectedResult: 'Resource Group created successfully.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Create Virtual Machine',
                description: 'Provision the VM inside the resource group.',

                instructions: [
                    {
                        step: 1,
                        action: 'Inside the RG, click **+ Create** > **Virtual Machine**'
                    },
                    {
                        step: 2,
                        action: 'Name: **MyFirstVM**'
                    },
                    {
                        step: 3,
                        action: 'Image: **Windows Server 2022 Datacenter**'
                    },
                    {
                        step: 4,
                        action: 'Size: **Standard_B1s** (Low cost)'
                    },
                    {
                        step: 5,
                        action: 'Username: **azureuser**, Password: **Pa55w.rd1234**'
                    },
                    {
                        step: 6,
                        action: 'Review + create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify VM deployment',
                    expectedResult: 'Deployment overview says "Your deployment is complete".'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Creating Resource Groups',
                'Provisioning VMs',
                'Basic Cloud Concepts'
            ],
            nextSteps: [
                'Explore Azure Storage',
                'Understand Azure Billing'
            ],
            additionalResources: [
                {
                    title: 'Azure Fundamentals',
                    url: 'https://learn.microsoft.com/azure/fundamentals/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AI-900T00-A: Microsoft Azure AI Fundamentals [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'ai-900t00-a': {
        id: 'ai-900-lab-1',
        courseId: 'ai-900t00-a',
        title: 'Explore Computer Vision',
        description: 'Use Azure AI Vision Studio to analyze images without writing code.',
        scenario: 'Ideally, you want to identify brands and objects in photos uploaded by users. You will explore the capabilities of Azure Computer Vision.',
        estimatedTime: 30,
        difficulty: 'beginner',

        objectives: [
            'Access Azure AI Vision Studio',
            'Analyze images for objects',
            'Read text from images (OCR)'
        ],

        prerequisites: [
            'None'
        ],

        introduction: {
            overview: 'Azure AI Vision enables you to analyze content in images and video. Vision Studio allows you to test these features visually.',
            scenario: 'You have a collection of street signs images. You want to extract the text from them automatically.',
            architecture: 'Vision Studio (Web UI) → Azure AI Vision Service'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Provision AI Services Resource',
                description: 'Create the backend resource needed for Vision Studio.',

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure Portal, create an **Azure AI services** multi-service account'
                    },
                    {
                        step: 2,
                        action: 'Name: **ai900-lab-[initals]**'
                    },
                    {
                        step: 3,
                        action: 'Wait for deployment'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Resource Check',
                    expectedResult: 'Resource is active.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Use Vision Studio',
                description: 'Test OCR capabilities.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **https://portal.vision.cognitive.azure.com/**'
                    },
                    {
                        step: 2,
                        action: 'Sign in and select your subscription and the resource you just created'
                    },
                    {
                        step: 3,
                        action: 'Click on the **Optical Character Recognition (OCR)** tab'
                    },
                    {
                        step: 4,
                        action: 'Select **Extract text from images**'
                    },
                    {
                        step: 5,
                        action: 'Upload one of the sample images provided'
                    },
                    {
                        step: 6,
                        action: 'Observe the extracted text on the right panel'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Extraction',
                    expectedResult: 'Text from the image appears correctly in the results pane.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Using Vision Studio',
                'Optical Character Recognition',
                'No-code AI testing'
            ],
            nextSteps: [
                'Explore Face API',
                'Explore Custom Vision'
            ],
            additionalResources: [
                {
                    title: 'Azure AI Vision',
                    url: 'https://learn.microsoft.com/azure/ai-services/computer-vision/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * DP-900T00-A: Introduction to Microsoft Azure Data [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'dp-900t00-a': {
        id: 'dp-900-lab-1',
        courseId: 'dp-900t00-a',
        title: 'Query Data in Azure SQL Database',
        description: 'Provision a SQL Database and run basic T-SQL queries.',
        scenario: 'Your company is moving their product catalog from an Excel sheet to a relational database in the Cloud. You need to set it up.',
        estimatedTime: 40,
        difficulty: 'beginner',

        objectives: [
            'Create an Azure SQL Database',
            'Configure server firewall',
            'Use Query Editor in the portal'
        ],

        prerequisites: [
            'None'
        ],

        introduction: {
            overview: 'Azure SQL Database is a fully managed PaaS database engine that handles most of the database management functions.',
            scenario: 'You will create a database, create a "Products" table, and insert some sample data.',
            architecture: 'Portal Query Editor → Azure SQL Database'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create SQL Database',
                description: 'Provision the database server and database.',

                instructions: [
                    {
                        step: 1,
                        action: 'Search for **SQL databases** and click **Create**'
                    },
                    {
                        step: 2,
                        action: 'Resource Group: **DP900-RG**'
                    },
                    {
                        step: 3,
                        action: 'Database name: **CatalogDB**'
                    },
                    {
                        step: 4,
                        action: 'Server: Click **Create new**, Name: **dp900-server-[initials]**, Admin: **sqladmin**, Password: **P@ssw0rd1234**'
                    },
                    {
                        step: 5,
                        action: 'Compute + storage: **Basic** (lowest cost)'
                    },
                    {
                        step: 6,
                        action: 'Review + create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Deployment Check',
                    expectedResult: 'SQL Database is deployed.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Run Queries',
                description: 'Use the built-in query editor.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to the SQL Database resource'
                    },
                    {
                        step: 2,
                        action: 'Click **Query editor (preview)** in the left menu'
                    },
                    {
                        step: 3,
                        action: 'Login with SQL Server authentication (sqladmin / P@ssw0rd1234)'
                    },
                    {
                        step: 4,
                        action: 'Run the following SQL to create a table:'
                    },
                    {
                        step: 5,
                        action: '`CREATE TABLE Products (ProductID int, ProductName varchar(255), Price decimal);`'
                    },
                    {
                        step: 6,
                        action: 'Run SQL to insert data:'
                    },
                    {
                        step: 7,
                        action: '`INSERT INTO Products VALUES (1, "Laptop", 999.99);`'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Data',
                    expectedResult: 'Run `SELECT * FROM Products` and see the row.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Provisioning Azure SQL',
                'Configuring SQL Firewalls (Implicitly handled by Query Editor allow)',
                'Running T-SQL in the Cloud'
            ],
            nextSteps: [
                'Explore Cosmos DB',
                'Connect Power BI to SQL'
            ],
            additionalResources: [
                {
                    title: 'Azure SQL Database',
                    url: 'https://learn.microsoft.com/azure/azure-sql/',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * PL-300T00-A: Microsoft Power BI Data Analyst [Cloud Slice Provided]
    * Enables Azure Portal Access (for some scenarios)
    */
    'pl-300t00-a': {
        id: 'pl-300-lab-1',
        courseId: 'pl-300t00-a',
        title: 'Prepare Data in Power BI Desktop',
        description: 'Connect to data sources and transform data using Power Query.',
        scenario: 'You are a Data Analyst for Tailwind Traders. You need to verify and clean sales data from multiple sources before creating reports.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Get data from Excel and SQL',
            'Clean data using Power Query Editor',
            'Create relationships between tables'
        ],

        prerequisites: [
            'Power BI Desktop installed'
        ],

        introduction: {
            overview: 'Power BI Desktop is a free application for PCs that lets you gather, transform, and visualize your data.',
            scenario: 'The sales data comes from an Excel file and the product catalog is in a SQL database. You need to combine them.',
            architecture: 'Data Sources → Power Query → Data Model → Visualization'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Get Data from Excel',
                description: 'Import the Sales data.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open Power BI Desktop'
                    },
                    {
                        step: 2,
                        action: 'Click **Get data** > **Excel workbook**'
                    },
                    {
                        step: 3,
                        action: 'Select `Sales.xlsx` from the lab resources folder'
                    },
                    {
                        step: 4,
                        action: 'Select the **Sales** sheet and click **Transform Data**'
                    },
                    {
                        step: 5,
                        action: 'Remove the top 2 rows (header garbage) using **Remove Rows**'
                    },
                    {
                        step: 6,
                        action: 'Promote headers: **Use First Row as Headers**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Data Types',
                    expectedResult: 'Ensure "OrderDate" column is detected as Date type.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Get Data from SQL',
                description: 'Import product dimensions.',

                instructions: [
                    {
                        step: 1,
                        action: 'Click **New Source** > **SQL Server**'
                    },
                    {
                        step: 2,
                        action: 'Server: `localhost` (or provided lab server)'
                    },
                    {
                        step: 3,
                        action: 'Database: `TailwindDB`'
                    },
                    {
                        step: 4,
                        action: 'Select **Products** table and click **OK**'
                    },
                    {
                        step: 5,
                        action: 'Click **Close & Apply** to load data'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Model',
                    expectedResult: 'Go to "Model View" and verify a relationship exists between Sales and Products tables.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Importing from multiple sources',
                'Transforming data with Power Query',
                'Basic data modeling'
            ],
            nextSteps: [
                'Create DAX measures',
                'Build interactive reports'
            ],
            additionalResources: [
                {
                    title: 'Power BI Documentation',
                    url: 'https://learn.microsoft.com/power-bi/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MS-102T00-A: Microsoft 365 Administrator Essentials
    */
    'ms-102t00-a': {
        id: 'ms-102-lab-1',
        courseId: 'ms-102t00-a',
        title: 'Configure Your Microsoft 365 Tenant',
        description: 'Set up domain, organizational profile, and subscription release preferences.',
        scenario: 'Contoso has just purchased Microsoft 365. You need to configure the tenant profile and prepare it for user onboarding.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Configure Organization Profile',
            'Add a custom domain name',
            'Configure DNS records'
        ],

        prerequisites: [
            'Microsoft 365 Global Administrator account',
            'Access to a domain registrar (simulated)'
        ],

        introduction: {
            overview: 'The Microsoft 365 Admin Center is the hub for all management tasks. Configuring the tenant correctly is the first step in deployment.',
            scenario: 'You need to change the technical contact email and add "contoso.com" as a verified domain.',
            architecture: 'Admin Center → Domain Setup → DNS Verification'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Update Organization Profile',
                description: 'Set the correct address and contact info.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **admin.microsoft.com**'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Settings** > **Org settings** > **Organization profile**'
                    },
                    {
                        step: 3,
                        action: 'Click **Organization information**'
                    },
                    {
                        step: 4,
                        action: 'Update the address and technical contact'
                    },
                    {
                        step: 5,
                        action: 'Save changes'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Changes',
                    expectedResult: 'New contact info is reflected on the main dashboard.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Add Custom Domain',
                description: 'Verify ownership of a domain.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Settings** > **Domains**'
                    },
                    {
                        step: 2,
                        action: 'Click **Add domain**'
                    },
                    {
                        step: 3,
                        action: 'Enter `contoso-lab.com` (or provided lab domain)'
                    },
                    {
                        step: 4,
                        action: 'Choose **Add a TXT record to the domain\'s DNS records**'
                    },
                    {
                        step: 5,
                        action: 'Copy the TXT value (MS=ms123456)'
                    },
                    {
                        step: 6,
                        action: 'Switch to the Registrar tool tab and add the record'
                    },
                    {
                        step: 7,
                        action: 'Click **Verify**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Domain Status',
                    expectedResult: 'Domain status shows as "Healthy" or "Verified".'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Tenant configuration',
                'Domain verification process',
                'DNS management for M365'
            ],
            nextSteps: [
                'Create user accounts',
                'Assign licenses'
            ],
            additionalResources: [
                {
                    title: 'M365 Admin Docs',
                    url: 'https://learn.microsoft.com/microsoft-365/admin/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MD-102T00-A: Microsoft 365 Endpoint Administrator
    */
    'md-102t00-a': {
        id: 'md-102-lab-1',
        courseId: 'md-102t00-a',
        title: 'Enroll Devices in Intune',
        description: 'Configure automatic enrollment for Windows devices.',
        scenario: 'Devices should be automatically enrolled in Intune when users join them to Entra ID.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Configure MDM User Scope',
            'Configure MAM User Scope',
            'Enroll a Windows 11 device'
        ],

        prerequisites: [
            'Intune Administrator role',
            'Entra ID Premium P1'
        ],

        introduction: {
            overview: 'Microsoft Intune is a cloud-based endpoint management solution. Auto-enrollment simplifies the management lifecycle.',
            scenario: 'You need to ensure that all users in the "IT-Users" group have their devices enrolled automatically.',
            architecture: 'Entra ID Join → Intune Enrollment'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Configure Auto-Enrollment',
                description: 'Set up the scope for automatic enrollment.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Microsoft Intune admin center** (intune.microsoft.com)'
                    },
                    {
                        step: 2,
                        action: 'Go to **Devices** > **Enrollment**'
                    },
                    {
                        step: 3,
                        action: 'Click **Automatic Enrollment**'
                    },
                    {
                        step: 4,
                        action: 'Set **MDM user scope** to **Some** and select "IT-Users" group'
                    },
                    {
                        step: 5,
                        action: 'Set **MAM user scope** to **None**'
                    },
                    {
                        step: 6,
                        action: 'Click **Save**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Scope',
                    expectedResult: 'Settings saved successfully.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Configuring Intune Auto-Enrollment',
                'Understanding MDM vs MAM scopes'
            ],
            nextSteps: [
                'Create Configuration Profiles',
                'Deploy Compliance Policies'
            ],
            additionalResources: [
                {
                    title: 'Intune Documentation',
                    url: 'https://learn.microsoft.com/mem/intune/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * SC-300T00-A: Microsoft Identity and Access Administrator [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'sc-300t00-a': {
        id: 'sc-300-lab-1',
        courseId: 'sc-300t00-a',
        title: 'Implement Multi-Factor Authentication',
        description: 'Configure Conditional Access policies to enforce MFA.',
        scenario: 'Security policy states that all administrative access must be protected by MFA.',
        estimatedTime: 50,
        difficulty: 'intermediate',

        objectives: [
            'Create a Conditional Access Policy',
            'Define Users and Apps scope',
            'Define Grant Controls (Require MFA)',
            'Test in Report-Only mode'
        ],

        prerequisites: [
            'Security Administrator role',
            'Entra ID Premium P1'
        ],

        introduction: {
            overview: 'Conditional Access is the tool used by Azure Active Directory to bring signals together, to make decisions, and enforce organizational policies.',
            scenario: 'You will create a policy named "Require MFA for Admins" that targets specific directory roles.',
            architecture: 'Signal (User/Device) → Conditional Access → Grant/Block'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create CA Policy',
                description: 'Define the policy rules.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Microsoft Entra ID** > **Security** > **Conditional Access**'
                    },
                    {
                        step: 2,
                        action: 'Click **New policy**'
                    },
                    {
                        step: 3,
                        action: 'Name: **Require MFA for Admins**'
                    },
                    {
                        step: 4,
                        action: 'Under **Users**, select **Directory roles** and choose **Global Administrator**'
                    },
                    {
                        step: 5,
                        action: 'Under **Target resources**, select **All cloud apps**'
                    },
                    {
                        step: 6,
                        action: 'Under **Grant**, check **Require multifactor authentication**'
                    },
                    {
                        step: 7,
                        action: 'Set **Enable policy** to **Report-only** (for safety)'
                    },
                    {
                        step: 8,
                        action: 'Create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Policy state',
                    expectedResult: 'Policy appears in the list with state "Report-only".'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'creating Conditional Access policies',
                'Targeting Directory Roles',
                'Using Report-only mode'
            ],
            nextSteps: [
                'Use What If tool to test policy',
                'Configure Sign-in Risk policies'
            ],
            additionalResources: [
                {
                    title: 'Conditional Access',
                    url: 'https://learn.microsoft.com/azure/active-directory/conditional-access/overview',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * SC-100T00-A: Microsoft Cybersecurity Architect [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'sc-100t00-a': {
        id: 'sc-100-lab-1',
        courseId: 'sc-100t00-a',
        title: 'Design a Zero Trust Strategy',
        description: 'Architect a security solution using Microsoft Cybersecurity Reference Architectures (MCRA).',
        scenario: 'You are an architect for a large bank. You need to design a security posture that assumes breach and verifies explicitly.',
        estimatedTime: 90,
        difficulty: 'advanced',

        objectives: [
            'Analyze MCRA diagrams',
            'Design identity security',
            'Design network security'
        ],

        prerequisites: [
            'Deep understanding of Azure Security',
            'Visio or Whiteboard tool'
        ],

        introduction: {
            overview: 'Zero Trust is a security strategy. It is not a product or a service, but an approach in designing and implementing the following set of security principles: Verify explicitly, Use least privileged access, Assume breach.',
            scenario: 'Using the provided template, map out the security controls for a hybrid workload.',
            architecture: 'Identity → Endpoints → Apps → Infrastructure → Network → Data'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Design Identity Strategy',
                description: 'Plan the identity perimeter.',

                instructions: [
                    {
                        step: 1,
                        action: 'Review the **Identity and Access** section of MCRA'
                    },
                    {
                        step: 2,
                        action: 'Identify required controls: MFA, Conditional Access, PIM'
                    },
                    {
                        step: 3,
                        action: 'Document the decision: "All external users must use phishing-resistant MFA"'
                    }
                ],

                knowledgeBlocks: [
                    {
                        type: 'tip',
                        title: 'Verify Explicitly',
                        content: 'Always authenticate and authorize based on all available data points, including user identity, location, device health, service or workload, data classification, and anomalies.'
                    }
                ],

                verification: {
                    type: 'quiz',
                    description: 'Architecture Validation',
                    quiz: {
                        question: 'Which principle focuses on limiting user access to only what is needed?',
                        options: ['Assume Breach', 'Least Privilege', 'Verify Explicitly'],
                        correctAnswer: 1,
                        explanation: 'Least Privilege ensures users have just enough access to do their job.'
                    }
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Applying Zero Trust principles',
                'Using MCRA',
                'Architecting secure solutions'
            ],
            nextSteps: [
                'Design Security Operations Center (SOC) processes',
                'Plan for Defender for Cloud deployment'
            ],
            additionalResources: [
                {
                    title: 'MCRA',
                    url: 'https://aka.ms/mcra',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * AZ-800T00-A: Administering Windows Server Hybrid Core Infrastructure
    * Enables Azure Portal Access
    */
    'az-800t00-a': {
        id: 'az-800-lab-1',
        courseId: 'az-800t00-a',
        title: 'Implement Identity in Hybrid Scenarios',
        description: 'Configure Active Directory and sync with Azure AD using Azure AD Connect.',
        scenario: 'Contoso is transitioning to a hybrid environment. You need to ensure users can use their on-premises credentials to access cloud resources by setting up hybrid identity.',
        estimatedTime: 60,
        difficulty: 'advanced',

        objectives: [
            'Deploy Azure AD Connect',
            'Configure Password Hash Synchronization',
            'Verify Hybrid Identity'
        ],

        prerequisites: [
            'Windows Server Domain Controller',
            'Azure AD Tenant',
            'Enterprise Admin credentials'
        ],

        introduction: {
            overview: 'Hybrid identity allows you to have a common user identity for authentication and authorization to all resources, regardless of location.',
            scenario: 'You will install Azure AD Connect on a dedicated server and configure it to synchronize the "Corp" OU to Entra ID.',
            architecture: 'On-Prem AD → Azure AD Connect → Entra ID'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Install Azure AD Connect',
                description: 'Download and run the installer.',

                instructions: [
                    {
                        step: 1,
                        action: 'Log in to **LON-SVR1** (Member Server)'
                    },
                    {
                        step: 2,
                        action: 'Open Edge and download Azure AD Connect from the Microsoft Download Center'
                    },
                    {
                        step: 3,
                        action: 'Run the installer'
                    },
                    {
                        step: 4,
                        action: 'Agree to license terms and click **Continue**'
                    },
                    {
                        step: 5,
                        action: 'Select **Use express settings**'
                    },
                    {
                        step: 6,
                        action: 'Enter Azure AD Global Admin credentials'
                    },
                    {
                        step: 7,
                        action: 'Enter Active Directory Enterprise Admin credentials'
                    },
                    {
                        step: 8,
                        action: 'Prior to install, check "Start the synchronization process when configuration completes"'
                    },
                    {
                        step: 9,
                        action: 'Click **Install**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check User Sync',
                    expectedResult: 'Log in to Azure Portal > Users. On-prem users should appear with "Directory synced: Yes".'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Implementing Hybrid Identity',
                'Installing Azure AD Connect',
                'Verifying Synchronization'
            ],
            nextSteps: [
                'Implement SSO',
                'Configure Health Monitoring'
            ],
            additionalResources: [
                {
                    title: 'Azure AD Connect',
                    url: 'https://learn.microsoft.com/azure/active-directory/hybrid/connect/whatis-azure-ad-connect',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-801T00-A: Configuring Windows Server Hybrid Advanced Services
    * Enables Azure Portal Access
    */
    'az-801t00-a': {
        id: 'az-801-lab-1',
        courseId: 'az-801t00-a',
        title: 'Secure Windows Server On-Premises and Hybrid',
        description: 'Implement Defender for Cloud and secure connectivity.',
        scenario: 'You need to improve the security posture of your on-premises servers by onboarding them to Microsoft Defender for Cloud.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Onboard on-prem server to Azure Arc',
            'Enable Defender for Cloud',
            'Remediate security recommendations'
        ],

        prerequisites: [
            'Azure subscription',
            'Windows Server VM'
        ],

        introduction: {
            overview: 'Microsoft Defender for Cloud is a Cloud Security Posture Management (CSPM) and Cloud Workload Protection Platform (CWPP) for all of your Azure, on-premises, and multicloud resources.',
            scenario: 'You will install the Azure Arc agent on a server, making it visible in Azure, and then enable Defender protections.',
            architecture: 'Server → Azure Arc Agent → Azure Resource Manager → Defender for Cloud'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Onboard to Azure Arc',
                description: 'Connect the server to Azure.',

                instructions: [
                    {
                        step: 1,
                        action: 'In Azure Portal, searching for **Servers - Azure Arc**'
                    },
                    {
                        step: 2,
                        action: 'Click **Add** > **Generate script** (Single server)'
                    },
                    {
                        step: 3,
                        action: 'Review prerequisites and click **Next**'
                    },
                    {
                        step: 4,
                        action: 'Select Resource Group/Region'
                    },
                    {
                        step: 5,
                        action: 'Download the script'
                    },
                    {
                        step: 6,
                        action: 'Run the script on the target Windows Server'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Connection',
                    expectedResult: 'Server status shows as "Connected" in Azure Portal.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Enable Defender Plans',
                description: 'Turn on protections.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Microsoft Defender for Cloud** in Portal'
                    },
                    {
                        step: 2,
                        action: 'Click **Environment settings**'
                    },
                    {
                        step: 3,
                        action: 'Select your subscription'
                    },
                    {
                        step: 4,
                        action: 'Locate **Servers** plan and toggle to **On**'
                    },
                    {
                        step: 5,
                        action: 'Click **Save**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check recommendations',
                    expectedResult: 'After a few minutes, the Arc server should appear in the "Inventory" tab with security recommendations.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Azure Arc onboarding',
                'Enabling Defender for Cloud',
                'Hybrid Security Management'
            ],
            nextSteps: [
                'Implement JIT VM Access',
                'Configure File Integrity Monitoring'
            ],
            additionalResources: [
                {
                    title: 'Defender for Cloud',
                    url: 'https://learn.microsoft.com/azure/defender-for-cloud/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * AZ-140T00-A: Configuring and Operating Microsoft Azure Virtual Desktop [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'az-140t00-a': {
        id: 'az-140-lab-1',
        courseId: 'az-140t00-a',
        title: 'Deploy Azure Virtual Desktop (Host Pool)',
        description: 'Create a host pool and provision session hosts.',
        scenario: 'Your organization needs to provide remote apps to 50 employees. You decide to use AVD with pooled Windows 11 multi-session hosts.',
        estimatedTime: 75,
        difficulty: 'advanced',

        objectives: [
            'Create a Host Pool',
            'Provision Session Hosts (VMs)',
            'Create an Application Group',
            'Create a Workspace'
        ],

        prerequisites: [
            'Azure AD Domain Services or AD Connect',
            'VNET configured'
        ],

        introduction: {
            overview: 'Azure Virtual Desktop is a desktop and app virtualization service that runs on the cloud.',
            scenario: 'You will deploy a complete AVD environment, including the "Control Plane" objects (Host Pool, Workspace) and the actual VMs.',
            architecture: 'User → Remote Desktop Client → Gateway → Session Host VM'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Host Pool',
                description: 'Initialize the AVD environment.',

                instructions: [
                    {
                        step: 1,
                        action: 'Search for **Azure Virtual Desktop**'
                    },
                    {
                        step: 2,
                        action: 'Click **Create a host pool**'
                    },
                    {
                        step: 3,
                        action: 'Name: **HP-Finance**'
                    },
                    {
                        step: 4,
                        action: 'Host pool type: **Pooled**'
                    },
                    {
                        step: 5,
                        action: 'Load balancing: **Breadth-first**'
                    },
                    {
                        step: 6,
                        action: 'Click **Next: Virtual Machines**'
                    },
                    {
                        step: 7,
                        action: 'Add Azure virtual machines: **Yes**'
                    },
                    {
                        step: 8,
                        action: 'Image: **Windows 11 Enterprise multi-session + Microsoft 365 Apps**'
                    },
                    {
                        step: 9,
                        action: 'Number of VMs: **2**'
                    },
                    {
                        step: 10,
                        action: 'Complete the wizard (domain join required)'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Host Pool',
                    expectedResult: 'Host Pool status should be "Active" with 2 session hosts listed as "Available" (after deployment completes).'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Deploying AVD Host Pools',
                'Understanding Multi-session Images',
                'Contextualizing Workspaces and App Groups'
            ],
            nextSteps: [
                'Publish Remote Apps',
                'Configure FXLogix Profiles'
            ],
            additionalResources: [
                {
                    title: 'AVD Docs',
                    url: 'https://learn.microsoft.com/azure/virtual-desktop/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * DP-100T01-A: Designing and Implementing a Data Science Solution on Azure [Cloud Slice Provided]
    * Enables Azure Portal Access
    */
    'dp-100t01-a': {
        id: 'dp-100-lab-1',
        courseId: 'dp-100t01-a',
        title: 'Train a Model with Azure Machine Learning',
        description: 'Use the Python SDK v2 to train a classification model.',
        scenario: 'You are a Data Scientist. You need to train a model to predict customer churn and register it in the ML Workspace.',
        estimatedTime: 60,
        difficulty: 'advanced',

        objectives: [
            'Connect to AML Workspace',
            'Create a Compute Instance',
            'Run a training job (Command Job)',
            'Register the Model'
        ],

        prerequisites: [
            'Azure Machine Learning Workspace',
            'Basic Python/Pandas knowledge'
        ],

        introduction: {
            overview: 'Azure Machine Learning is an enterprise-grade service for the end-to-end data science lifecycle.',
            scenario: 'You have a training script `train.py`. You will submit this scrip allows compute cluster to run it at scale.',
            architecture: 'Local/Notebook Code → ML Studio → Compute Cluster → Registered Model'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Configure Compute',
                description: 'Create a compute cluster for training.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Azure Machine Learning Studio** (ml.azure.com)'
                    },
                    {
                        step: 2,
                        action: 'Click **Compute** > **Compute clusters** > **+ New**'
                    },
                    {
                        step: 3,
                        action: 'Select **Standard_DS11_v2**'
                    },
                    {
                        step: 4,
                        action: 'Name: **cpu-cluster**'
                    },
                    {
                        step: 5,
                        action: 'Set min nodes to 0, max to 2'
                    },
                    {
                        step: 6,
                        action: 'Create'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Compute',
                    expectedResult: 'Cluster status is Succeeded.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Submit Training Job',
                description: 'Use the `command` function to run the job.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open a new Notebook'
                    },
                    {
                        step: 2,
                        action: 'Import: `from azure.ai.ml import command, Input`'
                    },
                    {
                        step: 3,
                        action: 'Define the job configuration'
                    },
                    {
                        step: 4,
                        action: 'Submit the job using `ml_client.jobs.create_or_update(job)`'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'python',
                        code: 'job = command(\n' +
                            'code="./src",\n' +
                            'command="python train.py --data ${{ inputs.data }}",\n' +
                            'inputs={"data": Input(type="uri_file", path="https://.../data.csv")},\n' +
                            'environment="AzureML-sklearn-1.0-ubuntu20.04-py38-cpu@latest",\n' +
                            'compute="cpu-cluster",\n' +
                            'display_name="churn-prediction-train"\n' +
                            ')\n' +
                            'returned_job = ml_client.jobs.create_or_update(job)',
                        description: 'SDK v2 Command Job'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Monitor Job',
                    expectedResult: 'Go to **Jobs** tab. The job should complete successfully and produce metrics.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Azure ML python SDK v2',
                'Creating Compute Clusters',
                'Submitting Command Jobs'
            ],
            nextSteps: [
                'Deploy model to endpoint',
                'Create pipeline'
            ],
            additionalResources: [
                {
                    title: 'Azure ML SDK v2',
                    url: 'https://learn.microsoft.com/azure/machine-learning/how-to-train-model',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MS-700T00-A: Managing Microsoft Teams
    */
    'ms-700t00-a': {
        id: 'ms-700-lab-1',
        courseId: 'ms-700t00-a',
        title: 'Plan and Configure Teams Environment',
        description: 'Configure Teams settings, org-wide defaults, and guest access.',
        scenario: 'You need to enable external collaboration while ensuring governance policies are met.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Configure Guest Access',
            'Manage Teams Policies',
            'Configure Meeting Settings'
        ],

        prerequisites: [
            'Teams Administrator role'
        ],

        introduction: {
            overview: 'Microsoft Teams management involves controlling how users communicate and collaborate both internally and externally.',
            scenario: 'The marketing team wants to invite freelancers to their Team. You need to enable Guest access but restrict them from deleting channels.',
            architecture: 'Teams Admin Center → Org-wide settings → Guest Access'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Enable Guest Access',
                description: 'Turn on the master switch for external users.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Teams Admin Center** (admin.teams.microsoft.com)'
                    },
                    {
                        step: 2,
                        action: 'Go to **Users** > **Guest access**'
                    },
                    {
                        step: 3,
                        action: 'Set "Allow guest access in Teams" to **On**'
                    },
                    {
                        step: 4,
                        action: 'Review calling, meeting, and messaging settings for guests'
                    },
                    {
                        step: 5,
                        action: 'Set "Delete channels" to **Off**'
                    },
                    {
                        step: 6,
                        action: 'Click **Save**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Access',
                    expectedResult: 'Try to add an external email address to a Team. It should succeed (propagation may take time).'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Managing Guest Access',
                'Teams Governance',
                'Admin Center Navigation'
            ],
            nextSteps: [
                'Configure Teams Phone',
                'Manage Teams Rooms'
            ],
            additionalResources: [
                {
                    title: 'Teams Admin Docs',
                    url: 'https://learn.microsoft.com/microsoftteams/teams-admin',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * MD-100T00-A: Windows Client
    * Enables Azure Portal Access
    */
    'md-100t00-a': {
        id: 'md-100-lab-1',
        courseId: 'md-100t00-a',
        title: 'Configure Local Security Policy',
        description: 'Manage security settings on a Windows client.',
        scenario: 'You need to secure standalone Windows 11 workstations by restricting software execution and enforcing password policies.',
        estimatedTime: 45,
        difficulty: 'intermediate',

        objectives: [
            'Configure Account Policies',
            'Configure Audit Policies',
            'Configure AppLocker'
        ],

        prerequisites: [
            'Windows Client VM',
            'Local Admin rights'
        ],

        introduction: {
            overview: 'Local Security Policy enables you to configure security settings for the local computer.',
            scenario: 'You will enforce a complex password policy and prevent the execution of a specific executable using AppLocker.',
            architecture: 'Local Security Policy (secpol.msc) → Registry'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Enforce Password Policy',
                description: 'Set minimum password length and complexity.',

                instructions: [
                    {
                        step: 1,
                        action: 'Log in to **LON-CL1** as Admin'
                    },
                    {
                        step: 2,
                        action: 'Open **Run**, type `secpol.msc`, and press Enter'
                    },
                    {
                        step: 3,
                        action: 'Navigate to **Account Policies** > **Password Policy**'
                    },
                    {
                        step: 4,
                        action: 'Set **Minimum password length** to **10 characters**'
                    },
                    {
                        step: 5,
                        action: 'Enable **Password must meet complexity requirements**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Policy',
                    expectedResult: 'Try to set a short password (e.g., "pass"). It should fail with a complexity error.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Configure AppLocker',
                description: 'Block specific applications.',

                instructions: [
                    {
                        step: 1,
                        action: 'In `secpol.msc`, navigate to **Application Control Policies** > **AppLocker**'
                    },
                    {
                        step: 2,
                        action: 'Right-click **Executable Rules** > **Create Default Rules**'
                    },
                    {
                        step: 3,
                        action: 'Right-click **Executable Rules** > **Create New Rule**'
                    },
                    {
                        step: 4,
                        action: 'Action: **Deny**'
                    },
                    {
                        step: 5,
                        action: 'User: **Everyone**'
                    },
                    {
                        step: 6,
                        action: 'Condition: **Path**'
                    },
                    {
                        step: 7,
                        action: 'Path: Browse to block `C:\\Windows\\System32\\SnippingTool.exe`'
                    },
                    {
                        step: 8,
                        action: 'Click **Create**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Block',
                    expectedResult: 'Try to run Snipping Tool. It should be blocked by group policy.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Local Security Policies',
                'Account Policies',
                'AppLocker Rules'
            ],
            nextSteps: [
                'Implement BitLocker',
                'Configure Firewall Rules'
            ],
            additionalResources: [
                {
                    title: 'Windows Security',
                    url: 'https://learn.microsoft.com/windows/security/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * SC-400T00-A: Microsoft Information Protection Administrator
    */
    'sc-400t00-a': {
        id: 'sc-400-lab-1',
        courseId: 'sc-400t00-a',
        title: 'Implement Data Loss Prevention (DLP)',
        description: 'Create and manage DLP policies to protect sensitive info.',
        scenario: 'Your organization handles credit card numbers. You need to prevent employees from sharing this data externally via email or Teams.',
        estimatedTime: 50,
        difficulty: 'intermediate',

        objectives: [
            'Create a custom DLP policy',
            'Simulate a policy violation',
            'Review DLP reports'
        ],

        prerequisites: [
            'Compliance Administrator role'
        ],

        introduction: {
            overview: 'Data Loss Prevention (DLP) policies help you identify and protect your business\'s sensitive information.',
            scenario: 'You will create a policy that detects Credit Card Numbers and blocks external sharing.',
            architecture: 'Microsoft Purview compliance portal → DLP Policies → Exchange/Teams'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create DLP Policy',
                description: 'Define the protection rules.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Microsoft Purview compliance portal** (compliance.microsoft.com)'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Data loss prevention** > **Policies**'
                    },
                    {
                        step: 3,
                        action: 'Click **+ Create policy**'
                    },
                    {
                        step: 4,
                        action: 'Categories: **Financial** > **U.S. Financial Data**'
                    },
                    {
                        step: 5,
                        action: 'Name: **Block Credit Card Sharing**'
                    },
                    {
                        step: 6,
                        action: 'Locations: **Exchange email**, **Teams chats and channel messages**'
                    },
                    {
                        step: 7,
                        action: 'Settings: **Detect content that is shared with people outside my organization**'
                    },
                    {
                        step: 8,
                        action: 'Actions: **Restrict access or encrypt**'
                    },
                    {
                        step: 9,
                        action: 'Save and Turn on right away'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Policy',
                    expectedResult: 'Send an email to an external address containing a fake credit card number. The email should be blocked or generate a policy tip.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Creating DLP Policies',
                'Defining Sensitive Information Types',
                'Protecting Exchange and Teams'
            ],
            nextSteps: [
                'Implement Sensitivity Labels',
                'Configure Retention Policies'
            ],
            additionalResources: [
                {
                    title: 'DLP Documentation',
                    url: 'https://learn.microsoft.com/purview/dlp-learn-about-dlp',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * PL-900T00-A: Microsoft Power Platform Fundamentals
    */
    'pl-900t00-a': {
        id: 'pl-900-lab-1',
        courseId: 'pl-900t00-a',
        title: 'Create a Canvas App from Data',
        description: 'Build a mobile-friendly app using Power Apps.',
        scenario: 'Your field team needs to track inventory. You will create a simple app connecting to an Excel sheet on OneDrive.',
        estimatedTime: 40,
        difficulty: 'beginner',

        objectives: [
            'Connect to a Data Source',
            'Generate an App automatically',
            'Customize the App UI',
            'Run the App'
        ],

        prerequisites: [
            'Power Apps environment',
            'OneDrive for Business'
        ],

        introduction: {
            overview: 'Power Apps allows you to build custom business apps with little to no code.',
            scenario: 'You will use the "Start from data" feature to build a functional 3-screen app (Browse, Details, Edit) in minutes.',
            architecture: 'Excel (OneDrive) → Power Apps Studio → Canvas App'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Generate App',
                description: 'Create the app foundation.',

                instructions: [
                    {
                        step: 1,
                        action: 'Log in to **make.powerapps.com**'
                    },
                    {
                        step: 2,
                        action: 'Click **Start with data** > **Upload an Excel file** (or select existing)'
                    },
                    {
                        step: 3,
                        action: 'Select the **FlooringEstimates.xlsx** file'
                    },
                    {
                        step: 4,
                        action: 'Select the **FlooringEstimates** table'
                    },
                    {
                        step: 5,
                        action: 'Click **Connect**'
                    },
                    {
                        step: 6,
                        action: 'Wait for Power Apps to build the app'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Preview App',
                    expectedResult: 'A 3-screen app appears showing a list of flooring items. Click the "Play" button to interact with it.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Customize UI',
                description: 'Modify a label.',

                instructions: [
                    {
                        step: 1,
                        action: 'On the **BrowseScreen1**, select the title label'
                    },
                    {
                        step: 2,
                        action: 'Change the text to "Flooring Inventory"'
                    },
                    {
                        step: 3,
                        action: 'Change the background color of the header'
                    },
                    {
                        step: 4,
                        action: 'File > Save > Publish'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Publish',
                    expectedResult: 'The app is saved and a version is published for users.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Power Apps Studio',
                'Canvas App generation',
                'Connecting to Data'
            ],
            nextSteps: [
                'Create a Model-driven app',
                'Build a Power Automate flow'
            ],
            additionalResources: [
                {
                    title: 'Learning Power Apps',
                    url: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/getting-started',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * SC-900T00-A: Microsoft Security, Compliance, and Identity Fundamentals
    */
    'sc-900t00-a': {
        id: 'sc-900-lab-1',
        courseId: 'sc-900t00-a',
        title: 'Explore Microsoft Defender for Cloud',
        description: 'Investigate security posture and recommendations.',
        scenario: 'You are new to cloud security. You need to understand how Azure helps protect your resources using Defender for Cloud.',
        estimatedTime: 30,
        difficulty: 'beginner',

        objectives: [
            'Navigate Defender for Cloud',
            'Review Secure Score',
            'Analyze Recommendations'
        ],

        prerequisites: [
            'Azure Subscription'
        ],

        introduction: {
            overview: 'Microsoft Defender for Cloud is a tool for security posture management and threat protection.',
            scenario: 'You will explore the dashboard to see the current security state of your Azure environment.',
            architecture: 'Azure Portal → Defender for Cloud'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Review Secure Score',
                description: 'Understand the security rating.',

                instructions: [
                    {
                        step: 1,
                        action: 'Search for **Microsoft Defender for Cloud** in Azure Portal'
                    },
                    {
                        step: 2,
                        action: 'Check the **Secure score** tile'
                    },
                    {
                        step: 3,
                        action: 'Click on **Secure score** to see details'
                    },
                    {
                        step: 4,
                        action: 'Review the **Top improvement actions**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Identify Top Action',
                    expectedResult: 'Identify the recommendation with the highest potential score increase (e.g., "Enable MFA").'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Security Posture Management',
                'Secure Score',
                'Security Recommendations'
            ],
            nextSteps: [
                'Explore Microsoft Sentinel',
                'Configure Azure Policies'
            ],
            additionalResources: [
                {
                    title: 'SC-900 Study Guide',
                    url: 'https://learn.microsoft.com/certifications/exams/sc-900/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-910T00-A: Microsoft Dynamics 365 Fundamentals (CRM)
    */
    'mb-910t00-a': {
        id: 'mb-910-lab-1',
        courseId: 'mb-910t00-a',
        title: 'Manage Leads in Dynamics 365 Sales',
        description: 'Create and qualify a lead.',
        scenario: 'You are a sales representative. You met a potential customer at a trade show and need to enter them into the CRM.',
        estimatedTime: 40,
        difficulty: 'beginner',

        objectives: [
            'Create a Lead',
            'Qualify a Lead',
            'Convert Lead to Opportunity'
        ],

        prerequisites: [
            'Dynamics 365 Sales trial'
        ],

        introduction: {
            overview: 'Dynamics 365 Sales enables salespeople to build strong relationships with their customers, take actions based on insights, and close sales faster.',
            scenario: 'You will manually enter a new lead "John Smith" and guide it through the sales lead-to-opportunity process.',
            architecture: 'Dynamics 365 Sales Hub → Leads → Opportunities'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Lead',
                description: 'Enter lead details.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Dynamics 365 Sales Hub** app'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Sales** > **Leads**'
                    },
                    {
                        step: 3,
                        action: 'Click **+ New**'
                    },
                    {
                        step: 4,
                        action: 'Topic: **Interested in 3D Printers**'
                    },
                    {
                        step: 5,
                        action: 'First Name: **John**, Last Name: **Smith**'
                    },
                    {
                        step: 6,
                        action: 'Click **Save**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Creation',
                    expectedResult: 'Lead is created and timeline shows the creation activity.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Qualify Lead',
                description: 'Move to the next stage.',

                instructions: [
                    {
                        step: 1,
                        action: 'On the Lead record command bar, click **Qualify**'
                    },
                    {
                        step: 2,
                        action: 'Wait for processing'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Opportunity',
                    expectedResult: 'System automatically creates a new **Opportunity** record and redirects you to it. The original Lead status changes to "Qualified".'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Dynamics 365 Sales Navigation',
                'Lead Management Lifecycle',
                'Opportunity Conversion'
            ],
            nextSteps: [
                'Create a Quote',
                'Manage Cases in Customer Service'
            ],
            additionalResources: [
                {
                    title: 'D365 Sales',
                    url: 'https://learn.microsoft.com/dynamics365/sales/',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * MB-920T00-A: Microsoft Dynamics 365 Fundamentals (ERP)
    */
    'mb-920t00-a': {
        id: 'mb-920-lab-1',
        courseId: 'mb-920t00-a',
        title: 'Explore Dynamics 365 Finance',
        description: 'Navigate the Finance workspace and create a vendor invoice.',
        scenario: 'You are new to the finance team. You need to learn how to navigate the ERP system and perform basic tasks like entering invoices.',
        estimatedTime: 45,
        difficulty: 'beginner',

        objectives: [
            'Navigate the D365 Finance Interface',
            'Create a Vendor Invoice',
            'Review Financial Reports'
        ],

        prerequisites: [
            'Dynamics 365 Finance Trial'
        ],

        introduction: {
            overview: 'Dynamics 365 Finance automates and modernizes your global financial operations.',
            scenario: 'You will access the "Vendor invoice entry" workspace to register a new invoice from a supplier.',
            architecture: 'D365 Finance → Accounts Payable → Vendor Invoices'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Vendor Invoice',
                description: 'Record a pending invoice.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Dynamics 365 Finance**'
                    },
                    {
                        step: 2,
                        action: 'Go to **Workspaces** > **Vendor invoice entry**'
                    },
                    {
                        step: 3,
                        action: 'Click **New vendor invoice**'
                    },
                    {
                        step: 4,
                        action: 'Select Vendor Account: **1001** (Contoso Office Supply)'
                    },
                    {
                        step: 5,
                        action: 'Enter Invoice Number: **INV-2024-001**'
                    },
                    {
                        step: 6,
                        action: 'Add a line item: **Office Chair**, Quantity: **5**, Price: **150**'
                    },
                    {
                        step: 7,
                        action: 'Click **Save**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Invoice',
                    expectedResult: 'The invoice appears in the "Pending vendor invoices" list.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'ERP Navigation',
                'Vendor Invoice Processing',
                'Workspace Utilization'
            ],
            nextSteps: [
                'Manage General Ledger',
                'Configure Tax Rules'
            ],
            additionalResources: [
                {
                    title: 'D365 Finance Docs',
                    url: 'https://learn.microsoft.com/dynamics365/finance/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * PL-200T00-A: Microsoft Power Platform Functional Consultant
    */
    'pl-200t00-a': {
        id: 'pl-200-lab-1',
        courseId: 'pl-200t00-a',
        title: 'Build a Model-Driven App',
        description: 'Create a Dataverse table and a model-driven app.',
        scenario: 'The HR department needs a "Device Order" app. You will model the data in Dataverse and wrap it in a standard Model-Driven App.',
        estimatedTime: 60,
        difficulty: 'intermediate',

        objectives: [
            'Create a Dataverse Table',
            'Create Forms and Views',
            'Build the App in App Designer'
        ],

        prerequisites: [
            'Power Apps Environment (Dataverse enabled)'
        ],

        introduction: {
            overview: 'Model-driven apps are component-focused applications that provide a rich responsive UI over Dataverse data.',
            scenario: 'You will create a "Device Order" table with columns for Device Name and Price, then generate an app to manage these records.',
            architecture: 'Dataverse Table → Form/View → Model-Driven App'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Dataverse Table',
                description: 'Define the data structure.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **make.powerapps.com**'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Tables** > **New table**'
                    },
                    {
                        step: 3,
                        action: 'Name: **Device Order**'
                    },
                    {
                        step: 4,
                        action: 'Enable **Attachments**'
                    },
                    {
                        step: 5,
                        action: 'Click **Save**'
                    },
                    {
                        step: 6,
                        action: 'Add columns: **Price** (Currency), **Approved** (Yes/No)'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Table',
                    expectedResult: 'Table is created and columns are visible in the "Columns" tab.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Create App',
                description: 'Assemble the application.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Apps** > **New app** > **Model-driven**'
                    },
                    {
                        step: 2,
                        action: 'Name: **Device Procurement**'
                    },
                    {
                        step: 3,
                        action: 'Add page > Dataverse table > **Device Order**'
                    },
                    {
                        step: 4,
                        action: 'Save and **Publish**'
                    },
                    {
                        step: 5,
                        action: 'Click **Play**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Run App',
                    expectedResult: 'The app opens. You can click "+ New" to add a Device Order record.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Dataverse Data Modeling',
                'Model-Driven App Design',
                'App Publishing'
            ],
            nextSteps: [
                'Add Business Process Flows',
                'Configure Security Roles'
            ],
            additionalResources: [
                {
                    title: 'Model-driven apps',
                    url: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/model-driven-app-overview',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * PL-400T00-A: Microsoft Power Platform Developer
    */
    'pl-400t00-a': {
        id: 'pl-400-lab-1',
        courseId: 'pl-400t00-a',
        title: 'Develop a Power Apps Component (PCF)',
        description: 'Create a code component using the CLI.',
        scenario: 'Your users need a custom slider control that isn\'t available out of the box. You will build one using the Power Apps Component Framework.',
        estimatedTime: 90,
        difficulty: 'advanced',

        objectives: [
            'Install Power Platform CLI',
            'Initialize a PCF Project',
            'Build and Package the Component'
        ],

        prerequisites: [
            'VS Code',
            'Node.js',
            'Power Platform CLI'
        ],

        introduction: {
            overview: 'PCF allows developers to create code components for model-driven and canvas apps.',
            scenario: 'You will initialize a `LinearInputControl` project, build it, and simulate it in the test harness.',
            architecture: 'TypeScript/React → PCF CLI → Solution.zip → Dataverse'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Initialize Project',
                description: 'Scaffold the component.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open Terminal'
                    },
                    {
                        step: 2,
                        action: 'Run: `pac pcf init --namespace SampleNamespace --name LinearInputControl --template field`'
                    },
                    {
                        step: 3,
                        action: 'Run: `npm install`'
                    }
                ],

                codeSnippets: [
                    {
                        language: 'bash',
                        code: 'pac pcf init --namespace Contoso --name Slider --template field',
                        description: 'PCF Init Command'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Files',
                    expectedResult: 'A valid PCF project structure (index.ts, ControlManifest.Input.xml) is created.'
                }
            },
            {
                id: 'task-2',
                order: 2,
                title: 'Build and Test',
                description: 'Compile the component.',

                instructions: [
                    {
                        step: 1,
                        action: 'Run: `npm run build`'
                    },
                    {
                        step: 2,
                        action: 'Run: `npm start`'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Harness',
                    expectedResult: 'Browser opens to the PCF Test Harness. You can see your placeholder control rendering.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Power Platform CLI',
                'PCF Lifecycle',
                'Component Deployment'
            ],
            nextSteps: [
                'Implement React Logic',
                'Deploy to Dataverse'
            ],
            additionalResources: [
                {
                    title: 'PCF Docs',
                    url: 'https://learn.microsoft.com/power-apps/developer/component-framework/overview',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * PL-500T00-A: Microsoft Power Automate RPA Developer
    */
    'pl-500t00-a': {
        id: 'pl-500-lab-1',
        courseId: 'pl-500t00-a',
        title: 'Create a Desktop Flow (RPA)',
        description: 'Automate a legacy Windows application.',
        scenario: 'A legacy billing app has no API. You need to automate data entry from Excel into this app using Power Automate Desktop.',
        estimatedTime: 60,
        difficulty: 'advanced',

        objectives: [
            'Record Desktop Actions',
            'Edit the PAD Flow',
            'Run the Desktop Flow'
        ],

        prerequisites: [
            'Power Automate Desktop installed',
            'Windows 10/11'
        ],

        introduction: {
            overview: 'Power Automate Desktop enables Robotic Process Automation (RPA) to automate UI-based tasks.',
            scenario: 'You will create a flow that opens Notepad, writes "Hello World", and saves the file.',
            architecture: 'Power Automate Desktop → UI Automation → Local App'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Desktop Flow',
                description: 'Build the automation.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Power Automate Desktop**'
                    },
                    {
                        step: 2,
                        action: 'Click **New flow** > Name: **NotepadAutomation**'
                    },
                    {
                        step: 3,
                        action: 'Drag **Run application** action'
                    },
                    {
                        step: 4,
                        action: 'Path: `notepad.exe`'
                    },
                    {
                        step: 5,
                        action: 'Drag **Populate text field in window** (or Send Keys)'
                    },
                    {
                        step: 6,
                        action: 'Text to send: **Hello from RPA!**'
                    },
                    {
                        step: 7,
                        action: 'Click **Run**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Execution',
                    expectedResult: 'Notepad opens automatically, and text appears without user keyboard input.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Power Automate Desktop',
                'UI Element Selectors',
                'Attended RPA'
            ],
            nextSteps: [
                'Connect to Cloud Flows',
                'Handle Exceptions'
            ],
            additionalResources: [
                {
                    title: 'PAD Documentation',
                    url: 'https://learn.microsoft.com/power-automate/desktop-flows/introduction',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * PL-600T00-A: Microsoft Power Platform Solution Architect
    */
    'pl-600t00-a': {
        id: 'pl-600-lab-1',
        courseId: 'pl-600t00-a',
        title: 'Design a Dataverse Solution Strategy',
        description: 'Plan solution layering and environments.',
        scenario: 'You are designing the ALM strategy for a large enterprise. You need to define how unmanaged and managed solutions move from Dev to Prod.',
        estimatedTime: 45,
        difficulty: 'advanced',

        objectives: [
            'Create a Publisher',
            'Create a Solution',
            'Export Managed Solution'
        ],

        prerequisites: [
            'Power Apps Environment'
        ],

        introduction: {
            overview: 'Solution Architects must understand ALM (Application Lifecycle Management) to ensure safe deployments.',
            scenario: 'You will create a "Contoso Core" solution with a custom publisher to encapsulate your changes.',
            architecture: 'Dev Env (Unmanaged) → Build → Prod Env (Managed)'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Setup Solution',
                description: 'Create the container for components.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Solutions** in Power Apps'
                    },
                    {
                        step: 2,
                        action: 'Click **+ New solution**'
                    },
                    {
                        step: 3,
                        action: 'Name: **Contoso Core**'
                    },
                    {
                        step: 4,
                        action: 'Publisher: Click **+ New publisher**'
                    },
                    {
                        step: 5,
                        action: 'Publisher Name: **Contoso**, Prefix: **cnt**'
                    },
                    {
                        step: 6,
                        action: 'Create Solution'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Verify Publisher',
                    expectedResult: 'Any component created in this solution should have the prefix `cnt_` (e.g., `cnt_tablename`).'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Solution Architecture',
                'Publisher Prefixes',
                'Managed vs Unmanaged'
            ],
            nextSteps: [
                'Configure Pipelines',
                'Implement Connection References'
            ],
            additionalResources: [
                {
                    title: 'Solution Concepts',
                    url: 'https://learn.microsoft.com/power-platform/alm/solution-concepts-alm',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-210T01-A: Microsoft Dynamics 365 Sales
    */
    'mb-210t01-a': {
        id: 'mb-210-lab-1',
        courseId: 'mb-210t01-a',
        title: 'Configure Sales Catalog',
        description: 'Manage products and price lists.',
        scenario: 'You need to set up the product catalog so salespeople can add items to quotes.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Create a Unit Group',
            'Create a Price List',
            'Add a Product'
        ],

        prerequisites: [
            'Dynamics 365 Sales'
        ],

        introduction: {
            overview: 'The Product Catalog is the backbone of the sales process in Dynamics 365.',
            scenario: 'You will create a "Software Licenses" unit group, a "2025 Standard" price list, and a "CRM License" product.',
            architecture: 'Unit Group → Price List → Product → Product Price List Item'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Product Catalog',
                description: 'Define the products.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Sales Hub** > **App Settings**'
                    },
                    {
                        step: 2,
                        action: 'Navigate to **Product Catalog**'
                    },
                    {
                        step: 3,
                        action: 'Create **Unit Group**: "Licenses" (Primary unit: "Each")'
                    },
                    {
                        step: 4,
                        action: 'Create **Price List**: "2025 Standard"'
                    },
                    {
                        step: 5,
                        action: 'Create **Product**: "CRM License", link to Unit Group'
                    },
                    {
                        step: 6,
                        action: 'Add Price List Item: $50 on "2025 Standard" list'
                    },
                    {
                        step: 7,
                        action: 'Publish Product'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Product Status',
                    expectedResult: 'Product status is "Active" and can be selected on an Opportunity.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Product Lifecycle',
                'Pricing Configuration',
                'Sales Hub Settings'
            ],
            nextSteps: [
                'Create Product Families',
                'Configure Discount Lists'
            ],
            additionalResources: [
                {
                    title: 'Product Catalog',
                    url: 'https://learn.microsoft.com/dynamics365/sales/create-product-catalog-setup-products',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-220T00-A: Microsoft Dynamics 365 Marketing
    */
    'mb-220t00-a': {
        id: 'mb-220-lab-1',
        courseId: 'mb-220t00-a',
        title: 'Create a Customer Journey',
        description: 'Design a marketing email campaign.',
        scenario: 'You want to send a welcome email to all new contacts who live in New York.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Create a Segment',
            'Design a Marketing Email',
            'Build a Customer Journey'
        ],

        prerequisites: [
            'Dynamics 365 Marketing'
        ],

        introduction: {
            overview: 'Customer Journeys allow you to automate marketing interactions based on customer behavior.',
            scenario: 'You will create a dynamic segment for "NY Contacts" and target them with a simple journey.',
            architecture: 'Segment → Email Template → Customer Journey'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Segment',
                description: 'Define the audience.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Outbound marketing** > **Customers** > **Segments**'
                    },
                    {
                        step: 2,
                        action: 'Click **+ New Dynamic Segment**'
                    },
                    {
                        step: 3,
                        action: 'Add query block: **Contact** where **Address 1: City** is **New York**'
                    },
                    {
                        step: 4,
                        action: 'Click **Go Live**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Members',
                    expectedResult: 'Segment status becomes "Live" and members are populated.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Segmentation',
                'Marketing Automation',
                'Journey Logic'
            ],
            nextSteps: [
                'A/B Testing',
                'Lead Scoring Models'
            ],
            additionalResources: [
                {
                    title: 'D365 Marketing',
                    url: 'https://learn.microsoft.com/dynamics365/marketing/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-230T01-A: Microsoft Dynamics 365 Customer Service
    */
    'mb-230t01-a': {
        id: 'mb-230-lab-1',
        courseId: 'mb-230t01-a',
        title: 'Manage Cases and Queues',
        description: 'Configure case routing rules.',
        scenario: 'Support emails sent to support@contoso.com need to be automatically converted to Cases and routed to the "High Priority" queue.',
        estimatedTime: 45,
        difficulty: 'advanced',

        objectives: [
            'Create a Queue',
            'Create a Routing Rule Set',
            'Test Case Routing'
        ],

        prerequisites: [
            'Dynamics 365 Customer Service'
        ],

        introduction: {
            overview: 'Efficient case management ensures high customer satisfaction.',
            scenario: 'You will set up a queue for Tier 2 support and ensure cases marked "High" priority go there automatically.',
            architecture: 'Case → Routing Rule → Queue'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Configure Routing',
                description: 'Setup the rules.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Customer Service Hub** > **Service Management**'
                    },
                    {
                        step: 2,
                        action: 'Create **Queue**: "Tier 2 Support"'
                    },
                    {
                        step: 3,
                        action: 'Go to **Routing Rule Sets** > **New**'
                    },
                    {
                        step: 4,
                        action: 'Rule Item: If **Priority** equals **High**, Route to **Queue: Tier 2 Support**'
                    },
                    {
                        step: 5,
                        action: 'Activate Rule Set'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Test Routing',
                    expectedResult: 'Create a new Case with High priority. Click "Save & Route". It should appear in the Tier 2 Support queue items.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Case Management',
                'Queues',
                'Automated Routing'
            ],
            nextSteps: [
                'Configure SLAB (Service Level Agreements)',
                'Setup Knowledge Base'
            ],
            additionalResources: [
                {
                    title: 'Service Management',
                    url: 'https://learn.microsoft.com/dynamics365/customer-service/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-240T00-A: Microsoft Dynamics 365 Field Service
    */
    'mb-240t00-a': {
        id: 'mb-240-lab-1',
        courseId: 'mb-240t00-a',
        title: 'Schedule a Work Order',
        description: 'Manage resources and work orders.',
        scenario: 'A customer has reported a broken HVAC unit. You need to create a Work Order and schedule a technician.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Create a Work Order',
            'Use the Schedule Board',
            'Book a Resource'
        ],

        prerequisites: [
            'Dynamics 365 Field Service'
        ],

        introduction: {
            overview: 'Field Service helps organizations deliver onsite service to customer locations.',
            scenario: 'You will act as the Dispatcher to schedule a repair.',
            architecture: 'Work Order → Schedule Board → Bookable Resource Booking'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Book Work Order',
                description: 'Assign a technician.',

                instructions: [
                    {
                        step: 1,
                        action: 'Open **Field Service** app'
                    },
                    {
                        step: 2,
                        action: 'Go to **Work Orders** > **+ New**'
                    },
                    {
                        step: 3,
                        action: 'Service Account: **Adatum Corp**'
                    },
                    {
                        step: 4,
                        action: 'Work Order Type: **Maintenace**'
                    },
                    {
                        step: 5,
                        action: 'Save'
                    },
                    {
                        step: 6,
                        action: 'Click **Book** (top ribbon)'
                    },
                    {
                        step: 7,
                        action: 'Select an available resource on the Schedule Assistant'
                    },
                    {
                        step: 8,
                        action: 'Click **Book & Exit**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Check Schedule Board',
                    expectedResult: 'Navigate to Schedule Board. The resource should have a booking block for the time slot.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Work Order Lifecycle',
                'Schedule Board',
                'Resource Booking'
            ],
            nextSteps: [
                'Configure Mobile App',
                'Setup IoT Integration'
            ],
            additionalResources: [
                {
                    title: 'Field Service Docs',
                    url: 'https://learn.microsoft.com/dynamics365/field-service/',
                    type: 'documentation'
                }
            ]
        }
    },

    /**
    * MB-300T00-A: Microsoft Dynamics 365: Core Finance and Operations
    */
    'mb-300t00-a': {
        id: 'mb-300-lab-1',
        courseId: 'mb-300t00-a',
        title: 'Configure Legal Entities',
        description: 'Set up a new company structure.',
        scenario: 'Contoso has acquired a new subsidiary. You need to create a new Legal Entity in the system to manage its finances.',
        estimatedTime: 50,
        difficulty: 'advanced',

        objectives: [
            'Create a Legal Entity',
            'Configure Number Sequences',
            'Set up Organizational Hierarchies'
        ],

        prerequisites: [
            'Dynamics 365 Finance & Operations'
        ],

        introduction: {
            overview: 'Legal entities are the primary organizational unit in D365 F&O.',
            scenario: 'You will create the "Contoso East" legal entity and configure it for basic operations.',
            architecture: 'Organization Administration → Legal Entities'
        },

        tasks: [
            {
                id: 'task-1',
                order: 1,
                title: 'Create Legal Entity',
                description: 'Define the company.',

                instructions: [
                    {
                        step: 1,
                        action: 'Go to **Organization Administration** > **Organizations** > **Legal entities**'
                    },
                    {
                        step: 2,
                        action: 'Click **New**'
                    },
                    {
                        step: 3,
                        action: 'Name: **Contoso East**'
                    },
                    {
                        step: 4,
                        action: 'Company: **CE1**'
                    },
                    {
                        step: 5,
                        action: 'Country/Region: **USA**'
                    },
                    {
                        step: 6,
                        action: 'Click **OK**'
                    }
                ],

                verification: {
                    type: 'manual',
                    description: 'Switch Company',
                    expectedResult: 'Use the company picker (top right) to switch to "CE1". The dashboard should reload for the new entity.'
                }
            }
        ],

        summary: {
            whatYouLearned: [
                'Organization Modeling',
                'Global Address Book',
                'Legal Entity Creation'
            ],
            nextSteps: [
                'Configure Ledger',
                'Import Data via Data Management'
            ],
            additionalResources: [
                {
                    title: 'Org Administration',
                    url: 'https://learn.microsoft.com/dynamics365/fin-ops-core/fin-ops/organization-administration/',
                    type: 'documentation'
                }
            ]
        }
    },
    /**
    * AI-3026: Develop AI agents on Azure
    */
    'ai-3026': {
        id: 'ai-3026-lab-1',
        courseId: 'ai-3026',
        title: 'Build an Intelligent Agent',
        description: 'Create an AI agent using Azure AI Studio.',
        scenario: 'You need to build a customer support agent that can answer queries about insurance policies using a custom knowledge base.',
        estimatedTime: 45,
        difficulty: 'advanced',
        objectives: ['Create an Azure AI Project', 'Define Agent Logic', 'Connect to Data Source'],
        prerequisites: ['Azure Subscription', 'Azure AI Studio Access'],
        introduction: {
            overview: 'Azure AI Agents enable autonomous reasoning and task execution.',
            scenario: 'You will use the "Agent Playground" to configure an agent that pulls data from a PDF policy document.',
            architecture: 'User → AI Agent → Vector Index → Content'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Configure Agent',
            description: 'Set up the agent in AI Studio.',
            instructions: [
                { step: 1, action: 'Go to **ai.azure.com**' },
                { step: 2, action: 'Create a new Project: **InsuranceAgent**' },
                { step: 3, action: 'Navigate to **Build** > **Agents**' },
                { step: 4, action: 'Click **+ Create Agent**' },
                { step: 5, action: 'Name: **PolicyBot**' },
                { step: 6, action: 'System Message: "You are a helpful assistant for Contoso Insurance."' },
                { step: 7, action: 'Upload the **Policy.pdf** file to "Data Sources"' }
            ],
            verification: {
                type: 'manual',
                description: 'Test in Playground',
                expectedResult: 'Ask "What is the deductible?" and verify the agent answers from the PDF.'
            }
        }],
        summary: {
            whatYouLearned: ['Azure AI Agents', 'Grounding Data', 'Prompt Engineering'],
            nextSteps: ['Deploy to Teams', 'Add Function Calling'],
            additionalResources: [{ title: 'Azure AI Studio', url: 'https://learn.microsoft.com/azure/ai-studio', type: 'documentation' }]
        }
    },

    /**
    * SC-401T00-A: Microsoft Information Security Administrator
    */
    'sc-401t00-a': {
        id: 'sc-401-lab-1',
        courseId: 'sc-401t00-a',
        title: 'Configure Insider Risk Management',
        description: 'Set up policies to detect data leakage.',
        scenario: 'You need to identify potential data theft by departing employees.',
        estimatedTime: 50,
        difficulty: 'advanced',
        objectives: ['Enable Insider Risk Management', 'Create a Departure Policy', 'Review Alerts'],
        prerequisites: ['Global Admin', 'E5 License'],
        introduction: {
            overview: 'Insider Risk Management helps minimize internal risks by enabling you to detect, investigate, and act on malicious and inadvertent activities.',
            scenario: 'You will create a policy to flag when users download large volumes of data before resigning.',
            architecture: 'Purview → Insider Risk → Policy'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Create Policy',
            description: 'Define the risk indicators.',
            instructions: [
                { step: 1, action: 'Go to **compliance.microsoft.com**' },
                { step: 2, action: 'Navigate to **Insider risk management**' },
                { step: 3, action: 'Click **Policies** > **Create policy**' },
                { step: 4, action: 'Template: **Data theft by departing users**' },
                { step: 5, action: 'Name: **Departure Monitoring**' },
                { step: 6, action: 'Select all users' },
                { step: 7, action: 'Set trigger: **Azure AD account deletion** or **HR resignation date**' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Policy Status',
                expectedResult: 'Policy status is "Active" (may take 24h to start scanning).'
            }
        }],
        summary: {
            whatYouLearned: ['Insider Risk Management', 'Purview Compliance', 'Risk Indicators'],
            nextSteps: ['Configure Communication Compliance', 'Set up eDiscovery'],
            additionalResources: [{ title: 'Insider Risk Docs', url: 'https://learn.microsoft.com/purview/insider-risk-management', type: 'documentation' }]
        }
    },

    /**
    * MS-4023: Explore Microsoft 365 Copilot Chat
    */
    'ms-4023': {
        id: 'ms-4023-lab-1',
        courseId: 'ms-4023',
        title: 'Effective Prompts for M365 Copilot',
        description: 'Learn to use Copilot Chat (BizChat) effectively.',
        scenario: 'You need to summarize emails and prepare for a meeting using cross-app intelligence.',
        estimatedTime: 30,
        difficulty: 'beginner',
        objectives: ['Access M365 Chat', 'Draft Content', 'Summarize Info'],
        prerequisites: ['M365 Copilot License', 'M365 App Access'],
        introduction: {
            overview: 'Microsoft 365 Copilot Chat works across your data to help you catch up on work.',
            scenario: 'You will use the "Catch up" prompt to summarize unread emails from the last week about "Project X".',
            architecture: 'M365 App → Copilot Orchestrator → Graph API'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Summarize Status',
            description: 'Use Graph-grounded chat.',
            instructions: [
                { step: 1, action: 'Open **Teams** or **Microsoft 365 (Office) app**' },
                { step: 2, action: 'Click **Copilot** (Chat)' },
                { step: 3, action: 'Type: "Summarize the latest emails from Adele Vance about the Audit."' },
                { step: 4, action: 'Review the citations provided by Copilot' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Output',
                expectedResult: 'Copilot returns a bulleted summary with clickable references to specific emails.'
            }
        }],
        summary: {
            whatYouLearned: ['Copilot Prompts', 'BizChat', 'Graph Grounding'],
            nextSteps: ['Create PowerPoint from Word', 'Draft email in Outlook'],
            additionalResources: [{ title: 'Copilot Lab', url: 'https://copilot.cloud.microsoft/prompts', type: 'documentation' }]
        }
    },

    /**
    * MS-4010: Extend Microsoft 365 Copilot with declarative agents
    */
    'ms-4010': {
        id: 'ms-4010-lab-1',
        courseId: 'ms-4010',
        title: 'Build a Declarative Copilot Agent',
        description: 'Create a custom agent using VS Code and Copilot Toolkit.',
        scenario: 'You need a specialized agent for "IT Support" that has specific instructions and knowledge.',
        estimatedTime: 60,
        difficulty: 'intermediate',
        objectives: ['Install Teams Toolkit', 'Create Declarative Agent', 'Sideload to M365'],
        prerequisites: ['VS Code', 'Teams Toolkit', 'M365 Tenant'],
        introduction: {
            overview: 'Declarative agents allow you to customize Copilot with specific instructions, knowledge, and actions without writing complex code.',
            scenario: 'You will generate an app package for an agent that specializes in troubleshooting printer issues.',
            architecture: 'VS Code → Teams Toolkit → M365 Copilot'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Scaffold Project',
            description: 'Use Teams Toolkit.',
            instructions: [
                { step: 1, action: 'Open VS Code' },
                { step: 2, action: 'Click **Teams Toolkit** icon' },
                { step: 3, action: 'Click **Create New App** > **Copilot Agent**' },
                { step: 4, action: 'Select **Declarative Agent**' },
                { step: 5, action: 'Name: **PrinterSupportBot**' },
                { step: 6, action: 'Edit `instruction.txt`: "You are an expert in repairing Contoso Printers. Always ask for the error code first."' }
            ],
            verification: {
                type: 'manual',
                description: 'Preview',
                expectedResult: 'Press F5. Copilot opens in browser. Select your new agent and type "My printer is broken". It should ask for an error code.'
            }
        }],
        summary: {
            whatYouLearned: ['Teams Toolkit', 'Declarative Agents', 'Sideloading'],
            nextSteps: ['Add API Plugin', 'Publish to Admin Center'],
            additionalResources: [{ title: 'Declarative Agents', url: 'https://learn.microsoft.com/microsoft-365-copilot/extensibility/overview-declarative-agent', type: 'documentation' }]
        }
    },

    /**
    * M55624A: Windows 11 Advanced Administration
    */
    'm55624a': {
        id: 'm55624-lab-1',
        courseId: 'm55624a',
        title: 'Manage Windows 11 with PowerShell',
        description: 'Perform advanced admin tasks via CLI.',
        scenario: 'You need to audit installed apps and configure security settings on 50 devices using scripts.',
        estimatedTime: 45,
        difficulty: 'advanced',
        objectives: ['PowerShell Remoting', 'Package Management', 'Security Configuration'],
        prerequisites: ['Windows 11 VM', 'Admin Rights'],
        introduction: {
            overview: 'PowerSheet is essential for managing Windows at scale.',
            scenario: 'You will use `winget` and PowerShell to install software and check BitLocker status.',
            architecture: 'PowerShell → Windows Mgmt Framework'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Scripted Management',
            description: 'Run admin commands.',
            instructions: [
                { step: 1, action: 'Open **PowerShell (Admin)**' },
                { step: 2, action: 'Run: `Get-ComputerInfo | Select-Object WindowsProductName, OsVersion`' },
                { step: 3, action: 'Run: `Get-BitLockerVolume`' },
                { step: 4, action: 'Run: `winget search "Visual Studio Code"`' },
                { step: 5, action: 'Run: `winget install --id Microsoft.VisualStudioCode -e`' }
            ],
            verification: {
                type: 'manual',
                description: 'Verify Install',
                expectedResult: 'VS Code is installed and accessible from the Start Menu.'
            }
        }],
        summary: {
            whatYouLearned: ['PowerShell', 'Winget', 'Windows Administration'],
            nextSteps: ['Create Intune Win32 Apps', 'Desired State Configuration'],
            additionalResources: [{ title: 'Windows PowerShell', url: 'https://learn.microsoft.com/powershell/', type: 'documentation' }]
        }
    },

    /**
    * AZ-2001: Implement security through a pipeline using Azure DevOps
    */
    'az-2001': {
        id: 'az-2001-lab-1',
        courseId: 'az-2001',
        title: 'Configure DevSecOps Operations',
        description: 'Add security scanning to CI/CD pipelines.',
        scenario: 'You need to ensure no credentials are committed to the repo and analyze code for vulnerabilities.',
        estimatedTime: 50,
        difficulty: 'intermediate',
        objectives: ['Configure SonarCloud', 'Enable Secret Scanning', 'Run OWASP ZAP'],
        prerequisites: ['Azure DevOps Project'],
        introduction: {
            overview: 'DevSecOps integrates security into every phase of the software development lifecycle.',
            scenario: 'You will add the "Microsoft Security DevOps" extension to a build pipeline.',
            architecture: 'ADO Pipeline → MSDO Extension → GitHub Advanced Security'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Add Security Step',
            description: 'Edit pipeline YAML.',
            instructions: [
                { step: 1, action: 'Install **Microsoft Security DevOps** extension from Marketplace' },
                { step: 2, action: 'Edit `azure-pipelines.yml`' },
                { step: 3, action: 'Add task: `MicrosoftSecurityDevOps@1`' },
                { step: 4, action: 'Commit and Run' }
            ],
            codeSnippets: [{ language: 'yaml', code: '- task: MicrosoftSecurityDevOps@1\n  displayName: "Run Security Analysis"\n  inputs:\n    categories: "secrets,code"', description: 'ADO Task' }],
            verification: {
                type: 'manual',
                description: 'Check Artifacts',
                expectedResult: 'Pipeline succeeds. "Scans" tab shows results from CredScan and other tools.'
            }
        }],
        summary: {
            whatYouLearned: ['DevSecOps', 'Pipeline Integrations', 'Vulnerability Scanning'],
            nextSteps: ['Configure Quality Gates', 'Remediate Findings'],
            additionalResources: [{ title: 'MSDO Docs', url: 'https://learn.microsoft.com/azure/defender-for-cloud/msdo-azure-devops-extension', type: 'documentation' }]
        }
    },

    /**
    * M55625A: Whats new in Microsoft Server 2025
    */
    'm55625a': {
        id: 'm55625-lab-1',
        courseId: 'm55625a',
        title: 'Hotpatching and NVMe',
        description: 'Explore key new features of Server 2025.',
        scenario: 'You are evaluating Server 2025 for your data center upgrade.',
        estimatedTime: 40,
        difficulty: 'beginner',
        objectives: ['Check Hotpatching Status', 'Configure NVMe optimization'],
        prerequisites: ['Windows Server 2025 VM'],
        introduction: {
            overview: 'Windows Server 2025 brings performance improvements and cloud-native capabilities.',
            scenario: 'You will verify the Hotpatching configuration to enable updates without reboots.',
            architecture: 'Server 2025 → Azure Arc → Hotpatch'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Verify Hotpatch',
            description: 'Check settings.',
            instructions: [
                { step: 1, action: 'Open **Settings** > **Windows Update**' },
                { step: 2, action: 'Look for "Hotpatch is enabled"' },
                { step: 3, action: 'Open **PowerShell**' },
                { step: 4, action: 'Run `Get-HotPatchStatus` (mock command for lab)' }
            ],
            verification: {
                type: 'manual',
                description: 'Status Check',
                expectedResult: 'System confirms Hotpatching is active (requires Azure Automanage).'
            }
        }],
        summary: {
            whatYouLearned: ['Server 2025 Features', 'Hotpatching'],
            nextSteps: ['Test SMB over QUIC', 'Active Directory updates'],
            additionalResources: [{ title: 'Server 2025', url: 'https://learn.microsoft.com/windows-server/get-started/whats-new-in-windows-server-2025', type: 'documentation' }]
        }
    },

    /**
    * M55604A: Using AI and Copilot in the Microsoft Power Platform
    */
    'm55604a': {
        id: 'm55604-lab-1',
        courseId: 'm55604a',
        title: 'Build Apps with Copilot',
        description: 'Use natural language to create Power Apps.',
        scenario: 'You need a "Vehicle Inspection" app. Instead of dragging controls manually, you will ask Copilot to build it.',
        estimatedTime: 30,
        difficulty: 'beginner',
        objectives: ['Prompt Copilot', 'Refine App Structure', 'Publish'],
        prerequisites: ['Power Apps Environment'],
        introduction: {
            overview: 'Copilot in Power Apps allows you to build apps by describing them in plain English.',
            scenario: 'You will type "Create an app to track vehicle inspections with photos and status" and let AI do the work.',
            architecture: 'Maker Portal → Copilot → Dataverse & App'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Generate App',
            description: 'Natural language creation.',
            instructions: [
                { step: 1, action: 'Go to **make.powerapps.com**' },
                { step: 2, action: 'In the center box, type: "Create an app to manage vehicle inspections including VIN, Make, Model, and Inspection Status."' },
                { step: 3, action: 'Click **Go**' },
                { step: 4, action: 'Review the proposed Dataverse table' },
                { step: 5, action: 'Click **Create app**' }
            ],
            verification: {
                type: 'manual',
                description: 'Test App',
                expectedResult: 'App is generated with a list screen and a form screen. You can add a record immediately.'
            }
        }],
        summary: {
            whatYouLearned: ['Copilot for Makers', 'AI-assisted Development'],
            nextSteps: ['Add Copilot control to app', 'Automate with flow'],
            additionalResources: [{ title: 'Copilot in Power Apps', url: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/ai-overview', type: 'documentation' }]
        }
    },

    /**
    * SC-200-THREAT-HUNTING: Microsoft Security Operations Analyst - Threat Hunting
    */
    'sc-200-threat-hunting': {
        id: 'sc-200-threat-hunting-lab-1',
        courseId: 'sc-200-threat-hunting',
        title: 'Hunt Threats with Sentinel',
        description: 'Use KQL to search for malicious activity.',
        scenario: 'You suspect a password spray attack. You need to query the sign-in logs in Microsoft Sentinel.',
        estimatedTime: 60,
        difficulty: 'advanced',
        objectives: ['Connect Data Sources', 'Write KQL Query', 'Create Analytics Rule'],
        prerequisites: ['Azure Sentinel Workspace'],
        introduction: {
            overview: 'Microsoft Sentinel is a cloud-native SIEM/SOAR solution.',
            scenario: 'You will query the `SigninLogs` table to find users with multiple failed attempts.',
            architecture: 'Log Analytics → Sentinel → KQL'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Execute KQL Search',
            description: 'Query logs.',
            instructions: [
                { step: 1, action: 'Open **Microsoft Sentinel**' },
                { step: 2, action: 'Click **Logs**' },
                { step: 3, action: 'Enter Query: `SigninLogs | where ResultType != 0 | summarize count() by UserPrincipalName | where count_ > 5`' },
                { step: 4, action: 'Click **Run**' }
            ],
            codeSnippets: [{ language: 'kusto', code: 'SigninLogs\n| where TimeGenerated > ago(24h)\n| where ResultType != 0\n| summarize FailureCount = count() by IPAddress, UserPrincipalName\n| where FailureCount > 10', description: 'Detect Brute Force' }],
            verification: {
                type: 'manual',
                description: 'Example Results',
                expectedResult: 'Table shows list of users with high failure counts.'
            }
        }],
        summary: {
            whatYouLearned: ['KQL', 'Sentinel Logs', 'Threat Hunting'],
            nextSteps: ['Configure Playbooks', 'Automate Response'],
            additionalResources: [{ title: 'KQL Reference', url: 'https://learn.microsoft.com/azure/data-explorer/kusto/query/', type: 'documentation' }]
        }
    },

    /**
    * DP-3020: Develop data-driven applications with Azure SQL Database
    */
    'dp-3020': {
        id: 'dp-3020-lab-1',
        courseId: 'dp-3020',
        title: 'Build App with Azure SQL',
        description: 'Connect a web app to Azure SQL.',
        scenario: 'You are building a Todo app. You need to provision a database and connect your .NET app to it.',
        estimatedTime: 45,
        difficulty: 'intermediate',
        objectives: ['Create Azure SQL Database', 'Configure Firewall', 'Connect Connection String'],
        prerequisites: ['Azure Subscription', 'Visual Studio'],
        introduction: {
            overview: 'Azure SQL Database is a fully managed PaaS database engine.',
            scenario: 'You will deploy a serverless SQL database and connect a local application.',
            architecture: 'Web App → ADO.NET → Azure SQL'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Provision Database',
            description: 'Create resource.',
            instructions: [
                { step: 1, action: 'In Azure Portal, **Create a resource** > **SQL Database**' },
                { step: 2, action: 'Server: **Create new** (Use SQL Authentication)' },
                { step: 3, action: 'Compute tier: **Serverless**' },
                { step: 4, action: 'Create' },
                { step: 5, action: 'Go to resource > **Set server firewall** > **Add client IP**' }
            ],
            verification: {
                type: 'manual',
                description: 'Test Connection',
                expectedResult: 'Use SSMS or Azure Data Studio to connect to the new server URL.'
            }
        }],
        summary: {
            whatYouLearned: ['Azure SQL Provisioning', 'Firewall Rules', 'Connectivity'],
            nextSteps: ['Implement Entity Framework', 'Enable Geo-Replication'],
            additionalResources: [{ title: 'Azure SQL Dev', url: 'https://learn.microsoft.com/azure/azure-sql/database/design-first-database-tutorial', type: 'documentation' }]
        }
    },

    /**
    * SC-5004: Defend against cyberthreats with Microsoft Defender XDR
    */
    'sc-5004': {
        id: 'sc-5004-lab-1',
        courseId: 'sc-5004',
        title: 'Investigate Incidents in XDR',
        description: 'Use the unified security portal.',
        scenario: 'An incident named "Multi-stage attack involving Initial Access" has triggered. You need to investigate the timeline.',
        estimatedTime: 50,
        difficulty: 'intermediate',
        objectives: ['Navigate Defender Portal', 'Analyze Incident Graph', 'Perform Remediation'],
        prerequisites: ['Defender XDR Access'],
        introduction: {
            overview: 'Microsoft Defender XDR coordinates detection, prevention, investigation, and response across endpoints, identities, email, and applications.',
            scenario: 'You will trace an attack from a phishing email (Defender for Office) to malware execution (Defender for Endpoint).',
            architecture: 'security.microsoft.com → Incidents'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Analyze Incident',
            description: 'Review the attack story.',
            instructions: [
                { step: 1, action: 'Go to **security.microsoft.com**' },
                { step: 2, action: 'Click **Incidents & alerts** > **Incidents**' },
                { step: 3, action: 'Select the high severity incident' },
                { step: 4, action: 'Review the **Attack story** tab to see the process tree' },
                { step: 5, action: 'Click **Manage incident** > **Assign to me**' }
            ],
            verification: {
                type: 'manual',
                description: 'Resolve',
                expectedResult: 'Identify the "Patient Zero" user and isolate their device.'
            }
        }],
        summary: {
            whatYouLearned: ['XDR Investigation', 'Incident Management', 'Cross-domain hunting'],
            nextSteps: ['Configure Auto-healing', 'Run Attack Simulator'],
            additionalResources: [{ title: 'Defender XDR', url: 'https://learn.microsoft.com/microsoft-365/security/defender/microsoft-365-defender', type: 'documentation' }]
        }
    },
    /**
    * MB-7005: Create and manage journeys with Dynamics 365 Customer Insights
    */
    'mb-7005': {
        id: 'mb-7005-lab-1',
        courseId: 'mb-7005',
        title: 'Design Real-time Journeys',
        description: 'Create customer journeys responding to real-time events.',
        scenario: 'You need to set up a welcome journey for new loyalty members that sends an email immediately after signup.',
        estimatedTime: 40,
        difficulty: 'intermediate',
        objectives: ['Create a Trigger', 'Design a Journey', 'Add Email Channel'],
        prerequisites: ['D365 Customer Insights - Journeys'],
        introduction: {
            overview: 'Real-time journeys allow you to engage customers at the moment of interaction.',
            scenario: 'You will configure a "New Member" trigger and build a pipeline that sends a personalized email.',
            architecture: 'D365 Marketing → Real-time Marketing → Journey'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Build Journey',
            description: 'Configure the orchestration.',
            instructions: [
                { step: 1, action: 'Open **Customer Insights - Journeys** app' },
                { step: 2, action: 'Go to **Engagement** > **Journeys**' },
                { step: 3, action: 'Click **+ New journey**' },
                { step: 4, action: 'Type: **Trigger-based**' },
                { step: 5, action: 'Trigger: **Marketing Form Submitted**' },
                { step: 6, action: 'Add step: **Send an email** (Select "Welcome Member" template)' },
                { step: 7, action: 'Publish' }
            ],
            verification: {
                type: 'manual',
                description: 'Test Run',
                expectedResult: 'Submit the form as a test user. Verify email is received immediately.'
            }
        }],
        summary: {
            whatYouLearned: ['Real-time Journeys', 'Event Triggers', 'Customer Engagement'],
            nextSteps: ['Add SMS Channel', 'Create A/B Test'],
            additionalResources: [{ title: 'D365 Journeys', url: 'https://learn.microsoft.com/dynamics365/customer-insights/journeys/real-time-marketing-user-guide', type: 'documentation' }]
        }
    },

    /**
    * MB-7006: Create and manage segments in Dynamics 365 Customer Insights – Data
    */
    'mb-7006': {
        id: 'mb-7006-lab-1',
        courseId: 'mb-7006',
        title: 'Build Complex Segments',
        description: 'Segment customers based on behavioral and demographic data.',
        scenario: 'You want to target customers who live in "Seattle" and have purchased over $500 in the last year.',
        estimatedTime: 35,
        difficulty: 'intermediate',
        objectives: ['Unify Data', 'Create Segment', 'Export to Marketing'],
        prerequisites: ['D365 Customer Insights - Data'],
        introduction: {
            overview: 'Customer Insights - Data allows you to unify data from multiple sources to create a 360-degree view.',
            scenario: 'You will use the Segment Builder to define a high-value local customer group.',
            architecture: 'CI Data → Segments → CI Journeys'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Define Segment',
            description: 'Use logical operators.',
            instructions: [
                { step: 1, action: 'Open **Customer Insights - Data**' },
                { step: 2, action: 'Go to **Segments** > **New** > **Build your own**' },
                { step: 3, action: 'Select **Unified Customer** profile' },
                { step: 4, action: 'Rule 1: `City` equals "Seattle"' },
                { step: 5, action: 'Rule 2 (AND): `TotalSpend` greater than 500' },
                { step: 6, action: 'Run the segment' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Members',
                expectedResult: 'Segment status becomes "Successful". Member count > 0.'
            }
        }],
        summary: {
            whatYouLearned: ['Segmentation', 'Data Unification', 'Insight Generation'],
            nextSteps: ['Create Measures', 'Configure Predictions'],
            additionalResources: [{ title: 'CI Segments', url: 'https://learn.microsoft.com/dynamics365/customer-insights/data/segments', type: 'documentation' }]
        }
    },

    /**
    * MB-280T01: Dynamics 365 Customer Experience Analyst
    */
    'mb-280t01': {
        id: 'mb-280-lab-1',
        courseId: 'mb-280t01',
        title: 'Analyze Customer Feedback',
        description: 'Use Customer Voice and Power BI to analyze sentiment.',
        scenario: 'Your company has received survey responses. You need to identify key drivers of dissatisfaction.',
        estimatedTime: 45,
        difficulty: 'advanced',
        objectives: ['Connect Customer Voice', 'Analyze Sentiment', 'Create Dashboard'],
        prerequisites: ['D365 Customer Voice', 'Power BI'],
        introduction: {
            overview: 'The Customer Experience Analyst role bridges the gap between feedback collection and actionable insights.',
            scenario: 'You will review a "Support Satisfaction" survey and analyze the Net Promoter Score (NPS).',
            architecture: 'Customer Voice → Dataverse → Power BI'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Review Metrics',
            description: 'Check survey performance.',
            instructions: [
                { step: 1, action: 'Open **Dynamics 365 Customer Voice**' },
                { step: 2, action: 'Open project **Support Survey**' },
                { step: 3, action: 'Naviagte to **Reports** > **Satisfaction metrics**' },
                { step: 4, action: 'Review the **NPS** trend line' },
                { step: 5, action: 'Drill down into "Detractors" comments' }
            ],
            verification: {
                type: 'manual',
                description: 'Identify Issue',
                expectedResult: 'Find that "Wait Time" is the top complaint.'
            }
        }],
        summary: {
            whatYouLearned: ['Customer Voice', 'NPS Analysis', 'Experience Management'],
            nextSteps: ['Set up Follow-up Alerts', 'Integrate with CI Data'],
            additionalResources: [{ title: 'Customer Voice', url: 'https://learn.microsoft.com/dynamics365/customer-voice/about', type: 'documentation' }]
        }
    },

    /**
    * AI-3025: Work Smarter with AI
    */
    'ai-3025': {
        id: 'ai-3025-lab-1',
        courseId: 'ai-3025',
        title: 'Prompt Engineering Basics',
        description: 'Learn fundamental prompting techniques.',
        scenario: 'You want to improve how you interact with LLMs to get better report summaries and code explanations.',
        estimatedTime: 20,
        difficulty: 'beginner',
        objectives: ['Zero-shot Prompting', 'Few-shot Prompting', 'Chain of Thought'],
        prerequisites: ['Copilot or OpenAI Access'],
        introduction: {
            overview: 'Working smarter with AI means knowing how to ask the right questions.',
            scenario: 'You will iterate on a prompt to summarize a complex financial text.',
            architecture: 'User → Prompt → LLM → Response'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Iterate Prompts',
            description: 'Refine your request.',
            instructions: [
                { step: 1, action: 'Open **Copilot**' },
                { step: 2, action: 'Try: "Summarize this." (Paste text)' },
                { step: 3, action: 'Try: "Summarize this in 3 bullets, focusing on risks." (Paste text)' },
                { step: 4, action: 'Try: "Act as a Risk Analyst. Analyze the text and propose mitigations."' }
            ],
            verification: {
                type: 'manual',
                description: 'Compare Results',
                expectedResult: 'Observe how role-playing and constraints improve specificity.'
            }
        }],
        summary: {
            whatYouLearned: ['Prompting Strategies', 'Context Setting', 'AI Interaction'],
            nextSteps: ['Build a System Prompt', 'Save Prompt Library'],
            additionalResources: [{ title: 'Prompt Engineering', url: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/prompt-engineering', type: 'documentation' }]
        }
    },

    /**
    * AZ-2008: DevOps Foundations: The Core Principles and Practices
    */
    'az-2008': {
        id: 'az-2008-lab-1',
        courseId: 'az-2008',
        title: 'Implement Git Workflow',
        description: 'Practice branching and merging.',
        scenario: 'You are part of a team. You need to create a feature branch, make changes, and open a Pull Request.',
        estimatedTime: 30,
        difficulty: 'beginner',
        objectives: ['Clone Repo', 'Create Branch', 'Pull Request'],
        prerequisites: ['Azure DevOps / GitHub'],
        introduction: {
            overview: 'Version control is the foundation of DevOps.',
            scenario: 'You will fix a "bug" in a web app using a standard Git flow.',
            architecture: 'Local Git → Remote Repo → PR Review'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Git Cycle',
            description: 'Code change.',
            instructions: [
                { step: 1, action: 'Clone repository: `git clone <url>`' },
                { step: 2, action: 'Create branch: `git checkout -b fix-header`' },
                { step: 3, action: 'Edit `index.html` to change title' },
                { step: 4, action: '`git commit -am "Fixed header"`' },
                { step: 5, action: '`git push origin fix-header`' },
                { step: 6, action: 'Create Pull Request in UI' }
            ],
            verification: {
                type: 'manual',
                description: 'View PR',
                expectedResult: 'PR is visible in the portal with the diff showing.'
            }
        }],
        summary: {
            whatYouLearned: ['Git', 'Branching Strategy', 'Pull Requests'],
            nextSteps: ['Configure Branch Policies', 'Set up CI Trigger'],
            additionalResources: [{ title: 'Azure Repos', url: 'https://learn.microsoft.com/azure/devops/repos/get-started/what-is-repos', type: 'documentation' }]
        }
    },

    /**
    * MS-4002: Prepare security and compliance to support Microsoft 365 Copilot
    */
    'ms-4002': {
        id: 'ms-4002-lab-1',
        courseId: 'ms-4002',
        title: 'Review Oversharing Risks',
        description: 'Audit SharePoint sites for public access.',
        scenario: 'Before deploying Copilot, you must ensure it cannot access sensitive data that is accidentally public.',
        estimatedTime: 45,
        difficulty: 'intermediate',
        objectives: ['Run SharePoint Admin Report', 'Configure Sensitivity Labels', 'Restrict Search'],
        prerequisites: ['SharePoint Admin', 'Purview Admin'],
        introduction: {
            overview: 'Copilot only sees what the user sees. If a user has access to too much, Copilot exposes that risk.',
            scenario: 'You will identify "Public" sites that should be "Private".',
            architecture: 'SharePoint → Search Index → Copilot'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Audit Access',
            description: 'Check site settings.',
            instructions: [
                { step: 1, action: 'Open **SharePoint Admin Center**' },
                { step: 2, action: 'Go to **Sites** > **Active sites**' },
                { step: 3, action: 'Filter by **Sharing** status' },
                { step: 4, action: 'Select "Finance Team" site' },
                { step: 5, action: 'Change sharing from "Anyone" to "Only people in your organization" or "Private"' }
            ],
            verification: {
                type: 'manual',
                description: 'Verify Change',
                expectedResult: 'Sharing capability status updates to "Internal only".'
            }
        }],
        summary: {
            whatYouLearned: ['Data Governance', 'SharePoint Sharing', 'Copilot Readiness'],
            nextSteps: ['Run Semantic Index', 'Deploy DLP Policies'],
            additionalResources: [{ title: 'Copilot Security', url: 'https://learn.microsoft.com/microsoft-365/copilot/microsoft-365-copilot-privacy', type: 'documentation' }]
        }
    },

    /**
    * AI-3022: Implement AI Skills in Azure AI Search
    */
    'ai-3022': {
        id: 'ai-3022-lab-1',
        courseId: 'ai-3022',
        title: 'Build a Knowledge Mining Solution',
        description: 'Use AI Search to index documents.',
        scenario: 'You have thousands of PDFs. You need to make them searchable and extract key phrases.',
        estimatedTime: 50,
        difficulty: 'intermediate',
        objectives: ['Create Search Service', 'Import Data', 'Add AI Skillset'],
        prerequisites: ['Azure Subscription', 'Storage Account'],
        introduction: {
            overview: 'Azure AI Search (formerly Cognitive Search) uses AI to understand content.',
            scenario: 'You will index a blob container and use the "Key Phrase Extraction" skill.',
            architecture: 'Blob Storage → AI Search Indexer → Search Index'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Run Import Wizard',
            description: 'Configure indexing.',
            instructions: [
                { step: 1, action: 'Go to **Azure AI Search** resource' },
                { step: 2, action: 'Click **Import data**' },
                { step: 3, action: 'Source: **Azure Blob Storage** (Select your container)' },
                { step: 4, action: 'Next: **Add cognitive skills**' },
                { step: 5, action: 'Enable **Extract key phrases** and **Detect language**' },
                { step: 6, action: 'Submit to create indexer' }
            ],
            verification: {
                type: 'manual',
                description: 'Query Index',
                expectedResult: 'Use Search Explorer to search `*`. JSON results include a `keyPhrases` array.'
            }
        }],
        summary: {
            whatYouLearned: ['Azure AI Search', 'Skillsets', 'Document Cracking'],
            nextSteps: ['Add Custom Skill (Azure Function)', 'Create Knowledge Store'],
            additionalResources: [{ title: 'AI Search', url: 'https://learn.microsoft.com/azure/search/search-what-is-azure-search', type: 'documentation' }]
        }
    },

    /**
    * AZ-2006: Automate Azure Load Testing by using GitHub Actions
    */
    'az-2006': {
        id: 'az-2006-lab-1',
        courseId: 'az-2006',
        title: 'Load Test Web App',
        description: 'Find performance bottlenecks.',
        scenario: 'You need to verify if your web app can handle 500 simultaneous users before Black Friday.',
        estimatedTime: 40,
        difficulty: 'intermediate',
        objectives: ['Create Load Test Resource', 'Define JMeter Script', 'Run Test'],
        prerequisites: ['Azure Load Testing Resource'],
        introduction: {
            overview: 'Azure Load Testing allows you to generate high-scale load.',
            scenario: 'You will perform a quick test against a URL without needing a JMeter script.',
            architecture: 'Load Engine → Web App → Metrics'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Configure Load',
            description: 'Set parameters.',
            instructions: [
                { step: 1, action: 'Go to **Azure Load Testing** resource' },
                { step: 2, action: 'Click **Create** > **URL-based test**' },
                { step: 3, action: 'Target URL: `https://your-web-app.azurewebsites.net`' },
                { step: 4, action: 'Virtual users: **50**' },
                { step: 5, action: 'Test duration: **120 seconds**' },
                { step: 6, action: 'Run test' }
            ],
            verification: {
                type: 'manual',
                description: 'Analyze Dashboard',
                expectedResult: 'Dashboard shows Response Time and Throughput graphs. Check for errors.'
            }
        }],
        summary: {
            whatYouLearned: ['Performance Testing', 'Scalability', 'Azure Load Testing'],
            nextSteps: ['Integrate into CI/CD', 'Analyze Server-side metrics'],
            additionalResources: [{ title: 'Azure Load Testing', url: 'https://learn.microsoft.com/azure/load-testing/overview-what-is-azure-load-testing', type: 'documentation' }]
        }
    },

    /**
    * MB-280T04: Configure a Dynamics 365 customer experience solution
    */
    'mb-280t04': {
        id: 'mb-280-04-lab-1',
        courseId: 'mb-280t04',
        title: 'Configure Omnichannel',
        description: 'Set up chat and voice channels.',
        scenario: 'You need to enable a "Live Chat" widget for the customer portal.',
        estimatedTime: 50,
        difficulty: 'intermediate',
        objectives: ['Create Workstream', 'Configure Chat Widget', 'Define Routing Rules'],
        prerequisites: ['D365 Omnichannel Admin'],
        introduction: {
            overview: 'Omnichannel associated with Customer Service allows instant connection.',
            scenario: 'You will create a chat channel that routes to the "Support Queue".',
            architecture: 'Portal → Chat Widget → Omnichannel → Agent'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Set up Chat',
            description: 'Admin configuration.',
            instructions: [
                { step: 1, action: 'Open **Customer Service Admin Center**' },
                { step: 2, action: 'Go to **Channels** > **Chat**' },
                { step: 3, action: 'Click **Manage**' },
                { step: 4, action: 'Create new Workstream: **Porta Chat**' },
                { step: 5, action: 'Copy the Script Snippet' }
            ],
            verification: {
                type: 'manual',
                description: 'Embed',
                expectedResult: 'Paste snippet into an HTML file. Open file. Chat widget appears.'
            }
        }],
        summary: {
            whatYouLearned: ['Omnichannel', 'Digital Messaging', 'Unified Routing'],
            nextSteps: ['Configure Bot Handoff', 'Set up Voice Channel'],
            additionalResources: [{ title: 'Omnichannel Guide', url: 'https://learn.microsoft.com/dynamics365/customer-service/implement/omnichannel-provision-license', type: 'documentation' }]
        }
    },

    /**
    * MB-280T03: Design and deliver powerful customer experiences
    */
    'mb-280t03': {
        id: 'mb-280-03-lab-1',
        courseId: 'mb-280t03',
        title: 'Personalize Experiences',
        description: 'Use personalization tokens in marketing.',
        scenario: 'You are sending a newsletter and want to greet the user by name and reference their last purchase.',
        estimatedTime: 30,
        difficulty: 'intermediate',
        objectives: ['Create Dynamic Content', 'Use Liquid Template', 'Test Send'],
        prerequisites: ['D365 Marketing'],
        introduction: {
            overview: 'Personalization increases engagement rates significantly.',
            scenario: 'You will edit an email template to inject dynamic data from the Contact record.',
            architecture: 'Marketing Email → Dynamic Data'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Edit Content',
            description: 'Insert data fields.',
            instructions: [
                { step: 1, action: 'Open **Real-time Marketing** > **Emails**' },
                { step: 2, action: 'Select an email design' },
                { step: 3, action: 'Click text block > **Personalize**' },
                { step: 4, action: 'Select Field: **First Name**' },
                { step: 5, action: 'Add conditional logic (if/else) for membership level' }
            ],
            verification: {
                type: 'manual',
                description: 'Preview',
                expectedResult: ' Preview as "John Doe". Text reads "Hi John".'
            }
        }],
        summary: {
            whatYouLearned: ['Dynamic Content', 'Personalization', 'Conditional Logic'],
            nextSteps: ['Create Brand Profiles', 'Manage Consent'],
            additionalResources: [{ title: 'Personalization', url: 'https://learn.microsoft.com/dynamics365/customer-insights/journeys/personalize-content', type: 'documentation' }]
        }
    },

    /**
    * MB-280T02: Empower sellers with Dynamics 365 Sales and Microsoft 365 Copilot for Sales
    */
    'mb-280t02': {
        id: 'mb-280-02-lab-1',
        courseId: 'mb-280t02',
        title: 'Copilot for Sales in Outlook',
        description: 'Streamline sales tasks within email.',
        scenario: 'A customer asks for a quote. You want to save the email to Dynamics and draft a reply using AI.',
        estimatedTime: 30,
        difficulty: 'intermediate',
        objectives: ['Connect Outlook to CRM', 'Save Email', 'Generate Reply'],
        prerequisites: ['Copilot for Sales', 'Dynamics 365 Sales'],
        introduction: {
            overview: 'Copilot for Sales integrates CRM data directly into M365 apps.',
            scenario: 'You will use the sidecar pane in Outlook to view Opportunity details and draft a reply.',
            architecture: 'Outlook → Copilot → D365 Sales'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Manage Sales',
            description: 'Use the add-in.',
            instructions: [
                { step: 1, action: 'Open **Outlook Web**' },
                { step: 2, action: 'Open an email from a customer' },
                { step: 3, action: 'Open **Copilot for Sales** pane' },
                { step: 4, action: 'Click **Save to Dynamics 365**' },
                { step: 5, action: 'Use "Draft with Copilot" > "Reply to inquiry"' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Draft',
                expectedResult: 'Copilot proposes a professional email contextually relevant to the thread and CRM data.'
            }
        }],
        summary: {
            whatYouLearned: ['Copilot for Sales', 'Sales Productivity', 'Outlook Integration'],
            nextSteps: ['Customize Copilot Forms', 'Collaborate in Teams'],
            additionalResources: [{ title: 'Copilot for Sales', url: 'https://learn.microsoft.com/microsoft-sales-copilot/introduction-sales-copilot', type: 'documentation' }]
        }
    },

    /**
     * MB-280T01-CONFIG: Configure Dynamics 365 customer experience model-driven apps
     */
    'mb-280t01-config': {
        id: 'mb-280-config-lab-1',
        courseId: 'mb-280t01-config',
        title: 'Customize Model-Driven Apps',
        description: 'Modify forms and views.',
        scenario: 'Salespeople need a "High Priority" view for Opportunities and a simplified form.',
        estimatedTime: 45,
        difficulty: 'intermediate',
        objectives: ['Create System View', 'Edit Main Form', 'Publish App'],
        prerequisites: ['Power Apps Maker Portal'],
        introduction: {
            overview: 'Model-driven apps are data-first. Customizing them improves user efficiency.',
            scenario: 'You will use the App Designer to tailor the Sales Hub experience.',
            architecture: 'Dataverse → Forms/Views → Model-driven App'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Customize View',
            description: 'Filter data.',
            instructions: [
                { step: 1, action: 'Open **make.powerapps.com**' },
                { step: 2, action: 'Go to **Tables** > **Opportunity**' },
                { step: 3, action: 'Click **Views** > **New view**' },
                { step: 4, action: 'Name: **High Value Opps**' },
                { step: 5, action: 'Filter: `Estimated Revenue` > 10000' },
                { step: 6, action: 'Publish' }
            ],
            verification: {
                type: 'manual',
                description: 'Check App',
                expectedResult: 'Open Sales Hub. Select "High Value Opps" view. Only large deals appear.'
            }
        }],
        summary: {
            whatYouLearned: ['Model-driven Apps', 'View Designer', 'Form Editor'],
            nextSteps: ['Configure Business Rules', 'Add Command Bar Buttons'],
            additionalResources: [{ title: 'Model-driven Apps', url: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/model-driven-app-overview', type: 'documentation' }]
        }
    },

    /**
     * DP-3021: Migrate to and configure Azure Database for PostgreSQL
     */
    'dp-3021': {
        id: 'dp-3021-lab-1',
        courseId: 'dp-3021',
        title: 'Migrate Postgres to Azure',
        description: 'Lift and shift a database.',
        scenario: 'You have an on-prem PostgreSQL DB. You need to migrate it to Azure Database for PostgreSQL Flexible Server.',
        estimatedTime: 60,
        difficulty: 'advanced',
        objectives: ['Provision Flexible Server', 'Use pg_dump/pg_restore', 'Configure Parameters'],
        prerequisites: ['Azure CLI', 'PostgreSQL Tools'],
        introduction: {
            overview: 'Azure Database for PostgreSQL Flexible Server offers maximum control and flexibility.',
            scenario: 'You will perform an offline migration using standard community tools.',
            architecture: 'On-prem DB → pg_dump → Azure Storage → pg_restore → Azure DB'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Perform Migration',
            description: 'Move data.',
            instructions: [
                { step: 1, action: 'Create **Azure Database for PostgreSQL - Flexible Server**' },
                { step: 2, action: 'Allow public access (for lab only)' },
                { step: 3, action: 'Run `pg_dump -h localhost -U postgres -d sourcesdb -f dump.sql`' },
                { step: 4, action: 'Run `psql -h my-azure-server.postgres.database.azure.com -U admin -d targetdb -f dump.sql`' }
            ],
            verification: {
                type: 'manual',
                description: 'Verify Data',
                expectedResult: 'Connect to Azure DB. Run `SELECT count(*) FROM users`. Matches source.'
            }
        }],
        summary: {
            whatYouLearned: ['PostgreSQL Migration', 'Azure Flexible Server', 'Database Tuning'],
            nextSteps: ['Set up Read Replicas', 'Configure VNET Integration'],
            additionalResources: [{ title: 'Azure PostgreSQL', url: 'https://learn.microsoft.com/azure/postgresql/flexible-server/overview', type: 'documentation' }]
        }
    },

    /**
     * AZ-1010: Deploy and manage Azure Arc-enabled Servers
     */
    'az-1010': {
        id: 'az-1010-lab-1',
        courseId: 'az-1010',
        title: 'Onboard Server to Azure Arc',
        description: 'Manage non-Azure servers.',
        scenario: 'You have a server in a branch office. You want to manage it using Azure Policy and Log Analytics.',
        estimatedTime: 45,
        difficulty: 'intermediate',
        objectives: ['Generate Onboarding Script', 'Install Agent', 'Verify Connectivity'],
        prerequisites: ['Windows/Linux Server (Hyper-V/VMware)'],
        introduction: {
            overview: 'Azure Arc extends the Azure control plane to on-premises and multi-cloud environments.',
            scenario: 'You will run a PowerShell script on a local VM to connect it to Azure.',
            architecture: 'Hybrid Server → Connected Machine Agent → Azure Arc'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Install Agent',
            description: 'Connect machine.',
            instructions: [
                { step: 1, action: 'In Azure Portal, searching **Servers - Azure Arc**' },
                { step: 2, action: 'Click **Add** > **Generate script**' },
                { step: 3, action: 'Select Resource Group and Region' },
                { step: 4, action: 'Copy script' },
                { step: 5, action: 'Run script on the target local server' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Status',
                expectedResult: 'Server appears in Azure Portal with "Connected" status.'
            }
        }],
        summary: {
            whatYouLearned: ['Azure Arc', 'Hybrid Management', 'Connected Machine Agent'],
            nextSteps: ['Apply Azure Policy', 'Enable VM Insights'],
            additionalResources: [{ title: 'Azure Arc', url: 'https://learn.microsoft.com/azure/azure-arc/servers/overview', type: 'documentation' }]
        }
    },

    /**
     * AI-3019: Develop AI-powered solutions with Azure Database for PostgreSQL
     */
    'ai-3019': {
        id: 'ai-3019-lab-1',
        courseId: 'ai-3019',
        title: 'Vector Search in PostgreSQL',
        description: 'Build RAG apps with pgvector.',
        scenario: 'You want to store embeddings of product descriptions in PostgreSQL to enable semantic search.',
        estimatedTime: 50,
        difficulty: 'advanced',
        objectives: ['Enable pgvector extension', 'Generate Embeddings', 'Perform Cosine Similarity Search'],
        prerequisites: ['Azure OpenAI', 'Azure PostgreSQL Flexible Server'],
        introduction: {
            overview: 'The `pgvector` extension allows PostgreSQL to store and query vector embeddings.',
            scenario: 'You will create a table with a vector column and query it for "similar products".',
            architecture: 'App → OpenAI (Embedding) → PostgreSQL (Vector Store)'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Implement Search',
            description: 'SQL operations.',
            instructions: [
                { step: 1, action: 'Connect to Postgres DB' },
                { step: 2, action: 'Run: `CREATE EXTENSION vector;`' },
                { step: 3, action: 'Run: `CREATE TABLE items (id bigserial PRIMARY KEY, embedding vector(1536));`' },
                { step: 4, action: 'Insert vectors (mock data)' },
                { step: 5, action: 'Query: `SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5;`' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Results',
                expectedResult: 'Query returns rows that are mathematically closest to the input vector.'
            }
        }],
        summary: {
            whatYouLearned: ['pgvector', 'Semantic Search', 'RAG Pattern'],
            nextSteps: ['Integrate with LangChain', 'Optimize Indexing (HNSW)'],
            additionalResources: [{ title: 'pgvector on Azure', url: 'https://learn.microsoft.com/azure/postgresql/flexible-server/how-to-use-pgvector', type: 'documentation' }]
        }
    },

    /**
     * AZ-1007: Deploy and administer Linux virtual machines on Azure
     */
    'az-1007': {
        id: 'az-1007-lab-1',
        courseId: 'az-1007',
        title: 'Manage Linux VMs',
        description: 'SSH, Disk management, and Updates.',
        scenario: 'You need to resize a disk and configure SSH key access for a web server.',
        estimatedTime: 40,
        difficulty: 'intermediate',
        objectives: ['Create Linux VM', 'Resize Disk', 'Configure NSG'],
        prerequisites: ['Azure CLI'],
        introduction: {
            overview: 'Linux is a first-class citizen on Azure.',
            scenario: 'You will deploy an Ubuntu VM, expand its OS disk, and secure SSH access.',
            architecture: 'Linux VM → Managed Disk → VNET'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Admin Tasks',
            description: 'CLI operations.',
            instructions: [
                { step: 1, action: '`az vm create -n MyLinuxVM -g MyRG --image Ubuntu2204`' },
                { step: 2, action: '`az vm disk update --size-gb 64 ...`' },
                { step: 3, action: 'SSH into VM' },
                { step: 4, action: 'Run `lsblk` to verify disk size' }
            ],
            verification: {
                type: 'manual',
                description: 'Verify Capacity',
                expectedResult: 'Disk reflects new size (may need partition expansion).'
            }
        }],
        summary: {
            whatYouLearned: ['Linux on Azure', 'Azure CLI', 'Disk Management'],
            nextSteps: ['Configure cloud-init', 'Set up Azure Bastion'],
            additionalResources: [{ title: 'Linux VMs', url: 'https://learn.microsoft.com/azure/virtual-machines/linux/tutorial-manage-vm', type: 'documentation' }]
        }
    },

    /**
     * DP-300T00-A: Implement scalable database solutions using Azure SQL
     */
    'dp-300t00-a': {
        id: 'dp-300-lab-1',
        courseId: 'dp-300t00-a',
        title: 'Optimize Query Performance',
        description: 'Use Query Store and Intelligent Insights.',
        scenario: 'Users report slow performance. You need to identify the regressed query and force a better plan.',
        estimatedTime: 60,
        difficulty: 'advanced',
        objectives: ['Enable Query Store', 'Analyze High Resource Queries', 'Force Plan'],
        prerequisites: ['Azure SQL Database'],
        introduction: {
            overview: 'Azure SQL provides built-in tools to monitor and tune performance.',
            scenario: 'You will generate workload and use Query Store to fix a plan regression.',
            architecture: 'App → Azure SQL → Query Store'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Tune Database',
            description: 'Fix regression.',
            instructions: [
                { step: 1, action: 'Open SSMS and connect to DB' },
                { step: 2, action: 'Expand **Query Store** > **Top Resource Consuming Queries**' },
                { step: 3, action: 'Identify query with multiple plans' },
                { step: 4, action: 'Select the efficient plan' },
                { step: 5, action: 'Click **Force Plan**' }
            ],
            verification: {
                type: 'manual',
                description: 'Verify Performance',
                expectedResult: 'Query duration decreases significantly.'
            }
        }],
        summary: {
            whatYouLearned: ['Database Tuning', 'Query Store', 'Index Optimization'],
            nextSteps: ['Configure Automatic Tuning', 'Monitor Wait Stats'],
            additionalResources: [{ title: 'Query Store', url: 'https://learn.microsoft.com/azure/azure-sql/database/query-store-overview', type: 'documentation' }]
        }
    },

    /**
     * DP-420T00-A: Design and implement cloud-native applications with Microsoft Azure Cosmos DB
     */
    'dp-420t00-a': {
        id: 'dp-420-lab-1',
        courseId: 'dp-420t00-a',
        title: 'Global Distribution with Cosmos DB',
        description: 'Replicate data globally.',
        scenario: 'Your app is going global. You need to enable multi-region writes for low latency.',
        estimatedTime: 45,
        difficulty: 'advanced',
        objectives: ['Configure Replication', 'Test Failover', 'Understand Consistency Levels'],
        prerequisites: ['Cosmos DB Account'],
        introduction: {
            overview: 'Azure Cosmos DB is a fully managed NoSQL database for modern app development.',
            scenario: 'You will add a read region in "West Europe" and test the latency.',
            architecture: 'App → Cosmos DB (US) ↔ Cosmos DB (EU)'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Scale Globally',
            description: 'Add regions.',
            instructions: [
                { step: 1, action: 'Go to **Azure Cosmos DB** resource' },
                { step: 2, action: 'Click **Replicate data globally**' },
                { step: 3, action: 'Select **West Europe**' },
                { step: 4, action: 'Click **Save** (Wait for replication)' },
                { step: 5, action: 'Click **Manual Failover** to test' }
            ],
            verification: {
                type: 'manual',
                description: 'Check Status',
                expectedResult: 'Write region changes. App continues to function.'
            }
        }],
        summary: {
            whatYouLearned: ['Cosmos DB Replication', 'High Availability', 'Consistency'],
            nextSteps: ['Implement Change Feed', 'Optimize RUs'],
            additionalResources: [{ title: 'Cosmos DB Global Dist', url: 'https://learn.microsoft.com/azure/cosmos-db/distribute-data-globally', type: 'documentation' }]
        }
    },

    /**
     * MB-500T00-A: Microsoft Dynamics 365 Finance and Operations Apps Developer
     */
    'mb-500t00-a': {
        id: 'mb-500-lab-1',
        courseId: 'mb-500t00-a',
        title: 'Extend Finance and Operations',
        description: 'Develop X++ extensions.',
        scenario: 'You need to add a custom field to the "Customers" form.',
        estimatedTime: 90,
        difficulty: 'advanced',
        objectives: ['Create Visual Studio Project', 'Add Table Extension', 'Modify Form'],
        prerequisites: ['FnO VM', 'Visual Studio'],
        introduction: {
            overview: 'Developers use X++ to extend standard FnO functionality.',
            scenario: 'You will create a table extension for `CustTable` to add "LoyaltyDate".',
            architecture: 'Visual Studio → AOT → FnO Runtime'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Develop Extension',
            description: 'Write code.',
            instructions: [
                { step: 1, action: 'Open Visual Studio as Admin' },
                { step: 2, action: 'Create new **Finance Operations** project' },
                { step: 3, action: 'Find `CustTable` in Application Explorer' },
                { step: 4, action: 'Right-click > **Create extension**' },
                { step: 5, action: 'Add field: `LoyaltyDate` (Date)' },
                { step: 6, action: 'Build and Sync' }
            ],
            verification: {
                type: 'manual',
                description: 'Check UI',
                expectedResult: 'Open FnO Client. Go to All Customers. New field is visible (after form extension).'
            }
        }],
        summary: {
            whatYouLearned: ['X++ Development', 'Extensions', 'AOT'],
            nextSteps: ['Write Chain of Command', 'Create OData Entity'],
            additionalResources: [{ title: 'X++ Dev', url: 'https://learn.microsoft.com/dynamics365/fin-ops-core/dev-itpro/dev-tools/write-business-logic', type: 'documentation' }]
        }
    },

    /**
     * MB-800T00-A: Microsoft Dynamics 365 Business Central Functional Consultant
     */
    'mb-800t00-a': {
        id: 'mb-800-lab-1',
        courseId: 'mb-800t00-a',
        title: 'Configure Posting Groups',
        description: 'Set up financial links.',
        scenario: 'You are setting up a new company. You need to define how sales map to G/L accounts.',
        estimatedTime: 60,
        difficulty: 'intermediate',
        objectives: ['Define Gen. Bus. Posting Groups', 'Define Gen. Prod. Posting Groups', 'Map to G/L'],
        prerequisites: ['Business Central Environment'],
        introduction: {
            overview: 'Posting Groups are the glue between business transactions and the General Ledger.',
            scenario: 'You will configure the "Domestic" customer group to post to specific revenue accounts.',
            architecture: 'Sales Doc → Posting Group → G/L Entry'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Setup Mapping',
            description: 'Configure matrix.',
            instructions: [
                { step: 1, action: 'Search for **General Posting Setup**' },
                { step: 2, action: 'Click **New**' },
                { step: 3, action: 'Gen. Bus. Group: **DOMESTIC**' },
                { step: 4, action: 'Gen. Prod. Group: **RETAIL**' },
                { step: 5, action: 'Sales Account: **40100 (Sales - Retail)**' }
            ],
            verification: {
                type: 'manual',
                description: 'Post Invoice',
                expectedResult: 'Create Sales Invoice for Domestic/Retail. Post. Check G/L entries.'
            }
        }],
        summary: {
            whatYouLearned: ['Business Central Finance', 'Posting Setup', 'G/L Mapping'],
            nextSteps: ['Configure Dimensions', 'Set up VAT Posting'],
            additionalResources: [{ title: 'Posting Groups', url: 'https://learn.microsoft.com/dynamics365/business-central/finance-posting-groups', type: 'documentation' }]
        }
    },

    /**
     * AZ-700T00-A: Design and Implement Microsoft Azure Networking Solutions
     */
    'az-700t00-a': {
        id: 'az-700-lab-1',
        courseId: 'az-700t00-a',
        title: 'Connect VNETs with Peering',
        description: 'Enable cross-network communication.',
        scenario: 'You have a Hub-Spoke topology. You need to connect Spoke A to Hub.',
        estimatedTime: 40,
        difficulty: 'advanced',
        objectives: ['Create VNET Peering', 'Configure Gateway Transit', 'Verify Connectivity'],
        prerequisites: ['2 x Azure VNETs'],
        introduction: {
            overview: 'VNET Peering connects two virtual networks seamlessly.',
            scenario: 'You will peer "Hub-VNet" and "Spoke1-VNet" to allow VM-to-VM traffic.',
            architecture: 'VNet A <---> VNet B'
        },
        tasks: [{
            id: 'task-1',
            order: 1,
            title: 'Add Peering',
            description: 'Link networks.',
            instructions: [
                { step: 1, action: 'Go to **Hub-VNet**' },
                { step: 2, action: 'Click **Peerings** > **Add**' },
                { step: 3, action: 'Name: **Hub-to-Spoke1**' },
                { step: 4, action: 'Remote VNET: **Spoke1-VNet**' },
                { step: 5, action: 'Allow "Gateway Transit" (if applicable)' },
                { step: 6, action: 'Click **Add**' }
            ],
            verification: {
                type: 'manual',
                description: 'Ping Test',
                expectedResult: 'VM in Hub can ping VM in Spoke (private IP).'
            }
        }],
        summary: {
            whatYouLearned: ['Azure Networking', 'VNET Peering', 'Hub and Spoke'],
            nextSteps: ['Configure Azure Firewall', 'Set up VPN Gateway'],
            additionalResources: [{ title: 'VNET Peering', url: 'https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview', type: 'documentation' }]
        }
    },
};

export function getLabInstructions(courseId: string): LabInstruction | null {
    return LAB_INSTRUCTIONS[courseId] || null;
}
