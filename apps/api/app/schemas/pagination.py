from pydantic import BaseModel, Field


class PaginatedResponse[T](BaseModel):
    items: list[T] = Field(default_factory=list, description="List of items in current page")
    total: int = Field(..., ge=0, description="Total number of items matching filter")
    page: int = Field(..., ge=1, description="Current page number (1-indexed)")
    page_size: int = Field(..., ge=1, le=100, description="Number of items per page")
    total_pages: int = Field(..., ge=0, description="Total number of available pages")
    has_next: bool = Field(..., description="Whether there is a subsequent page")
    has_prev: bool = Field(..., description="Whether there is a preceding page")
