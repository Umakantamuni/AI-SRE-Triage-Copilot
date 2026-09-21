from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
EXCEL_FILE = BASE_DIR / "SRE_Operational_Data.xlsx"


class ExcelInsightService:
    def __init__(self):
        if not EXCEL_FILE.exists():
            raise FileNotFoundError(
                f"Excel file not found: {EXCEL_FILE}"
            )

        self.excel_file = EXCEL_FILE

    def get_sheets(self):
        return pd.ExcelFile(self.excel_file).sheet_names

    def get_service_metrics(self):
        return pd.read_excel(
            self.excel_file,
            sheet_name="Service_Metrics"
        )

    def get_dependencies(self):
        return pd.read_excel(
            self.excel_file,
            sheet_name="Dependencies"
        )

    def get_historical_rca(self):
        return pd.read_excel(
            self.excel_file,
            sheet_name="Historical_RCA"
        )

    def get_infrastructure(self):
        return pd.read_excel(
            self.excel_file,
            sheet_name="Infrastructure"
        )

    def get_summary(self):
        infrastructure = self.get_infrastructure()

        return {
            "total_components": len(infrastructure),
            "healthy": int(
                (infrastructure["Health_Status"] == "Healthy").sum()
            ),
            "degraded": int(
                (infrastructure["Health_Status"] == "Degraded").sum()
            ),
            "critical": int(
                (infrastructure["Health_Status"] == "Critical").sum()
            ),
        }


excel_service = ExcelInsightService()
