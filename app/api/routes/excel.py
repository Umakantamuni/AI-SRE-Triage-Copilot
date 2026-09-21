from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.excel_insight_service import ExcelInsightService


router = APIRouter(
    prefix="/api/v1/excel",
    tags=["Excel"],
)

BASE_DIR = Path(__file__).resolve().parents[3]
EXCEL_FILE = BASE_DIR / "SRE_Operational_Data.xlsx"


@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    """
    Upload and replace the operational Excel workbook.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only Excel files (.xlsx, .xls) are supported.",
        )

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded Excel file is empty.",
            )

        EXCEL_FILE.write_bytes(content)

        # Reinitialize service so the new workbook is used.
        service = ExcelInsightService()

        sheets = service.get_sheets()

        required_sheets = {
            "Service_Metrics",
            "Dependencies",
            "Historical_RCA",
            "Infrastructure",
        }

        missing_sheets = required_sheets - set(sheets)

        if missing_sheets:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Excel file is missing required sheets.",
                    "missing_sheets": sorted(missing_sheets),
                    "available_sheets": sheets,
                },
            )

        return {
            "success": True,
            "message": "Excel file uploaded successfully.",
            "filename": file.filename,
            "sheets": sheets,
            "summary": service.get_summary(),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process Excel file: {str(exc)}",
        )


@router.get("/sheets")
def get_excel_sheets():
    service = ExcelInsightService()

    return {
        "sheets": service.get_sheets(),
    }


@router.get("/summary")
def get_excel_summary():
    service = ExcelInsightService()

    return service.get_summary()


@router.get("/service-metrics")
def get_service_metrics():
    service = ExcelInsightService()

    return service.get_service_metrics().to_dict(
        orient="records"
    )


@router.get("/dependencies")
def get_dependencies():
    service = ExcelInsightService()

    return service.get_dependencies().to_dict(
        orient="records"
    )


@router.get("/historical-rca")
def get_historical_rca():
    service = ExcelInsightService()

    return service.get_historical_rca().to_dict(
        orient="records"
    )


@router.get("/infrastructure")
def get_infrastructure():
    service = ExcelInsightService()

    return service.get_infrastructure().to_dict(
        orient="records"
    )
