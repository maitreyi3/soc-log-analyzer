import os
from backend.config import UPLOAD_FOLDER
from backend.services.log_analysis_service import LogAnalysisService

SUPPORTED_LOG_TYPES = {
    "apache",
    "apache_clf",
    "apache_combined"
}

class UploadService:
    @staticmethod
    def handle_upload(file_storage, log_type: str):
        """
        Orchestrates log upload, parsing and analysis.
        """
        if not file_storage or file_storage.filename == "":
            raise ValueError("No file provided")

        filename = file_storage.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file_storage.save(filepath)
        log_type = (log_type or "apache").lower()

        if log_type not in SUPPORTED_LOG_TYPES:
            raise ValueError(f"Unsupported log type: {log_type}")

        return LogAnalysisService.analyze_apache_log(filepath)
