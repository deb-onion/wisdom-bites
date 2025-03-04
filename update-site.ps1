#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Updates and deploys the Wisdom Bites Dental Clinic website with proper version management.

.DESCRIPTION
    This script automates the update and deployment process following semantic versioning principles.
    It updates version numbers, adds changes to changelog files, and deploys all tracked changes.

.PARAMETER Description
    A description of the changes made in this update.

.PARAMETER VersionType
    The type of version update: major, minor, patch, or auto.
    - major: Breaking changes (X.0.0)
    - minor: New features (X.Y.0)
    - patch: Bug fixes & small updates (X.Y.Z)
    - auto: Automatically determine based on description (default)

.EXAMPLE
    .\update-site.ps1 -Description "Fixed broken links in footer"
    Updates as patch version and deploys

.EXAMPLE
    .\update-site.ps1 -Description "Added new booking form feature" -VersionType "minor"
    Updates as minor version and deploys
#>

param(
    [Parameter(Mandatory=$true, HelpMessage="Description of the changes made")]
    [string]$Description,
    
    [Parameter(Mandatory=$false, HelpMessage="Type of version update")]
    [ValidateSet("major", "minor", "patch", "auto")]
    [string]$VersionType = "auto"
)

# Colors for console output
$colorSuccess = "Green"
$colorInfo = "Cyan"
$colorWarning = "Yellow"
$colorError = "Red"

# File paths
$versionFile = "version.json"
$changelogFile = "CHANGELOG.md"
$versionHistoryFile = "version_history.txt"
$mediaUpdatesLog = "media-updates.log"

# Function to output colored text
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Function to determine version type if auto is selected
function Get-VersionType {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    # Major version keywords
    if ($Description -match "BREAKING CHANGE|MAJOR|redesign|complete overhaul") {
        return "major"
    }
    
    # Minor version keywords
    if ($Description -match "feat|feature|add|new|enhance") {
        return "minor"
    }
    
    # Default to patch for fixes, updates, etc.
    return "patch"
}

# Function to read current version from version.json file
function Get-CurrentVersion {
    if (Test-Path $versionFile) {
        $versionData = Get-Content $versionFile | ConvertFrom-Json
        return $versionData.version
    } else {
        # If version file doesn't exist, create initial version
        $versionData = @{
            version = "1.0.0"
            lastUpdated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        $versionData | ConvertTo-Json | Set-Content $versionFile
        return $versionData.version
    }
}

# Function to update version number based on type
function Update-Version {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CurrentVersion,
        
        [Parameter(Mandatory=$true)]
        [string]$VersionType
    )
    
    $versionParts = $CurrentVersion -split "\."
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    switch ($VersionType) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
    }
    
    return "$major.$minor.$patch"
}

# Function to update version.json file
function Update-VersionFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$NewVersion
    )
    
    $versionData = @{
        version = $NewVersion
        lastUpdated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    $versionData | ConvertTo-Json | Set-Content $versionFile
}

# Function to update CHANGELOG.md
function Update-Changelog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$NewVersion,
        
        [Parameter(Mandatory=$true)]
        [string]$Description,
        
        [Parameter(Mandatory=$true)]
        [string]$VersionType
    )
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $changeType = switch ($VersionType) {
        "major" { "Major Update" }
        "minor" { "Feature Update" }
        "patch" { "Patch Update" }
    }
    
    # Read media updates if they exist
    $mediaChanges = ""
    if (Test-Path $mediaUpdatesLog) {
        $mediaUpdates = Get-Content $mediaUpdatesLog
        if ($mediaUpdates.Count -gt 0) {
            # Filter out any header lines and empty lines
            $relevantMediaUpdates = $mediaUpdates | Where-Object { $_ -match '^\[.*\]' } | Select-Object -First 10
            
            if ($relevantMediaUpdates.Count -gt 0) {
                $mediaChangesList = ($relevantMediaUpdates | ForEach-Object { "- $_" }) -join "`n"
                $mediaChanges = @"

### Media Updates:
$mediaChangesList
"@
                # If there are more updates than we're showing
                if ($relevantMediaUpdates.Count -lt ($mediaUpdates | Where-Object { $_ -match '^\[.*\]' }).Count) {
                    $mediaChanges += "`n- _(additional media updates omitted for brevity)_"
                }
            }
        }
    }
    
    $changelogEntry = @"
## [$NewVersion] - $date

### ${changeType}:
- $Description$mediaChanges

"@
    
    # Create changelog if it doesn't exist
    if (-not (Test-Path $changelogFile)) {
        @"
# Wisdom Bites Dental Clinic - Changelog

All notable changes to this website will be documented in this file.

$changelogEntry
"@ | Set-Content $changelogFile
    } else {
        $changelog = Get-Content $changelogFile
        $updatedChangelog = $changelog[0..1] + "" + $changelogEntry + $changelog[2..$changelog.Length]
        $updatedChangelog | Set-Content $changelogFile
    }
}

# Function to update version_history.txt
function Update-VersionHistory {
    param(
        [Parameter(Mandatory=$true)]
        [string]$NewVersion,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $entry = "v$NewVersion ($date): $Description"
    
    # Create file if it doesn't exist
    if (-not (Test-Path $versionHistoryFile)) {
        "# Wisdom Bites Dental Clinic - Version History" | Set-Content $versionHistoryFile
        "" | Add-Content $versionHistoryFile
    }
    
    # Add new entry
    $entry | Add-Content $versionHistoryFile
}

# Function to clear media updates log after deployment
function Clear-MediaUpdatesLog {
    if (Test-Path $mediaUpdatesLog) {
        # Create a single backup file that gets overwritten each time
        $logBackup = "media-updates.bak"
        if (Test-Path $logBackup) {
            Remove-Item $logBackup -Force
        }
        Copy-Item $mediaUpdatesLog $logBackup
        
        # Clear the log
        "# Media Asset Updates Log" | Set-Content $mediaUpdatesLog
        Write-ColorOutput "Media updates log cleared. Backup saved to $logBackup" $colorInfo
    }
}

# Function to deploy changes
function Deploy-Changes {
    param(
        [Parameter(Mandatory=$true)]
        [string]$NewVersion,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    # Clean up old backup files
    Write-ColorOutput "Cleaning up old backup files..." $colorInfo
    Get-ChildItem -Path "media-updates.*.bak" | Remove-Item -Force
    
    # Commit all changes
    Write-ColorOutput "Committing changes..." $colorInfo
    git add .
    git commit -m "v${NewVersion}: ${Description}"
    
    # Push to GitHub
    Write-ColorOutput "Pushing to GitHub..." $colorInfo
    git push
    
    # Clear media updates log after successful deployment
    Clear-MediaUpdatesLog
}

# Main execution starts here
Write-ColorOutput "Starting Wisdom Bites Dental Clinic website update..." $colorInfo

# Determine version type if auto is selected
if ($VersionType -eq "auto") {
    $VersionType = Get-VersionType -Description $Description
    Write-ColorOutput "Auto-detected version type: $VersionType" $colorInfo
}

# Get current version and calculate new version
$currentVersion = Get-CurrentVersion
$newVersion = Update-Version -CurrentVersion $currentVersion -VersionType $VersionType

Write-ColorOutput "Updating from v$currentVersion to v$newVersion" $colorInfo
Write-ColorOutput "Update description: $Description" $colorInfo

# Update version file
Update-VersionFile -NewVersion $newVersion

# Update changelog and version history
Update-Changelog -NewVersion $newVersion -Description $Description -VersionType $VersionType
Update-VersionHistory -NewVersion $newVersion -Description $Description

# Deploy changes
Deploy-Changes -NewVersion $newVersion -Description $Description

Write-ColorOutput "Website successfully updated to v$newVersion!" $colorSuccess 