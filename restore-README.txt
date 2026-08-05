Finder cannot mark restore.command executable on an exFAT volume, so macOS may
refuse to run it. Copy it to your Mac and set the bit once:

    cp /Volumes/ASSISTANT/AssistantBackup/restore.command ~/restore.command
    chmod +x ~/restore.command
    ~/restore.command            # dry run - changes nothing
    ~/restore.command --run      # execute

If Gatekeeper blocks it: right-click in Finder > Open, or
    xattr -d com.apple.quarantine ~/restore.command
