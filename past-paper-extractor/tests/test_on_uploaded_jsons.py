"""Regression tests that compare messy uploaded JSON against cleaned samples."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from scripts.validator import validate_template


SAMPLE_INPUTS = {
    "Accounting": Path("/mnt/data/Accounting_Paper_2020.json"),
    "Business": Path("/mnt/data/Business_Paper_2020.json"),
    "Computer": Path("/mnt/data/Computer_Paper2_2020.json"),
}

EXPECTED_ROOT = Path(__file__).resolve().parents[1] / "SAMPLES" / "expected"
EXPECTED_OUTPUTS = {
    "Accounting": EXPECTED_ROOT / "Accounting_Paper_2020.json",
    "Business": EXPECTED_ROOT / "Business_Paper_2020.json",
    "Computer": EXPECTED_ROOT / "Computer_Paper2_2020.json",
}


@pytest.mark.parametrize("name,sample_path", SAMPLE_INPUTS.items())
def test_uploaded_samples_fail_validation(name: str, sample_path: Path) -> None:
    """Existing extractor outputs should fail validation, surfacing key issues."""
    if not sample_path.exists():  # pragma: no cover - CI without uploaded files
        pytest.skip(f"Sample file {sample_path} not available")

    with sample_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    result = validate_template(data)
    assert not result["valid"], f"{name} sample unexpectedly passed validation"


@pytest.mark.parametrize("name,expected_path", EXPECTED_OUTPUTS.items())
def test_expected_samples_pass_validation(name: str, expected_path: Path) -> None:
    """Hand-crafted expected templates act as the passing baseline."""
    with expected_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    result = validate_template(data)
    assert result["valid"], f"{name} expected template should pass validation"


