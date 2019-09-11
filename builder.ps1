<#
README
	The purpose of this script is to build a standard Angular app then publish it on a server with SFTP.

DISCLAIMER
	The $PATH variable is really important, because the script firstly removes the remote folder with that name,
	so please don't feed it with ".", "*" or "", unless your server is entirely dedicated to the app.

REQUIREMENTS
	The script can require the execution of this command:
	Set-ExecutionPolicy RemoteSigned
	
	Also, it requires the module Posh-ssh:
	https://www.it-connect.fr/posh-ssh-connexion-ssh-depuis-powershell-sous-windows/
	
AUTHOR
	Nicolas Lethuillier
#>

# Project constants
$SFTP_HOST = 'sftp.sd6.gpaas.net'
$SFTP_USER = '46640'
$SFTP_PASSWORD = 'nlyugi1991'
$INITIAL_PATH = '/vhosts/www.louiecinephile.fr/htdocs'
$PATH = 'trips'

# SFTP Credential
$Password = ConvertTo-SecureString $SFTP_PASSWORD -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential ($SFTP_USER, $Password)

# Build Angular app (by default in /dist/$PATH)
ng build --baseHref="/$PATH/" --prod --build-optimizer=false

# Go at the built app root
cd "./dist"

# Establish the SFTP connection
$ThisSession = New-SFTPSession -ComputerName $SFTP_HOST -Credential $Credential

# Remove the existing folder on the server, then recreate it
if (Test-SFTPPath ($ThisSession).SessionId -Path "$INITIAL_PATH/$PATH") {
	Remove-SFTPItem ($ThisSession).SessionId -Path "$INITIAL_PATH/$PATH" -Force
}
New-SFTPItem ($ThisSession).SessionId -Path "$INITIAL_PATH/$PATH" -ItemType Directory

# Go to the newly created folder to fill it with the app files
Set-SFTPLocation ($ThisSession).SessionId -Path "$INITIAL_PATH/$PATH"

# Get all app files
$uploadFiles = Get-ChildItem "." -Recurse -Include "*" -Force
foreach ($item in $uploadFiles) {
	# Get the item's path without '.\' then change every \ in /
	$relativePath = ($item | Resolve-Path -Relative).substring(2).replace("\", "/")
	Write-Output "  $relativePath"
	
	if ($item -is [System.IO.DirectoryInfo]) {
		# If the item is a directory, create it
		New-SFTPItem ($ThisSession).SessionId -Path "$relativePath" -ItemType Directory
	} else {
		# If it's a file, well... create it too
		$remoteFolder = $relativePath.substring(0, [math]::max(0, $relativePath.indexOf($item.Name) - 1))
		if ($remoteFolder -eq "") {
			$remoteFolder = "."
		}
		Set-SFTPFile ($ThisSession).SessionId -RemotePath "$remoteFolder" -LocalFile "$relativePath"
	}
}

#Disconnect all SFTP Sessions
Get-SFTPSession | % { Remove-SFTPSession -SessionId ($_.SessionId) }