from backend.parsers.apache_parser import detect_log_type, parse_apache_log_file
from backend.analytics.log_analytics import generate_dashboard


class LogAnalysisService:
    @staticmethod
    def analyze_apache_log(file_path: str) -> dict:
        with open(file_path, "r", encoding="utf-8") as f:
            first_line = f.readline().strip()

        if detect_log_type(first_line) != "apache_clf":
            raise ValueError("Unsupported or invalid Apache log format")

        parsed_logs = parse_apache_log_file(file_path)

        return {
            "total_entries": len(parsed_logs),
            "preview": parsed_logs[:50],
            "dashboard": generate_dashboard(parsed_logs),
        }
