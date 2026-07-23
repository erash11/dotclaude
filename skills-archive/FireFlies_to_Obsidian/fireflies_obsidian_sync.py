#!/usr/bin/env python3
"""
🎯 ULTIMATE FIREFLIES-OBSIDIAN AUTOMATION
==========================================

One script to rule them all.

Just tell Claude what you want:
  "Sync last week"
  "Import all October meetings" 
  "Get my meetings from last 3 months"

This script handles EVERYTHING.

Author: Prof. Coach's Personal Automation System
"""

import sys
sys.path.insert(0, '/mnt/skills/user/fireflies-obsidian/scripts')

from fireflies_to_obsidian_converter import FirefliesObsidianConverter
from datetime import datetime, timedelta
from collections import Counter
from typing import Dict, List, Tuple
import json


# =============================================================================
# CONFIGURATION
# =============================================================================

OBSIDIAN_PATH = r"C:\Users\Eric_Rash\Desktop\BigHouse\Meetings"


# =============================================================================
# ANALYTICS ENGINE
# =============================================================================

class MeetingAnalytics:
    """Comprehensive meeting analytics"""
    
    @staticmethod
    def analyze(meetings: List[Dict]) -> Dict:
        """Generate insights from meeting data"""
        
        if not meetings:
            return {'total': 0}
        
        # Duration analysis
        durations = [m.get('duration', 0) / 60 for m in meetings]
        total_minutes = sum(durations)
        
        # Temporal analysis
        days = []
        hours = []
        dates = []
        
        for m in meetings:
            try:
                date_str = m.get('date', '')
                if not date_str:
                    continue
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                days.append(dt.strftime('%A'))
                hours.append(dt.hour)
                dates.append(dt.date())
            except:
                pass
        
        # Category detection
        categories = Counter()
        for m in meetings:
            title = m.get('title', '').lower()
            if any(x in title for x in ['staff', 'team', 'all']):
                categories['Staff Meetings'] += 1
            elif any(x in title for x in ['rtp', 'care', 'medical']):
                categories['Medical/RTP'] += 1
            elif any(x in title for x in ['data', 'power bi', 'api', 'integration']):
                categories['Data/Tech'] += 1
            elif any(x in title for x in ['bair', 'research']):
                categories['Research'] += 1
            else:
                categories['Other'] += 1
        
        return {
            'total': len(meetings),
            'duration_minutes': total_minutes,
            'duration_hours': total_minutes / 60,
            'avg_duration': total_minutes / len(meetings),
            'shortest': min(durations),
            'longest': max(durations),
            'by_day': dict(Counter(days).most_common()),
            'by_hour': dict(Counter(hours).most_common()),
            'by_category': dict(categories.most_common()),
            'unique_days': len(set(dates)),
            'meetings_per_day': len(meetings) / max(len(set(dates)), 1)
        }


# =============================================================================
# BEAUTIFUL REPORT GENERATOR
# =============================================================================

class ReportGenerator:
    """Generate stunning reports"""
    
    @staticmethod
    def create_sync_report(stats: Dict, analytics: Dict) -> str:
        """Create the ultimate sync report"""
        
        lines = []
        
        # Header
        lines.append("\n" + "="*75)
        lines.append("🔥 FIREFLIES → OBSIDIAN SYNC COMPLETE 🔥".center(75))
        lines.append("="*75 + "\n")
        
        # Sync summary
        lines.append("📊 SYNC RESULTS")
        lines.append("-"*75)
        lines.append(f"✅ Meetings found:         {stats['total_found']}")
        lines.append(f"🆕 New notes created:      {stats['new_imported']}")
        lines.append(f"⏭️  Duplicates skipped:    {stats['skipped_duplicates']}")
        
        # Meeting analytics
        if analytics['total'] > 0:
            lines.append(f"\n⏱️  MEETING TIME ANALYSIS")
            lines.append("-"*75)
            lines.append(f"📈 Total time:            {analytics['duration_hours']:.1f} hours")
            lines.append(f"📊 Average duration:      {analytics['avg_duration']:.1f} minutes")
            lines.append(f"⚡ Shortest:              {analytics['shortest']:.1f} minutes")
            lines.append(f"🕐 Longest:               {analytics['longest']:.1f} minutes")
            lines.append(f"📅 Unique days:           {analytics['unique_days']}")
            lines.append(f"📈 Meetings/day:          {analytics['meetings_per_day']:.1f}")
            
            # Category breakdown
            if analytics.get('by_category'):
                lines.append(f"\n📂 MEETING CATEGORIES")
                lines.append("-"*75)
                for cat, count in analytics['by_category'].items():
                    pct = (count / analytics['total']) * 100
                    bar = "█" * min(int(pct / 2), 40)
                    lines.append(f"{cat:20} {bar} {count} ({pct:.0f}%)")
            
            # Day distribution
            if analytics.get('by_day'):
                lines.append(f"\n📅 BUSIEST DAYS")
                lines.append("-"*75)
                for day, count in list(analytics['by_day'].items())[:5]:
                    bar = "█" * count
                    lines.append(f"{day:12} {bar} {count}")
            
            # Peak hours
            if analytics.get('by_hour'):
                lines.append(f"\n🕐 PEAK MEETING TIMES")
                lines.append("-"*75)
                sorted_hours = sorted(analytics['by_hour'].items(), 
                                     key=lambda x: x[1], reverse=True)[:5]
                for hour, count in sorted_hours:
                    time = f"{hour:02d}:00 - {hour+1:02d}:00"
                    bar = "█" * count
                    lines.append(f"{time:20} {bar} {count}")
        
        # Created files
        if stats['created_files']:
            lines.append(f"\n📝 NEW OBSIDIAN NOTES ({len(stats['created_files'])})")
            lines.append("-"*75)
            for i, filepath in enumerate(stats['created_files'][:12], 1):
                filename = filepath.split('\\')[-1] if '\\' in filepath else filepath.split('/')[-1]
                lines.append(f" {i:2}. {filename}")
            
            if len(stats['created_files']) > 12:
                lines.append(f"     ... and {len(stats['created_files']) - 12} more")
        
        # Next steps
        lines.append(f"\n💡 YOUR ACTION ITEMS")
        lines.append("-"*75)
        lines.append(f"1. 📂 Open Obsidian: {OBSIDIAN_PATH}")
        lines.append("2. 👀 Review new notes (5 min each)")
        lines.append("3. 🔗 Add Quick Links:")
        lines.append("   • Projects: [[BAIR]], [[AMS]], [[Force Plate Testing]]")
        lines.append("   • People: [[Danny Davis]], [[Kenny Boyd]], [[JB Goodin]]")
        lines.append("   • Concepts: [[Power BI]], [[Return-to-Play]], [[GPS Data]]")
        lines.append("4. ✏️  Add personal insights in 'Meeting Notes'")
        lines.append("5. ✅ Check off any completed action items")
        lines.append("6. 📁 Organize by project/topic (optional)")
        
        # Pro tips
        lines.append(f"\n🎯 PRO TIPS")
        lines.append("-"*75)
        lines.append("• Run this automation weekly (Friday afternoons work great)")
        lines.append("• Link meetings to build your knowledge graph")
        lines.append("• Use Obsidian's graph view to see connections")
        lines.append("• Archive old meetings to seasonal folders")
        lines.append("• Search by tags: #meeting #fireflies")
        
        # Footer
        lines.append("\n" + "="*75)
        lines.append("✨ Remember: Your meeting notes are now knowledge assets! ✨".center(75))
        lines.append("="*75 + "\n")
        
        return "\n".join(lines)


# =============================================================================
# MAIN AUTOMATION SYSTEM
# =============================================================================

class FirefliesSyncMaster:
    """The ultimate automation system"""
    
    def __init__(self):
        self.converter = FirefliesObsidianConverter(OBSIDIAN_PATH)
        self.analytics = MeetingAnalytics()
        self.reporter = ReportGenerator()
        self.stats = {
            'total_found': 0,
            'new_imported': 0,
            'skipped_duplicates': 0,
            'created_files': [],
            'all_meetings': []
        }
    
    def sync_meetings(self, meetings_data: List[Dict], summaries_data: List[Dict]) -> str:
        """
        Sync meetings to Obsidian and generate report.
        
        Args:
            meetings_data: List of meeting objects from Fireflies API
            summaries_data: Corresponding summaries for each meeting
        
        Returns:
            Formatted report string
        """
        self.stats['total_found'] = len(meetings_data)
        self.stats['all_meetings'] = meetings_data
        
        print("🔄 Processing meetings...")
        print()
        
        # Process each meeting
        for i, (meeting, summary) in enumerate(zip(meetings_data, summaries_data), 1):
            meeting_id = meeting.get('id', '')
            title = meeting.get('title', 'Untitled')[:50]
            
            # Check if duplicate
            if meeting_id in self.converter.imported_meetings:
                self.stats['skipped_duplicates'] += 1
                print(f"  ⏭️  [{i}/{len(meetings_data)}] Skipping: {title}...")
                continue
            
            # Create note
            print(f"  📝 [{i}/{len(meetings_data)}] Creating: {title}...")
            note_path = self.converter.create_note(meeting, summary)
            
            if note_path:
                self.stats['new_imported'] += 1
                self.stats['created_files'].append(note_path)
                self.converter._save_to_tracking(meeting_id)
        
        print()
        print("✅ Processing complete!")
        print()
        
        # Generate analytics
        analytics = self.analytics.analyze(meetings_data)
        
        # Create report
        return self.reporter.create_sync_report(self.stats, analytics)


# =============================================================================
# QUICK DEMO
# =============================================================================

def demo():
    """Show what this system can do"""
    
    print("\n" + "="*75)
    print("🎯 FIREFLIES-OBSIDIAN AUTOMATION SYSTEM".center(75))
    print("="*75)
    print()
    print("This is your personal meeting sync system.")
    print()
    print("📋 WHAT IT DOES:")
    print("  • Fetches meetings from Fireflies")
    print("  • Creates beautiful Obsidian notes")
    print("  • Prevents duplicates automatically")
    print("  • Generates meeting analytics")
    print("  • Shows you actionable insights")
    print()
    print("🚀 HOW TO USE:")
    print("  Just tell me what you want! For example:")
    print()
    print("  'Sync my last week of Fireflies meetings'")
    print("  'Import all meetings from October'")
    print("  'Get my Fireflies meetings from last 3 months'")
    print("  'Run the Fireflies automation'")
    print()
    print("📊 FEATURES:")
    print("  ✅ Smart duplicate detection")
    print("  ✅ Meeting time analytics")
    print("  ✅ Category classification")
    print("  ✅ Peak time analysis")
    print("  ✅ Beautiful reports")
    print("  ✅ Action item extraction")
    print("  ✅ Obsidian-ready formatting")
    print()
    print("📂 OUTPUT LOCATION:")
    print(f"  {OBSIDIAN_PATH}")
    print()
    print("💾 TRACKING:")
    print(f"  {OBSIDIAN_PATH}/.fireflies_imported.txt")
    print(f"  Currently tracking: {len(FirefliesObsidianConverter(OBSIDIAN_PATH).imported_meetings)} meetings")
    print()
    print("="*75)
    print("Ready to sync! Just say the word. 🔥".center(75))
    print("="*75 + "\n")


if __name__ == "__main__":
    demo()
