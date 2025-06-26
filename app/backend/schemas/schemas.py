from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from uuid import UUID

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class Users(UserBase):
    id: UUID
    password: str

    class Config:
        from_attributes = True

class PaymentsBase(BaseModel):
    category: str
    vendor: str
    amount: int
    user_id: UUID

class PaymentsCreate(PaymentsBase):
    pass

class Payments(PaymentsBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class BillsBase(BaseModel):
    category: str
    vendor: str
    amount: int
    status: str
    user_id: UUID

class BillsCreate(BillsBase):
    pass

class Bills(BillsBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseTable(BaseModel):
    id: UUID
    vendor: str
    category: str
    amount: int
    status: str
    created_at: datetime

class CardData(BaseModel):
    totalPayments: str
    pendingBills: str
    totalBills: int
    totalCategories: int

class LatestPayment(BaseModel):
    id: UUID
    vendor: str
    category: str
    amount: str

class UserLogin(BaseModel):
    email: str
    password: str

class MonthlyExpense(BaseModel):
    month: str
    revenue: float
