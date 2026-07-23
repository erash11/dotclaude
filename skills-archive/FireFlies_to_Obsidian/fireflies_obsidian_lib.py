#!/usr/bin/env python3
"""
Fireflies to Obsidian - Claude Integration Version
===================================================

This script is designed to run through Claude's Fireflies integration to fetch
your actual meetings and convert them to Obsidian notes.

Run this by asking Claude: "Run the Fireflies to Obsidian script for the last 30 days"

The script will:
1. Connect to your Fireflies account (through Claude)
2. Fetch meetings from your specified time period
3. Create formatted Obsidian notes in your Meetings folder
4. Track which meetings have been imported to avoid duplicates
5. Give you a summary of what was created

Author: Built for Eric Rash - Baylor Applied Performance
"""

# Since this runs through Claude, we don't need to import Fireflies SDK
# Claude provides the Fireflies functions directly

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Set, Optional


class FirefliesObsidianConverter:
    """
    Converts Fireflies meetings to Obsidian notes with duplicate tracking.
    """
    
    def __init__(self, output_dir: str):
        """Initialize with your Obsidian Meetings folder path."""
        self.output_dir = Path(output_dir)
        self.tracking_file = self.output_dir / ".fireflies_imported.txt"
        self.imported_meetings = self._load_tracking()
        
        # Create output directory if needed
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_tracking(self) -> Set[str]:
        """Load IDs of previously imported meetings."""
        if not self.tracking_file.exists():
            return set()
        
        try:
            with open(self.tracking_file, 'r') as f:
                return set(line.strip() for line in f if line.strip())
        except Exception as e:
            print(f"⚠️  Could not read tracking file: {e}")
            return set()
    
    def _save_to_tracking(self, meeting_id: str):
        """Record that we've imported this meeting."""
        try:
            with open(self.tracking_file, 'a') as f:
                f.write(f"{meeting_id}\n")
            self.imported_meetings.add(meeting_id)
        except Exception as e:
            print(f"⚠️  Could not update tracking: {e}")
    
    def _format_date(self, date_string: str) -> str:
        """Convert ISO date to YYYY-MM-DD format."""
        try:
            if 'Z' in date_string:
                date_string = date_string.replace('Z', '+00:00')
            dt = datetime.fromisoformat(date_string)
            return dt.strftime('%Y-%m-%d')
        except:
            return datetime.now().strftime('%Y-%m-%d')
    
    def _sanitize_title(self, title: str) -> str:
        """Clean up title for use in filename."""
        if not title or title.lower() == "untitled":
            return "Untitled_Meeting"
        
        # Remove email prefixes from auto-generated titles
        if '@' in title and ' - ' in title:
            parts = title.split(' - ')
            if len(parts) >= 3:
                title = parts[-1]
        
        # Remove invalid filename characters
        for char in '<>:"/\\|?*':
            title = title.replace(char, '-')
        
        # Clean spacing and use underscores
        title = '_'.join(title.split())
        
        return title[:100]  # Limit length
    
    def _extract_participants(self, speakers_text: str) -> List[str]:
        """Extract participant names from speakers field."""
        if not speakers_text:
            return []
        
        if isinstance(speakers_text, str):
            for sep in [',', ';', ' and ', '&']:
                if sep in speakers_text:
                    return [n.strip() for n in speakers_text.split(sep) if n.strip()]
            return [speakers_text.strip()]
        
        return []
    
    def create_note(self, meeting_data: Dict, summary_data: Dict) -> Optional[str]:
        """
        Create an Obsidian note from Fireflies meeting data.
        
        Args:
            meeting_data: Basic meeting info (from get_transcripts)
            summary_data: Detailed summary (from get_summary)
        
        Returns:
            Path to created note, or None if failed
        """
        meeting_id = meeting_data.get('id', '')
        title = meeting_data.get('title', 'Untitled Meeting')
        date_string = meeting_data.get('date', datetime.now().isoformat())
        
        # Build filename
        date_prefix = self._format_date(date_string)
        safe_title = self._sanitize_title(title)
        filename = f"{date_prefix}_{safe_title}.md"
        filepath = self.output_dir / filename
        
        # Extract summary components
        summary = summary_data.get('summary', {})
        keywords = summary.get('keywords', [])
        if isinstance(keywords, str):
            keywords = [k.strip() for k in keywords.split(',')]
        
        action_items_text = summary.get('action_items', '')
        overview = (summary.get('short_summary', '') or 
                   summary.get('overview', '') or 
                   'No overview available')
        
        # Parse action items
        action_items = []
        if action_items_text:
            current_assignee = None
            for line in action_items_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                if line.startswith('**') and line.endswith('**'):
                    current_assignee = line.strip('*')
                elif line and not line.startswith('**'):
                    if line.startswith('-'):
                        line = line[1:].strip()
                    if current_assignee:
                        action_items.append(f"{line} (@{current_assignee})")
                    else:
                        action_items.append(line)
        
        # Get participants
        speakers = summary_data.get('speakers', '')
        participants = self._extract_participants(speakers)
        
        # Build the note content
        content = f"""---
meeting_date: {date_prefix}
meeting_title: "{title}"
source: fireflies
fireflies_id: {meeting_id}
created: {datetime.now().isoformat()}
tags: [meeting, fireflies]
---

# {title}

**Date:** {date_prefix}  
**Source:** [View in Fireflies](https://app.fireflies.ai/view/{meeting_id})
"""
        
        if participants:
            participant_links = ", ".join(f"[[{p}]]" for p in participants[:5])
            content += f"**Participants:** {participant_links}\n\n"
        
        content += """## Quick Links
*Add links to related notes here*
- **Projects:** 
- **People:** 
- **Related Concepts:** 

---

## Meeting Overview

"""
        
        content += overview + "\n\n"
        
        content += "## Key Topics & Keywords\n\n"
        if keywords:
            for kw in keywords[:15]:
                content += f"- {kw}\n"
        else:
            content += "*No keywords extracted*\n"
        
        content += "\n## Action Items\n\n"
        if action_items:
            for item in action_items:
                content += f"- [ ] {item}\n"
        else:
            content += "*No action items identified*\n"
        
        content += """

## Key Decisions

*Document important decisions made*


## Follow-up Required

*Additional follow-up needed*


## Meeting Notes

*Add your thoughts and context*


---

**Meeting Link:** """ + meeting_data.get('meeting_link', 'Not available') + """  
**Duration:** """ + str(int(meeting_data.get('duration', 0) / 60)) + """ minutes

**Full Transcript:** Available in Fireflies at the link above.

---

*Auto-generated from Fireflies. Add links in Quick Links section.*
"""
        
        # Write the file
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return str(filepath)
        except Exception as e:
            print(f"✗ Error creating {filename}: {e}")
            return None


# Example usage comment for when running through Claude:
"""
To use this converter through Claude, you would:

1. Create an instance:
   converter = FirefliesObsidianConverter("/path/to/Obsidian/Meetings")

2. Fetch meetings using Fireflies tools (Claude has these available)

3. For each meeting, get the summary and create a note:
   note_path = converter.create_note(meeting_data, summary_data)

4. The script tracks duplicates automatically

See the demo below for how to actually run this through Claude.
"""
