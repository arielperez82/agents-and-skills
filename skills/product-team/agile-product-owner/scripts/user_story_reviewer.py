#!/usr/bin/env python3
"""
User Story Reviewer
Reviews and scores user stories for completeness and INVEST compliance
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UserStoryReviewer:
    """Review and score user stories for quality and completeness"""

    def __init__(self, verbose: bool = False):
        if verbose:
            logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("UserStoryReviewer initialized")

        # INVEST criteria weights (total = 100)
        self.invest_weights = {
            'independent': 15,
            'negotiable': 10,
            'valuable': 20,
            'estimable': 15,
            'small': 15,
            'testable': 25
        }

        # Completeness criteria weights (total = 100)
        self.completeness_weights = {
            'has_persona': 15,
            'has_action': 20,
            'has_benefit': 20,
            'has_acceptance_criteria': 25,
            'has_priority': 10,
            'has_estimate': 10
        }

        # Dependency indicator words
        self.dependency_words = [
            'after', 'depends', 'requires', 'needs', 'following',
            'once', 'when complete', 'blocked by', 'waiting for'
        ]

        # Ambiguous words that hurt testability
        self.ambiguous_words = [
            'maybe', 'possibly', 'somehow', 'might', 'could',
            'should be able', 'as needed', 'etc', 'and so on',
            'appropriate', 'reasonable', 'good', 'nice', 'better',
            'fast', 'slow', 'easy', 'simple', 'intuitive', 'user-friendly'
        ]

        # Value indicator words
        self.value_words = [
            'save', 'reduce', 'increase', 'improve', 'enable',
            'allow', 'prevent', 'avoid', 'ensure', 'track',
            'revenue', 'cost', 'time', 'efficiency', 'satisfaction',
            'conversion', 'retention', 'engagement', 'productivity'
        ]

        # Complexity indicators for size check
        self.high_complexity_words = [
            'redesign', 'refactor', 'migrate', 'integrate', 'architect',
            'overhaul', 'replace', 'rebuild', 'entire', 'all', 'complete',
            'comprehensive', 'full', 'end-to-end', 'across'
        ]

    def review_story(self, story: Dict) -> Dict:
        """Review a single user story and return detailed scores"""

        review = {
            'story_id': story.get('id', 'UNKNOWN'),
            'title': story.get('title', story.get('narrative', '')[:50]),
            'invest_scores': {},
            'invest_total': 0,
            'completeness_scores': {},
            'completeness_total': 0,
            'overall_score': 0,
            'grade': '',
            'issues': [],
            'suggestions': []
        }

        # Run INVEST checks
        review['invest_scores'] = self._check_invest(story)
        review['invest_total'] = sum(
            score['score'] * self.invest_weights[criterion] / 100
            for criterion, score in review['invest_scores'].items()
        )

        # Run completeness checks
        review['completeness_scores'] = self._check_completeness(story)
        review['completeness_total'] = sum(
            score['score'] * self.completeness_weights[criterion] / 100
            for criterion, score in review['completeness_scores'].items()
        )

        # Calculate overall score (50% INVEST, 50% completeness)
        review['overall_score'] = round(
            (review['invest_total'] * 0.5 + review['completeness_total'] * 0.5),
            1
        )

        # Assign grade
        review['grade'] = self._calculate_grade(review['overall_score'])

        # Collect issues and suggestions
        review['issues'] = self._collect_issues(review)
        review['suggestions'] = self._generate_suggestions(review, story)

        return review

    def _check_invest(self, story: Dict) -> Dict:
        """Check INVEST criteria"""

        narrative = story.get('narrative', '') + ' ' + story.get('title', '')
        narrative_lower = narrative.lower()
        acceptance_criteria = story.get('acceptance_criteria', [])
        estimate = story.get('estimation', story.get('estimate', story.get('points', None)))

        scores = {}

        # Independent: No dependencies on other stories
        dependency_found = any(word in narrative_lower for word in self.dependency_words)
        scores['independent'] = {
            'score': 0 if dependency_found else 100,
            'passed': not dependency_found,
            'reason': 'Dependency language detected' if dependency_found else 'No dependencies found'
        }

        # Negotiable: Not too prescriptive, allows for discussion
        is_prescriptive = self._check_prescriptive(narrative)
        scores['negotiable'] = {
            'score': 50 if is_prescriptive else 100,
            'passed': not is_prescriptive,
            'reason': 'Story is too prescriptive/technical' if is_prescriptive else 'Story allows negotiation'
        }

        # Valuable: Clear business value stated
        value_score, value_reason = self._check_value(narrative_lower, story.get('benefit', ''))
        scores['valuable'] = {
            'score': value_score,
            'passed': value_score >= 70,
            'reason': value_reason
        }

        # Estimable: Clear enough to estimate
        estimable_score, estimable_reason = self._check_estimable(narrative, acceptance_criteria)
        scores['estimable'] = {
            'score': estimable_score,
            'passed': estimable_score >= 70,
            'reason': estimable_reason
        }

        # Small: Can be completed in one sprint
        small_score, small_reason = self._check_small(narrative_lower, estimate)
        scores['small'] = {
            'score': small_score,
            'passed': small_score >= 70,
            'reason': small_reason
        }

        # Testable: Has clear acceptance criteria
        testable_score, testable_reason = self._check_testable(narrative_lower, acceptance_criteria)
        scores['testable'] = {
            'score': testable_score,
            'passed': testable_score >= 70,
            'reason': testable_reason
        }

        return scores

    def _check_completeness(self, story: Dict) -> Dict:
        """Check story completeness"""

        narrative = story.get('narrative', '')
        scores = {}

        # Has persona (As a...)
        has_persona = bool(re.search(r'as an?\s+\w+', narrative, re.IGNORECASE))
        scores['has_persona'] = {
            'score': 100 if has_persona else 0,
            'passed': has_persona,
            'reason': 'Persona identified' if has_persona else 'Missing persona (As a...)'
        }

        # Has action (I want to...)
        has_action = bool(re.search(r'i want to|i need to|i can|i should be able', narrative, re.IGNORECASE))
        scores['has_action'] = {
            'score': 100 if has_action else 0,
            'passed': has_action,
            'reason': 'Action specified' if has_action else 'Missing action (I want to...)'
        }

        # Has benefit (So that...)
        has_benefit = bool(re.search(r'so that|in order to|to enable|to allow|because', narrative, re.IGNORECASE))
        scores['has_benefit'] = {
            'score': 100 if has_benefit else 0,
            'passed': has_benefit,
            'reason': 'Benefit stated' if has_benefit else 'Missing benefit (So that...)'
        }

        # Has acceptance criteria
        ac = story.get('acceptance_criteria', [])
        ac_count = len(ac) if isinstance(ac, list) else (1 if ac else 0)
        if ac_count >= 3:
            ac_score = 100
            ac_reason = f'{ac_count} acceptance criteria defined'
        elif ac_count > 0:
            ac_score = 50
            ac_reason = f'Only {ac_count} acceptance criteria (recommend 3+)'
        else:
            ac_score = 0
            ac_reason = 'No acceptance criteria defined'
        scores['has_acceptance_criteria'] = {
            'score': ac_score,
            'passed': ac_count >= 3,
            'reason': ac_reason
        }

        # Has priority
        priority = story.get('priority', story.get('importance', None))
        scores['has_priority'] = {
            'score': 100 if priority else 0,
            'passed': bool(priority),
            'reason': f'Priority: {priority}' if priority else 'Missing priority'
        }

        # Has estimate
        estimate = story.get('estimation', story.get('estimate', story.get('points', None)))
        scores['has_estimate'] = {
            'score': 100 if estimate else 0,
            'passed': bool(estimate),
            'reason': f'Estimated: {estimate} points' if estimate else 'Missing estimate'
        }

        return scores

    def _check_prescriptive(self, narrative: str) -> bool:
        """Check if story is too prescriptive"""
        prescriptive_patterns = [
            r'use\s+\w+\s+library',
            r'implement\s+using',
            r'must\s+use',
            r'database\s+table',
            r'api\s+endpoint',
            r'button\s+on\s+the',
            r'dropdown',
            r'modal',
            r'specific\s+\w+\s+format'
        ]

        narrative_lower = narrative.lower()
        return any(re.search(pattern, narrative_lower) for pattern in prescriptive_patterns)

    def _check_value(self, narrative_lower: str, benefit: str) -> Tuple[int, str]:
        """Check if story has clear business value"""

        combined = narrative_lower + ' ' + benefit.lower()

        # Check for "so that" clause
        has_so_that = 'so that' in combined or 'in order to' in combined

        # Check for value words
        value_word_count = sum(1 for word in self.value_words if word in combined)

        if has_so_that and value_word_count >= 2:
            return 100, 'Clear business value with measurable benefit'
        elif has_so_that or value_word_count >= 1:
            return 70, 'Business value present but could be more specific'
        else:
            return 30, 'Missing clear business value statement'

    def _check_estimable(self, narrative: str, acceptance_criteria: List) -> Tuple[int, str]:
        """Check if story is estimable"""

        issues = []
        score = 100

        # Check word count (too long = unclear)
        word_count = len(narrative.split())
        if word_count > 50:
            score -= 30
            issues.append('narrative too long')

        # Check for ambiguous words
        narrative_lower = narrative.lower()
        ambiguous_found = [w for w in self.ambiguous_words if w in narrative_lower]
        if ambiguous_found:
            score -= 20
            issues.append(f'ambiguous terms: {", ".join(ambiguous_found[:3])}')

        # Check acceptance criteria clarity
        if len(acceptance_criteria) < 2:
            score -= 20
            issues.append('insufficient acceptance criteria')

        if issues:
            return max(0, score), f'Estimability concerns: {"; ".join(issues)}'
        return 100, 'Story is clear and estimable'

    def _check_small(self, narrative_lower: str, estimate: any) -> Tuple[int, str]:
        """Check if story is small enough"""

        # Check for complexity indicators
        complexity_count = sum(1 for word in self.high_complexity_words if word in narrative_lower)

        # Check estimate if available
        if estimate:
            try:
                points = int(estimate)
                if points > 13:
                    return 20, f'Too large ({points} points) - should split'
                elif points > 8:
                    return 50, f'Large ({points} points) - consider splitting'
                elif points <= 5:
                    return 100, f'Good size ({points} points)'
                else:
                    return 80, f'Acceptable size ({points} points)'
            except (ValueError, TypeError):
                pass

        # Estimate based on complexity words
        if complexity_count >= 3:
            return 30, 'Multiple complexity indicators - likely too large'
        elif complexity_count >= 1:
            return 60, 'Some complexity indicators - may need splitting'

        return 80, 'Size appears reasonable (no estimate provided)'

    def _check_testable(self, narrative_lower: str, acceptance_criteria: List) -> Tuple[int, str]:
        """Check if story is testable"""

        score = 100
        issues = []

        # Check for ambiguous words
        ambiguous_found = [w for w in self.ambiguous_words if w in narrative_lower]
        if ambiguous_found:
            score -= 30
            issues.append(f'ambiguous terms make testing unclear')

        # Check acceptance criteria
        if not acceptance_criteria:
            score -= 40
            issues.append('no acceptance criteria')
        else:
            # Check for Given/When/Then or measurable criteria
            gherkin_count = sum(
                1 for ac in acceptance_criteria
                if any(word in str(ac).lower() for word in ['given', 'when', 'then', 'should', 'must'])
            )
            if gherkin_count < len(acceptance_criteria) * 0.5:
                score -= 20
                issues.append('acceptance criteria lack testable format')

        if issues:
            return max(0, score), f'Testability issues: {"; ".join(issues)}'
        return 100, 'Story has clear, testable acceptance criteria'

    def _calculate_grade(self, score: float) -> str:
        """Calculate letter grade from score"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'

    def _collect_issues(self, review: Dict) -> List[str]:
        """Collect all issues from review"""
        issues = []

        for criterion, data in review['invest_scores'].items():
            if not data['passed']:
                issues.append(f"INVEST/{criterion.upper()}: {data['reason']}")

        for criterion, data in review['completeness_scores'].items():
            if not data['passed']:
                issues.append(f"COMPLETENESS/{criterion}: {data['reason']}")

        return issues

    def _generate_suggestions(self, review: Dict, story: Dict) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []

        invest = review['invest_scores']
        completeness = review['completeness_scores']

        # INVEST suggestions
        if not invest['independent']['passed']:
            suggestions.append("Remove dependency language or split into separate stories")

        if not invest['negotiable']['passed']:
            suggestions.append("Focus on WHAT not HOW - remove implementation details")

        if not invest['valuable']['passed']:
            suggestions.append("Add 'so that [business benefit]' clause with measurable outcome")

        if not invest['estimable']['passed']:
            suggestions.append("Clarify scope and remove ambiguous terms like 'fast', 'easy', 'intuitive'")

        if not invest['small']['passed']:
            suggestions.append("Split into smaller stories that can be completed in 1-3 days")

        if not invest['testable']['passed']:
            suggestions.append("Add specific, measurable acceptance criteria using Given/When/Then format")

        # Completeness suggestions
        if not completeness['has_persona']['passed']:
            suggestions.append("Add persona: 'As a [user type]...'")

        if not completeness['has_action']['passed']:
            suggestions.append("Add action: '...I want to [action]...'")

        if not completeness['has_benefit']['passed']:
            suggestions.append("Add benefit: '...so that [business value]'")

        if not completeness['has_acceptance_criteria']['passed']:
            suggestions.append("Add at least 3 acceptance criteria covering happy path, edge cases, and error handling")

        if not completeness['has_priority']['passed']:
            suggestions.append("Add priority (Critical/High/Medium/Low)")

        if not completeness['has_estimate']['passed']:
            suggestions.append("Add story point estimate (1, 2, 3, 5, 8, 13)")

        return suggestions

    def review_batch(self, stories: List[Dict]) -> Dict:
        """Review multiple stories and provide summary"""

        reviews = [self.review_story(story) for story in stories]

        # Calculate summary statistics
        total_score = sum(r['overall_score'] for r in reviews) / len(reviews) if reviews else 0

        grade_counts = {}
        for r in reviews:
            grade_counts[r['grade']] = grade_counts.get(r['grade'], 0) + 1

        # Find common issues
        all_issues = []
        for r in reviews:
            all_issues.extend(r['issues'])

        issue_counts = {}
        for issue in all_issues:
            # Extract issue type
            issue_type = issue.split(':')[0] if ':' in issue else issue
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1

        common_issues = sorted(issue_counts.items(), key=lambda x: -x[1])[:5]

        return {
            'total_stories': len(stories),
            'average_score': round(total_score, 1),
            'average_grade': self._calculate_grade(total_score),
            'grade_distribution': grade_counts,
            'common_issues': common_issues,
            'reviews': reviews
        }


def parse_story_input(text: str) -> Dict:
    """Parse a story from plain text input"""

    story = {
        'id': 'INPUT-001',
        'narrative': text,
        'acceptance_criteria': [],
        'priority': None,
        'estimation': None
    }

    # Try to extract structured parts
    lines = text.strip().split('\n')

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()

        # Extract title
        if line_lower.startswith('title:'):
            story['title'] = line.split(':', 1)[1].strip()

        # Extract narrative
        if line_lower.startswith('as a') or line_lower.startswith('as an'):
            story['narrative'] = line.strip()

        # Extract acceptance criteria
        if 'acceptance criteria' in line_lower or line_lower.startswith('ac:'):
            # Collect following lines as AC
            for j in range(i + 1, len(lines)):
                ac_line = lines[j].strip()
                if ac_line and (ac_line.startswith('-') or ac_line.startswith('*') or ac_line[0].isdigit()):
                    story['acceptance_criteria'].append(ac_line.lstrip('-*0123456789. '))
                elif ac_line and ':' in ac_line:
                    break

        # Extract priority
        if 'priority:' in line_lower:
            story['priority'] = line.split(':', 1)[1].strip()

        # Extract estimate
        if 'estimate:' in line_lower or 'points:' in line_lower or 'story points:' in line_lower:
            try:
                story['estimation'] = int(re.search(r'\d+', line).group())
            except (AttributeError, ValueError):
                pass

    return story


def format_text_output(result: Dict, verbose: bool = False) -> str:
    """Format review results as human-readable text"""
    output = []

    if 'reviews' in result:
        # Batch review output
        output.append("=" * 70)
        output.append("USER STORY REVIEW SUMMARY")
        output.append("=" * 70)
        output.append(f"Stories Reviewed: {result['total_stories']}")
        output.append(f"Average Score: {result['average_score']}% (Grade: {result['average_grade']})")
        output.append("")

        output.append("Grade Distribution:")
        for grade in ['A', 'B', 'C', 'D', 'F']:
            count = result['grade_distribution'].get(grade, 0)
            bar = '█' * count
            output.append(f"  {grade}: {bar} ({count})")
        output.append("")

        if result['common_issues']:
            output.append("Common Issues:")
            for issue, count in result['common_issues']:
                output.append(f"  • {issue} ({count} stories)")
            output.append("")

        output.append("-" * 70)
        output.append("INDIVIDUAL REVIEWS")
        output.append("-" * 70)

        for review in result['reviews']:
            output.append(format_single_review(review, verbose))
            output.append("")
    else:
        # Single review output
        output.append(format_single_review(result, verbose))

    return "\n".join(output)


def format_single_review(review: Dict, verbose: bool = False) -> str:
    """Format a single story review"""
    output = []

    score_bar = '█' * int(review['overall_score'] / 10) + '░' * (10 - int(review['overall_score'] / 10))

    output.append(f"\n📋 {review['story_id']}: {review.get('title', 'Untitled')[:40]}")
    output.append(f"   Score: [{score_bar}] {review['overall_score']}% (Grade: {review['grade']})")
    output.append(f"   INVEST: {review['invest_total']:.0f}% | Completeness: {review['completeness_total']:.0f}%")

    if verbose or review['grade'] in ['D', 'F']:
        output.append("")
        output.append("   INVEST Criteria:")
        for criterion, data in review['invest_scores'].items():
            icon = '✓' if data['passed'] else '✗'
            output.append(f"     {icon} {criterion.capitalize()}: {data['reason']}")

        output.append("")
        output.append("   Completeness:")
        for criterion, data in review['completeness_scores'].items():
            icon = '✓' if data['passed'] else '✗'
            output.append(f"     {icon} {criterion}: {data['reason']}")

    if review['suggestions']:
        output.append("")
        output.append("   💡 Suggestions:")
        for suggestion in review['suggestions'][:3]:  # Top 3 suggestions
            output.append(f"      • {suggestion}")

    return "\n".join(output)


def format_json_output(result: Dict) -> str:
    """Format review results as JSON"""
    return json.dumps(result, indent=2)


def format_csv_output(result: Dict) -> str:
    """Format review results as CSV"""
    import io
    csv_output = io.StringIO()

    # CSV header
    csv_output.write('story_id,title,overall_score,grade,invest_score,completeness_score,issues_count\n')

    reviews = result.get('reviews', [result])
    for review in reviews:
        csv_output.write(
            f"{review['story_id']},"
            f"\"{review.get('title', '')[:30]}\","
            f"{review['overall_score']},"
            f"{review['grade']},"
            f"{review['invest_total']:.0f},"
            f"{review['completeness_total']:.0f},"
            f"{len(review['issues'])}\n"
        )

    return csv_output.getvalue()


def load_stories_from_json(filepath: str) -> List[Dict]:
    """Load stories from JSON file"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
            # Handle both single story and array of stories
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and 'stories' in data:
                return data['stories']
            else:
                return [data]
    except FileNotFoundError:
        print(f"Error: Input file not found: {filepath}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in file: {e}", file=sys.stderr)
        sys.exit(1)


def create_sample_stories() -> List[Dict]:
    """Create sample stories for demonstration"""
    return [
        {
            'id': 'US-001',
            'title': 'User Login',
            'narrative': 'As a registered user, I want to log in with my email and password so that I can access my account securely',
            'acceptance_criteria': [
                'Given valid credentials, When I submit login form, Then I am redirected to dashboard',
                'Given invalid credentials, When I submit login form, Then I see an error message',
                'Should lock account after 5 failed attempts',
                'Must support remember me functionality'
            ],
            'priority': 'high',
            'estimation': 5
        },
        {
            'id': 'US-002',
            'title': 'Dashboard Redesign',
            'narrative': 'Redesign the entire dashboard to be more user-friendly and intuitive',
            'acceptance_criteria': [
                'Dashboard should look nice'
            ],
            'priority': None,
            'estimation': None
        },
        {
            'id': 'US-003',
            'title': 'Export Report',
            'narrative': 'As a manager, I want to export reports after the analytics module is complete so that I can share insights with stakeholders',
            'acceptance_criteria': [
                'Given a report is generated, When I click export, Then PDF is downloaded',
                'Should support CSV export',
                'Must include date range in filename'
            ],
            'priority': 'medium',
            'estimation': 3
        },
        {
            'id': 'US-004',
            'title': 'Performance Optimization',
            'narrative': 'Make the application faster',
            'acceptance_criteria': [],
            'priority': 'low',
            'estimation': 21
        }
    ]


def main():
    parser = argparse.ArgumentParser(
        description='Review user stories for completeness and INVEST compliance',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Review sample stories (demo)
  %(prog)s

  # Review stories from JSON file
  %(prog)s stories.json

  # Review a single story from text
  %(prog)s --text "As a user, I want to reset my password so that I can regain access"

  # Verbose output with all details
  %(prog)s stories.json --verbose

  # Export as JSON
  %(prog)s stories.json --output json

  # Export as CSV for spreadsheet
  %(prog)s stories.json -o csv -f review-results.csv

JSON input format:
  [
    {
      "id": "US-001",
      "title": "User Login",
      "narrative": "As a user, I want to...",
      "acceptance_criteria": ["Given...", "When...", "Then..."],
      "priority": "high",
      "estimation": 5
    }
  ]

For more information, see the skill documentation.
        """
    )

    parser.add_argument('input', nargs='?', help='JSON file with stories (optional, uses samples if not provided)')
    parser.add_argument('--text', '-t', help='Review a single story from text input')
    parser.add_argument('--output', '-o', choices=['text', 'json', 'csv'], default='text', help='Output format (default: text)')
    parser.add_argument('--file', '-f', help='Write output to file instead of stdout')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed review for all stories')
    parser.add_argument('--version', action='version', version='%(prog)s 1.0.0')

    args = parser.parse_args()

    try:
        reviewer = UserStoryReviewer(verbose=args.verbose)

        # Load stories
        if args.text:
            if args.verbose:
                print("Parsing story from text input", file=sys.stderr)
            stories = [parse_story_input(args.text)]
        elif args.input:
            if args.verbose:
                print(f"Loading stories from: {args.input}", file=sys.stderr)
            stories = load_stories_from_json(args.input)
        else:
            if args.verbose:
                print("Using sample stories for demonstration", file=sys.stderr)
            stories = create_sample_stories()

        if args.verbose:
            print(f"Reviewing {len(stories)} stories", file=sys.stderr)

        # Review stories
        if len(stories) == 1:
            result = reviewer.review_story(stories[0])
        else:
            result = reviewer.review_batch(stories)

        # Format output
        if args.output == 'json':
            output = format_json_output(result)
        elif args.output == 'csv':
            output = format_csv_output(result)
        else:
            output = format_text_output(result, args.verbose)

        # Write output
        if args.file:
            try:
                with open(args.file, 'w') as f:
                    f.write(output)
                if args.verbose:
                    print(f"Results written to: {args.file}", file=sys.stderr)
                else:
                    print(f"Output saved to: {args.file}")
            except Exception as e:
                print(f"Error writing output file: {e}", file=sys.stderr)
                sys.exit(4)
        else:
            print(output)

        sys.exit(0)

    except KeyboardInterrupt:
        print("\nOperation cancelled by user", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
