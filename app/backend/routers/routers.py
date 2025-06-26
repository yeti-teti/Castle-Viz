from fastapi import FastAPI, HTTPException, APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, extract, Text, literal
from typing import List, Optional
import bcrypt
from uuid import UUID
from datetime import datetime, timedelta

from database import engine, get_db
from models import models
from schemas import schemas

models.Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("/users/", response_model=schemas.Users)
def create_users(users: schemas.UserCreate, db: Session = Depends(get_db)):

    hashed_password = bcrypt.hashpw(users.password.encode('utf-8'), bcrypt.gensalt())
    users_dict = users.model_dump()
    users_dict['password'] = hashed_password.decode('utf-8')

    db_users = models.Users(**users_dict)
    db.add(db_users)
    db.commit()
    db.refresh(db_users)
    return db_users

@router.get("/users/", response_model=List[schemas.Users])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.Users).offset(skip).limit(limit).all()
    return users

@router.get("/users/by-email/{email}", response_model=Optional[schemas.Users])
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    return user

@router.post("/payments/", response_model=schemas.Payments)
def create_payments(payments: schemas.PaymentsCreate, db: Session = Depends(get_db)):
    db_payments = models.Payments(**payments.model_dump())
    db.add(db_payments)
    db.commit()
    db.refresh(db_payments)
    return db_payments

@router.get("/payments/", response_model=List[schemas.Payments])
def read_payments(current_user_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    payments = db.query(models.Payments).filter(models.Payments.user_id == current_user_id).offset(skip).limit(limit).all()
    return payments

@router.get("/payments/latest", response_model=List[schemas.LatestPayment])
def get_latest_payments(db: Session = Depends(get_db)):
    payments = db.query(models.Payments).order_by(desc(models.Payments.created_at)).limit(5).all()
    return [
        {
            "id": p.id,
            "vendor": p.vendor,
            "category": p.category,
            "amount": f"${p.amount / 100:.2f}"
        } for p in payments
    ]

@router.post("/bills/", response_model=schemas.Bills)
def create_bills(bills: schemas.BillsCreate, db: Session = Depends(get_db)):
    db_bills = models.Bills(**bills.model_dump())
    db.add(db_bills)
    db.commit()
    db.refresh(db_bills)
    return db_bills

@router.get("/bills/", response_model=List[schemas.Bills])
def read_bills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bills = db.query(models.Bills).offset(skip).limit(limit).all()
    return bills

@router.get("/dashboard/card-data", response_model=schemas.CardData)
def get_card_data(db: Session = Depends(get_db)):

    total_payments = db.query(func.sum(models.Payments.amount)).scalar() or 0
    total_bills = db.query(func.count(models.Bills.id)).scalar() or 0
    pending_bills = db.query(func.sum(models.Bills.amount)).filter(
        models.Bills.status == 'pending'
    ).scalar() or 0

    bill_categories = db.query(models.Bills.category).distinct().all()
    payment_categories = db.query(models.Payments.category).distinct().all()
    unique_categories = set([cat[0] for cat in bill_categories] + [cat[0] for cat in payment_categories])
    
    return {
        "totalPayments": f"${total_payments / 100:.2f}",
        "pendingBills": f"${pending_bills / 100:.2f}",
        "totalBills": total_bills,
        "totalCategories": len(unique_categories)
    }

@router.get("/expenses/filtered", response_model=List[schemas.ExpenseTable])
def get_filtered_expenses(
    query: str = "",
    page: int = 1,
    items_per_page: int = 6,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * items_per_page

    bills_query = db.query(
        models.Bills.id,
        models.Bills.vendor,
        models.Bills.category,
        models.Bills.amount,
        models.Bills.status,
        models.Bills.created_at
    ).filter(
        or_(
            models.Bills.vendor.ilike(f"%{query}%"),
            models.Bills.category.ilike(f"%{query}%"),
            models.Bills.amount.cast(Text).ilike(f"%{query}%"),
            models.Bills.status.ilike(f"%{query}%")
        )
    )

    payments_query = db.query(
        models.Payments.id,
        models.Payments.vendor,
        models.Payments.category,
        models.Payments.amount,
        literal('paid').label('status'),
        models.Payments.created_at
    ).filter(
        or_(
            models.Payments.vendor.ilike(f"%{query}%"),
            models.Payments.category.ilike(f"%{query}%"),
            models.Payments.amount.cast(Text).ilike(f"%{query}%") 
        )
    )

    bills = bills_query.all()
    payments = payments_query.all()

    all_expenses = []
    for bill in bills:
        all_expenses.append({
            "id": str(bill.id),
            "vendor": bill.vendor,
            "category": bill.category,
            "amount": bill.amount,
            "status": bill.status,
            "created_at": bill.created_at
        })
    
    for payment in payments:
        all_expenses.append({
            "id": str(payment.id),
            "vendor": payment.vendor,
            "category": payment.category,
            "amount": payment.amount,
            "status": payment.status,
            "created_at": payment.created_at
        })
    
    all_expenses.sort(key=lambda x: x['created_at'], reverse=True)
    paginated = all_expenses[offset:offset + items_per_page]

    return paginated

@router.get("/expenses/pages")
def get_expenses_pages(query: str = "", items_per_page: int = 6, db: Session = Depends(get_db)):

    bills_count = db.query(func.count(models.Bills.id)).filter(
        or_(
            models.Bills.vendor.ilike(f"%{query}%"),
            models.Bills.category.ilike(f"%{query}%"),
            models.Bills.amount.cast(Text).ilike(f"%{query}%"),
            models.Bills.status.ilike(f"%{query}%")
        )
    ).scalar() or 0
    
    payments_count = db.query(func.count(models.Payments.id)).filter(
        or_(
            models.Payments.vendor.ilike(f"%{query}%"),
            models.Payments.category.ilike(f"%{query}%"),
            models.Payments.amount.cast(Text).ilike(f"%{query}%")
        )
    ).scalar() or 0
    
    total_count = bills_count + payments_count
    total_pages = (total_count + items_per_page - 1) // items_per_page
    
    return {"total_pages": total_pages}

@router.get("/expenses/by-month", response_model=List[schemas.MonthlyExpense])
def get_expenses_by_month(db: Session = Depends(get_db)):

    twelve_months_ago = datetime.now() - timedelta(days=365)

    payments_by_month = db.query(
        extract('year', models.Payments.created_at).label('year'),
        extract('month', models.Payments.created_at).label('month'),
        func.sum(models.Payments.amount).label('total_amount')
    ).filter(
        models.Payments.created_at >= twelve_months_ago
    ).group_by(
        extract('year', models.Payments.created_at),
        extract('month', models.Payments.created_at)
    ).all()

    bills_by_month = db.query(
        extract('year', models.Bills.created_at).label('year'),
        extract('month', models.Bills.created_at).label('month'),
        func.sum(models.Bills.amount).label('total_amount')
    ).filter(
        models.Bills.created_at >= twelve_months_ago
    ).group_by(
        extract('year', models.Bills.created_at),
        extract('month', models.Bills.created_at)
    ).all()

    monthly_totals = {}

    for row in payments_by_month:
        month_key = f"{int(row.year)}-{int(row.month):02d}"
        monthly_totals[month_key] = monthly_totals.get(month_key, 0) + (row.total_amount or 0)
    
    for row in bills_by_month:
        month_key = f"{int(row.year)}-{int(row.month):02d}"
        monthly_totals[month_key] = monthly_totals.get(month_key, 0) + (row.total_amount or 0)
    
    result = []
    current_date = datetime.now()

    for i in range(11, -1, -1): 
        target_date = current_date - timedelta(days=i*30)
        month_key = f"{target_date.year}-{target_date.month:02d}"
        month_name = target_date.strftime("%b")
        
        result.append({
            "month": month_name,
            "revenue": monthly_totals.get(month_key, 0) / 100
        })
    
    return result

@router.get("/bills/{bill_id}", response_model=schemas.Bills)
def get_bill(bill_id: UUID, db: Session = Depends(get_db)):
    bill = db.query(models.Bills).filter(models.Bills.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.get("/payments/{payment_id}", response_model=schemas.Payments)
def get_payment(payment_id: UUID, db: Session = Depends(get_db)):
    payment = db.query(models.Payments).filter(models.Payments.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.put("/bills/{bill_id}", response_model=schemas.Bills)
def update_bill(bill_id: UUID, bill: schemas.BillsCreate, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bills).filter(models.Bills.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    for key, value in bill.model_dump().items():
        setattr(db_bill, key, value)
    
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.delete("/bills/{bill_id}")
def delete_bill(bill_id: UUID, db: Session = Depends(get_db)):
    bill = db.query(models.Bills).filter(models.Bills.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted successfully"}

@router.get("/vendors/", response_model=List[str])
def get_vendors(db: Session = Depends(get_db)):
    payment_vendors = db.query(models.Payments.vendor).distinct().all()
    bill_vendors = db.query(models.Bills.vendor).distinct().all()
    
    all_vendors = set()
    for vendor in payment_vendors + bill_vendors:
        if vendor[0]:
            all_vendors.add(vendor[0])
    
    return sorted(list(all_vendors))

@router.get("/categories/", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    payment_categories = db.query(models.Payments.category).distinct().all()
    bill_categories = db.query(models.Bills.category).distinct().all()
    
    all_categories = set()
    for category in payment_categories + bill_categories:
        if category[0]:
            all_categories.add(category[0])
    
    return sorted(list(all_categories))

@router.put("/payments/{payment_id}", response_model=schemas.Payments)
def update_payment(payment_id: UUID, payment: schemas.PaymentsCreate, db: Session = Depends(get_db)):
    db_payment = db.query(models.Payments).filter(models.Payments.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    for key, value in payment.model_dump().items():
        setattr(db_payment, key, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: UUID, db: Session = Depends(get_db)):
    """Delete a payment"""
    payment = db.query(models.Payments).filter(models.Payments.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    db.delete(payment)
    db.commit()
    return {"message": "Payment deleted successfully"}

@router.get("/payments/all", response_model=List[schemas.Payments])
def get_all_payments(db: Session = Depends(get_db)):
    payments = db.query(models.Payments).all()
    return payments

@router.get("/bills/all", response_model=List[schemas.Bills])
def get_all_bills(db: Session = Depends(get_db)):
    bills = db.query(models.Bills).all()
    return bills

